'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { PickingInfo, Color } from '@deck.gl/core'
import { TripsLayer } from '@deck.gl/geo-layers'
import { SchemeBasicLayer } from './SchemeLayer/molecules'
import { characterSet, hexToRgb, schemeData } from './SchemeLayer/utils'
import { SchemeLayer, SpanLayer as _SpanLayer } from './SchemeLayer'
import './HighwayNetworkGraph.css'
import useResource from '@/hooks/useResource'
import { IoRefresh } from 'react-icons/io5'

export interface Weather {
  kokshetau: any
  astana: any
  zhanaEsil: any
}

const weatherCoordinates: Record<keyof Weather, [number, number]> = {
  kokshetau: [53.28809576612943, 69.42198074582248],
  astana: [51.19560139368029, 71.41089597871905],
  zhanaEsil: [53.204138, 66.767447],
}

type ConnectionStation = {
  id?: number
  name?: string
  latitude?: number | string | null
  longitude?: number | string | null
}

type ConnectionItem = {
  id: number
  from?: ConnectionStation | null
  to?: ConnectionStation | null
}

const HighwayNetworkGraph = () => {
  const [time, setTime] = useState(0)
  const [animation] = useState<{ id: number }>({ id: NaN })
  const [pickedSpan, setPickedSpan] = useState<PickingInfo | null>(null)
  const [zoom, setZoom] = useState<number>(2.5)
  const [weather, setWeather] = useState<Weather | null>(null)
  const connectionsResource = useResource('connections') as any
  const baseSchemeDataRef = useRef<any>(schemeData)
  const [schemeDataState, setSchemeDataState] = useState<any>(schemeData)
  const [connectionsTripsData, setConnectionsTripsData] = useState<any[]>([])

  const animate = () => {
    setTime((t) => (t + 1) % 2200)
    animation.id = window.requestAnimationFrame(animate)
  }

  const onLashClick = useCallback((p: PickingInfo) => {
    setPickedSpan(p)
    setZoom(2.2)
  }, [])

  const onSchemeClick = useCallback(
    (p: PickingInfo) => {
      if (p.object.geometry.type === 'MultiLineString') {
        onLashClick(p)
      }
    },
    [onLashClick]
  )

  const viewState = useMemo(() => {
    const latitude = !!pickedSpan
      ? Array.isArray(pickedSpan.object.properties.id)
        ? -18
        : 0
      : -6.7
    const longitude = !!pickedSpan ? 165 : 0
    const maxZoom = !!pickedSpan ? 10 : 5
    const zoom = !!pickedSpan ? 5 : 5

    return {
      latitude,
      longitude,
      zoom,
      // minZoom: 2,
      // maxZoom,
      // bearing: 0,
    }
  }, [pickedSpan])

  const getTripLineColor = (connectionId: number) => {
    // Используем разные цвета для разных соединений
    const colors = [
      [246, 255, 181], // yellow
      [140, 205, 255], // blue
      [127, 222, 122], // green
      [194, 141, 224], // purple
      [255, 181, 181], // red
    ]
    return colors[connectionId % colors.length]
  }

  const SpanLayer = useMemo(() => new _SpanLayer({ pickedSpan, zoom, visible: !!pickedSpan }), [pickedSpan, zoom])

  const layers = useMemo(() => [
    new SchemeBasicLayer({
      id: 'geojson-layer',
      data: schemeDataState as any,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      getLineWidth: 8,
      lineWidthUnits: 'meters',
      lineWidthScale: 10000,
      lineWidthMaxPixels: 13,
      getFillColor: [110, 114, 115],
      getLineColor: (f: any) => {
        const hexColor = f.properties.color
        // convert to RGB
        const rgbColor = hexColor
          ? hexToRgb(f.properties.id ? hexColor : `${hexColor}20`)
          : [0, 0, 0]

        return rgbColor as Color
      },
      getPointRadius: 6,
      pointRadiusScale: 10000,
      pointRadiusMaxPixels: 8,
      getTextAnchor: (f: any) => f.text?.textAnchor ?? 'end',
      getTextColor: [110, 114, 115],
      getText: (f: any) => f.properties.name,
      getTextAngle: (f: any) => f.text?.textAngle ?? 0,
      getTextSize: 11,
      textSizeScale: 10000,
      textSizeUnits: 'meters',
      textSizeMaxPixels: 10,
      textCharacterSet: characterSet,
      lineJointRounded: true,
      getTextPixelOffset: (f: any) => f.text?.textOffset ?? [0, 0],
      pointType: 'circle+text',
      onClick: (p: PickingInfo) => onSchemeClick(p),
      visible: !pickedSpan,
      textBillboard: false,
    }),
    new SchemeLayer({ visible: !pickedSpan, time, weather }),
    new TripsLayer({
      id: 'connections-trips',
      data: connectionsTripsData,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => getTripLineColor(d.connectionId) as unknown as Uint8Array,
      opacity: 1,
      getWidth: 8,
      widthScale: 10000,
      widthMaxPixels: 13,
      jointRounded: true,
      capRounded: true,
      trailLength: 100,
      currentTime: time,
      shadowEnabled: false,
      pickable: false,
      widthUnits: 'meters',
      visible: !pickedSpan,
    }),
    SpanLayer,
  ], [schemeDataState, pickedSpan, time, weather, connectionsTripsData, SpanLayer, onSchemeClick])

  useEffect(() => {
    const fetchData = () => {
      let localWeather: Weather = { kokshetau: {}, astana: {}, zhanaEsil: {} }
      ;(Object.keys(weatherCoordinates) as Array<keyof Weather>).map(async (key) => {
        const coords = weatherCoordinates[key]
        await fetch(
          `${process.env.REACT_APP_WEATHER_API_URL}/weather/?lat=${coords[0]}&lon=${coords[1]}&units=metric&lang=ru&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
        )
          .then((res) => res.json())
          .then((result) => {
            localWeather[key] = result
            setWeather(localWeather)
          })
      })
    }
    fetchData()
  }, [])

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(animation.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation])

  useEffect(() => {
    SpanLayer.updateAsyncState()
  }, [pickedSpan, SpanLayer])

  const parseConnections = useCallback((response: any): ConnectionItem[] => {
    if (Array.isArray(response)) {
      return response
    }
    if (Array.isArray(response?.result)) {
      return response.result
    }
    return []
  }, [])

  const loadStations = useCallback(async () => {
    try {
      const response = await connectionsResource.search({
        paging: { skip: 0, take: 1000 },
      })

      const connections = parseConnections(response)
      if (!connections.length) {
        return
      }

      const stationsMap = new Map<number, { id: number; name: string; latitude: number; longitude: number }>()

      const collectStation = (station?: ConnectionStation | null) => {
        if (!station || station.id === undefined || station.id === null) {
          return
        }
        const id = Number(station.id)
        if (!Number.isFinite(id) || stationsMap.has(id)) {
          return
        }
        const latitude = Number(station.latitude ?? 0)
        const longitude = Number(station.longitude ?? 0)
        if (!(latitude > 0 || longitude > 0)) {
          return
        }
        stationsMap.set(id, {
          id,
          name: station.name ?? `Station ${id}`,
          latitude,
          longitude,
        })
      }

      connections.forEach((connection) => {
        collectStation(connection.from)
        collectStation(connection.to)
      })

      // Смещение для координат (если используются относительные координаты схемы)
      const deltaLat = 51.1435205 - 13
      const deltaLon = 71.5626741 - (-21.5)
      
      const stationFeatures = Array.from(stationsMap.values()).map((station) => ({
        type: 'Feature',
        properties: {
          id: station.id,
          name: station.name,
          station: station.name,
          source: 'connections-station',
        },
        geometry: {
          type: 'Point',
          coordinates: [station.latitude, station.longitude, 0],
        },
        text: {
          textOffset: [15, 0],
          textAnchor: 'start',
        },
      }))

      const validConnections = connections.filter((connection) => {
        const fromId = connection.from?.id ? Number(connection.from.id) : null
        const toId = connection.to?.id ? Number(connection.to.id) : null
        return (
          fromId !== null &&
          toId !== null &&
          stationsMap.has(fromId) &&
          stationsMap.has(toId)
        )
      })

      const connectionFeatures = validConnections.map((connection) => {
        const fromId = Number(connection.from!.id!)
        const toId = Number(connection.to!.id!)
        const fromStation = stationsMap.get(fromId)!
        const toStation = stationsMap.get(toId)!

        return {
          type: 'Feature',
          properties: {
            id: connection.id,
            name: connection.from?.name && connection.to?.name
              ? `${connection.from.name} - ${connection.to.name}`
              : `Connection ${connection.id}`,
            source: 'connections-route',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [fromStation.latitude, fromStation.longitude, 0],
              [toStation.latitude, toStation.longitude, 0],
            ],
          },
        }
      })

      // Создаем данные для TripsLayer (анимация движения)
      const tripsData = validConnections.map((connection, index) => {
        const fromId = Number(connection.from!.id!)
        const toId = Number(connection.to!.id!)
        const fromStation = stationsMap.get(fromId)!
        const toStation = stationsMap.get(toId)!

        // Время анимации для каждого соединения (смещение по времени для разных маршрутов)
        const startTime = (index * 50) % 2200
        const duration = 200 // длительность прохождения маршрута
        const endTime = (startTime + duration) % 2200

        // Применяем смещение к координатам (если используются относительные координаты схемы)
        return {
          connectionId: connection.id,
          path: [
            [fromStation.latitude + deltaLat, fromStation.longitude + deltaLon],
            [toStation.latitude + deltaLat, toStation.longitude + deltaLon],
          ],
          timestamps: [startTime, endTime],
        }
      })

      setConnectionsTripsData(tripsData)

      if (!stationFeatures.length && !connectionFeatures.length) {
        return
      }

      setSchemeDataState({
        ...baseSchemeDataRef.current,
        features: [
          ...(baseSchemeDataRef.current?.features ?? []),
          //...connectionFeatures,
          //...stationFeatures,
        ],
      })
    } catch (error) {
      console.error('Failed to load connections for scheme data', error)
    }
  }, [connectionsResource, parseConnections])

  useEffect(() => {
    loadStations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={loadStations}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IoRefresh size={20} />
      </button>
      <DeckGL
        style={{ position: 'static', height: '74vh', overflow: 'hidden' }}
        initialViewState={viewState}
        controller={true}
        getTooltip={({ object }) =>
          object && (object.properties?.name || object.properties?.station)
        }
        layers={layers}
        // onViewStateChange={(e: any) => {
        //   setZoom(e.viewState.zoom)
        // }}
      />
    </div>
  )
}

export default HighwayNetworkGraph
