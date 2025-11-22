import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  PickingInfo,
} from '@deck.gl/core'
import { GeoJsonLayer, IconLayer, TextLayer } from '@deck.gl/layers'
import { hexToRgb, characterSet, temperatureIcons, miscIcons } from '../utils'

interface MockStation {
  name: string
}

interface MockSpan {
  id: number
  startStation: MockStation
  endStation: MockStation
}

interface MockLash {
  id: number
  number: string
  startKm: number
  startPicket: number
  startM: number
  endKm: number
  endPicket: number
  endM: number
  threadDirection: ThreadDirection
  actualLoopFasteningTemperature: number
  wayType: { name: string }
}

const mockSpans: MockSpan[] = [
  {
    id: 1,
    startStation: { name: 'Астана' },
    endStation: { name: 'Кокшетау' },
  },
  {
    id: 2,
    startStation: { name: 'Кокшетау' },
    endStation: { name: 'Петропавловск' },
  },
]

const mockLashes: Record<number, MockLash[]> = {
  1: [
    {
      id: 11,
      number: '11A',
      startKm: 0,
      startPicket: 0,
      startM: 0,
      endKm: 2,
      endPicket: 5,
      endM: 50,
      threadDirection: 1,
      actualLoopFasteningTemperature: 18,
      wayType: { name: 'Четный' },
    },
    {
      id: 12,
      number: '12B',
      startKm: 2,
      startPicket: 5,
      startM: 50,
      endKm: 4,
      endPicket: 3,
      endM: 20,
      threadDirection: 2,
      actualLoopFasteningTemperature: -5,
      wayType: { name: 'Нечетный' },
    },
  ],
  2: [
    {
      id: 21,
      number: '21A',
      startKm: 5,
      startPicket: 0,
      startM: 0,
      endKm: 7,
      endPicket: 2,
      endM: 80,
      threadDirection: 1,
      actualLoopFasteningTemperature: 22,
      wayType: { name: 'Четный' },
    },
  ],
}

const spansApi = {
  get: async (id: number): Promise<MockSpan> =>
    Promise.resolve(mockSpans.find((span) => span.id === id) ?? mockSpans[0]),
}

const lashesApi = {
  search: async ({ filter }: any): Promise<{ result: MockLash[] }> => {
    const spanId = filter?.spanId?.operand1
    return Promise.resolve({ result: mockLashes[spanId] ?? [] })
  },
}

export type KmPckM = [number, number, number]

export enum ThreadDirection {
  Left = 1,
  Right,
}

export enum TemperatureIconType {
  Hot = 'hot',
  Cold = 'cold',
}

const BOTTOM_SPAN_OFFSET = 40

export type SpanLayerProps = _SpanLayerProps & CompositeLayerProps

export interface _SpanLayerProps {
  pickedSpan: PickingInfo | null
  zoom: number
}

export class SpanLayer extends CompositeLayer<SpanLayerProps> {
  initializeState() {
    this.setState({
      spans: [],
      lashes: [],
    })
  }

  updateState() {
    if (!this.props.visible && this.state.spans.length) {
      this.setState({
        spans: [],
        lashes: [],
      })
    }
  }

  updateAsyncState(): void {
    const { pickedSpan } = this.props || {}
    const id: number | [number | number] | null = pickedSpan?.object.properties.id || null

    const getLashes = async (spanId, index) =>
      await lashesApi
        .search({
          paging: { skip: 0 },
          filter: {
            spanId: {
              operand1: spanId,
              operator: 'equals',
            },
          },
        })
        .then(({ result }) => {
          let lashes = this.state.lashes
          lashes[index] = result
          this.setState({ lashes })
        })

    const getSpans = (ids: [number | number]) =>
      ids?.map(async (id, index) => {
        await spansApi.get(id).then((span) => {
          let spans = this.state.spans
          spans[index] = span

          this.setState({ spans })
          getLashes(span.id, index)
        })
      })

    if (Array.isArray(id)) {
      getSpans(id)
    } else if (id) {
      getSpans([id])
    }
  }

  getSpanData(span: any, lashes: any, position: 'top' | 'bottom') {
    const { zoom, pickedSpan } = this.props || {}
    const { startM, endM } = pickedSpan?.object.properties || {}

    const kmPckMToMeters = (position: KmPckM) =>
      position?.[0] * 1000 + position?.[1] * 100 + position[2] - spanStartKm * 1000
    const kmPckMToDistance = ({ startKm, startPicket, startM, endKm, endPicket, endM }) =>
      kmPckMToMeters([endKm, endPicket, endM]) - kmPckMToMeters([startKm, startPicket, startM])

    const spanStartKm = startM ? startM / 1000 : Math.min(...lashes?.map((l) => l.startKm))

    const totalLashesLength =
      !startM || !endM
        ? lashes?.reduce((acc, current) => acc + kmPckMToDistance(current), 0)
        : endM - startM

    const getCoordinatesFromMeters = (value) => (value * 100) / totalLashesLength

    const lashesCoordinates = lashes?.map((l) => {
      const startPositionMeters = kmPckMToMeters([l.startKm, l.startPicket, l.startM])
      const endPositionMeters = kmPckMToMeters([l.endKm, l.endPicket, l.endM])

      const startPositionCoordinates = getCoordinatesFromMeters(startPositionMeters)
      const endPositionCoordinates = getCoordinatesFromMeters(endPositionMeters)

      const start = position === 'top' ? startPositionCoordinates : 100 - startPositionCoordinates
      const end = position === 'top' ? endPositionCoordinates : 100 - endPositionCoordinates

      return {
        start,
        end,
      }
    })

    const lashesCoordinatesData = lashesCoordinates
      ?.map((c, index) => {
        const y =
          ((lashes[index].threadDirection === ThreadDirection.Left ? 1 : -1) * 16) / (zoom * zoom) -
          (position === 'top' ? 0 : BOTTOM_SPAN_OFFSET)

        return [
          {
            type: 'Feature',
            properties: {
              isLash: true,
              isStartLash: true,
              name: `Плеть ${lashes[index].number}`,
            },
            geometry: { type: 'Point', coordinates: [c.start, y] },
          },
          {
            properties: {
              id: lashes[index].id,
              isLash: true,
              threadDirection: lashes[index].threadDirection,
              fasteningTemperature: lashes[index].actualLoopFasteningTemperature,
              name: `Плеть ${lashes[index].number}`,
            },
            geometry: {
              type: 'MultiLineString',
              coordinates: [
                [
                  [c.start, y],
                  [c.end, y],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: { isLash: true, name: `Плеть ${lashes[index].number}` },
            geometry: { type: 'Point', coordinates: [c.end, y] },
          },
        ]
      })
      .flat()

    const lashesAdditionalData = lashesCoordinatesData
      ?.filter((l) => l.geometry.type === 'MultiLineString')
      ?.map((l) => {
        const [startX, endX] = l.geometry.coordinates?.[0].map((c) => c?.[0])
        const x = endX - (endX - startX) / 2
        const y =
          ((l.properties.threadDirection === ThreadDirection.Left ? 1 : -1) * 45) / (zoom * zoom) -
          (position === 'top' ? 0 : BOTTOM_SPAN_OFFSET)

        const lash = lashes.find((lash) => lash.id === l.properties.id) || {}
        const { startKm, startPicket, startM, endKm, endPicket, endM } = lash

        return {
          coordinates: [x, y],
          properties: {
            icon:
              l.properties.fasteningTemperature > 0
                ? TemperatureIconType.Hot
                : TemperatureIconType.Cold,
            fasteningTemperature: l.properties.fasteningTemperature,
            distance: `${startKm}км ${startPicket}пикет ${startM}м - ${endKm}км ${endPicket}пикет ${endM}м`,
          },
        }
      })

    const globalY = position === 'top' ? 0 : -BOTTOM_SPAN_OFFSET

    const lashesDividerIconsData = lashesCoordinates
      ?.map((c) => [c.start, c.end])
      .flat()
      .map((c) => ({ coordinates: [c, globalY] }))

    const lashesEvenOddData = [{ coordinates: [110, globalY], name: lashes?.[0]?.wayType.name }]

    const spanData = [
      {
        type: 'Feature',
        properties: { isLash: false, name: span.startStation.name },
        geometry: { type: 'Point', coordinates: [0, globalY] },
      },
      {
        properties: { isLash: false },
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [
              [0, globalY],
              [100, globalY],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { isLash: false, name: span.endStation.name },
        geometry: {
          type: 'Point',
          coordinates: [100, globalY],
        },
      },
      ...lashesCoordinatesData,
    ]

    return {
      spanData,
      lashesAdditionalData,
      lashesDividerIconsData,
      lashesEvenOddData,
    }
  }

  renderLayers(): Layer<{}> | LayersList | null {
    const { spans, lashes } = this.state
    const { pickedSpan, zoom } = this.props || {}

    const getIsTemperatureVisible = () => {
      const la =
        lashes?.[0]?.length > lashes?.[1]?.length ? lashes?.[0]?.length : lashes?.[1]?.length
      if (la < 10) {
        return true
      } else if (la < 20) {
        return zoom >= 3.5
      } else if (la < 50) {
        return zoom >= 4
      } else if (la < 100) {
        return zoom >= 5
      } else {
        return zoom >= 6
      }
    }

    const getIsDistanceVisible = () => {
      const la =
        lashes?.[0]?.length > lashes?.[1]?.length ? lashes?.[0]?.length : lashes?.[1]?.length
      if (la < 10) {
        return true
      } else if (la < 20) {
        return zoom >= 5
      } else if (la < 50) {
        return zoom >= 6
      } else if (la < 100) {
        return zoom >= 7
      } else {
        return zoom >= 8
      }
    }

    if (!pickedSpan || !spans.length || !lashes.length) {
      return null
    }

    const color: string = pickedSpan?.object.properties.color ?? null
    const rgbColor = hexToRgb(color)

    let spanData
    let lashesAdditionalData
    let lashesDividerIconsData
    let lashesEvenOddData

    if (spans.length > 1) {
      const sd = [
        this.getSpanData(spans?.[0], lashes?.[0], 'top'),
        this.getSpanData(spans?.[1], lashes?.[1], 'bottom'),
      ]
      spanData = [...(sd?.[0]?.spanData ?? []), ...(sd?.[1]?.spanData ?? [])]
      lashesAdditionalData = [...sd?.[0]?.lashesAdditionalData, ...sd?.[1]?.lashesAdditionalData]
      lashesDividerIconsData = [
        ...sd?.[0]?.lashesDividerIconsData,
        ...sd?.[1]?.lashesDividerIconsData,
      ]
      lashesEvenOddData = [...sd?.[0]?.lashesEvenOddData, ...sd?.[1]?.lashesEvenOddData]
    } else {
      const sd = this.getSpanData(spans?.[0], lashes?.[0], 'top')
      spanData = sd?.spanData
      lashesAdditionalData = sd?.lashesAdditionalData
      lashesDividerIconsData = sd?.lashesDividerIconsData
      lashesEvenOddData = sd?.lashesEvenOddData
    }

    return [
      new GeoJsonLayer({
        id: 'span-layer',
        data: spanData as any,
        pickable: true,
        stroked: false,
        filled: true,
        extruded: true,
        getLineColor: (f) => (f.properties?.isLash ? [0, 0, 0, 50] : rgbColor),
        getLineWidth: (f) => (f.properties?.isLash ? 14 : 30),
        lineWidthUnits: 'pixels',
        getPointRadius: (f) => (f.properties?.isLash ? 5 : 25),
        pointRadiusUnits: 'pixels',
        getText: (f) => (f.properties.isLash ? '' : f.properties.name),
        getTextColor: [51, 51, 51],
        getTextSize: 20,
        getIcon: () => ({
          url: miscIcons.divider,
          width: 840,
          height: 859,
          anchorY: 0,
        }),
        getFillColor: (f) => (f.properties?.isLash ? [80, 80, 80] : [117, 117, 117]),
        getTextPixelOffset: [0, -50],
        pointType: 'circle+text',
        getIconPixelOffset: [0, 20],
        textCharacterSet: characterSet,
      }),
      new IconLayer({
        id: 'temperature-icon-layer',
        data: lashesAdditionalData,
        getIcon: (d) => ({
          url: temperatureIcons[d.properties.icon],
          width: 512,
          height: 512,
        }),
        getSize: 40,
        getPosition: (d) => d.coordinates,
        visible: getIsTemperatureVisible(),
        billboard: true,
      }),
      new TextLayer({
        id: 'temperature-text-layer',
        data: lashesAdditionalData,
        getPosition: (d) => [d.coordinates?.[0], d.coordinates?.[1] - 5 / Math.pow(zoom, 2)],
        getText: (d) => `${d.properties.fasteningTemperature}°C`,
        getSize: 15,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'top',
        visible: getIsTemperatureVisible(),
        billboard: true,
      }),
      new IconLayer({
        id: 'divider-icon-layer',
        data: lashesDividerIconsData,
        getIcon: () => ({
          url: miscIcons.divider,
          width: 2,
          height: 500,
        }),
        sizeUnits: 'meters',
        getSize: 0.5,
        sizeScale: 1000000,
        sizeMinPixels: 200,
        getPosition: (d) => d.coordinates,
        billboard: false,
      }),
      new TextLayer({
        id: 'distance-text-layer',
        data: lashesAdditionalData,
        getPosition: (d) => [d.coordinates?.[0], d.coordinates?.[1] - 20 / Math.pow(zoom, 2)],
        getText: (d) => d.properties.distance,
        getSize: 15,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        visible: getIsDistanceVisible(),
        billboard: true,
      }),
      new TextLayer({
        id: 'lashes-even-odd-text-layer',
        data: lashesEvenOddData,
        getPosition: (d) => d.coordinates,
        getText: (d) => d.name,
        getSize: 20,
        getTextAnchor: 'start',
      }),
    ]
  }
}
