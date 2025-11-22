import { CompositeLayer, CompositeLayerProps, Layer, LayersList } from '@deck.gl/core'
import { IconLayer, TextLayer } from '@deck.gl/layers'
import { TripsLayer } from '@deck.gl/geo-layers'
import { miscIcons, tripsData } from '../utils'
import { Weather } from '../../HighwayNetworkGraph'

/** All properties supported by SchemeBasicLayer */
export type SchemeLayerProps = _SchemeLayerProps & CompositeLayerProps

/** Properties added by SchemeBasicLayer */
export interface _SchemeLayerProps {
  time: number
  weather: Weather | null
}

export enum WeatherIconType {
  Sunny = 'sunny',
  Rain = 'rain',
  Storm = 'storm',
  Cloudy = 'cloudy',
}

export class SchemeLayer extends CompositeLayer<SchemeLayerProps> {
  initializeState() {
    this.setState({
      weatherData: [],
    })
  }

  getIconUrl = (weather) =>
    weather?.weather[0].icon
      ? `http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
      : miscIcons.transparent

  renderLayers(): Layer<{}> | LayersList | null {
    const { weather } = this.props || {}

    const weatherData = weather
      ? [
          {
            coordinates: [-40, 10],
            properties: {
              icon: this.getIconUrl(weather.zhanaEsil),
              name: weather.zhanaEsil.name,
              temp: weather.zhanaEsil.main.temp,
            },
          },
          {
            coordinates: [0, 20],
            properties: {
              icon: this.getIconUrl(weather.kokshetau),
              name: weather.kokshetau.name,
              temp: weather.kokshetau.main.temp,
            },
          },
          {
            coordinates: [15, -6],
            properties: {
              icon: this.getIconUrl(weather.astana),
              name: weather.astana.name,
              temp: weather.astana.main.temp,
            },
          },
        ]
      : []

    const weatherTextData = weatherData
      .map(({ coordinates, properties }) => [
        { coordinates, text: properties.name, offset: [0, 25] },
        { coordinates, text: `${properties.temp}°C`, offset: [0, 40] },
      ])
      .flat()

    const getTripLineColor = (vendor: number) => {
      switch (vendor) {
        case 0:
          return [246, 255, 181] // yellow
        case 1:
          return [140, 205, 255] // blue
        case 2:
          return [127, 222, 122] // green
        case 3:
          return [194, 141, 224] // purple
        default:
          return [246, 255, 181]
      }
    }
    return [
      new TripsLayer({
        id: 'trips',
        data: tripsData,
        getPath: (d) => d.path,
        getTimestamps: (d) => d.timestamps,
        getColor: (d) => getTripLineColor(d.vendor) as unknown as Uint8Array,
        opacity: 1,
        getWidth: 8,
        widthScale: 10000,
        widthMaxPixels: 13,
        jointRounded: true,
        capRounded: true,
        trailLength: 100,
        currentTime: this.props.time,
        shadowEnabled: false,
        pickable: false,
        widthUnits: 'meters',
      }),
      new IconLayer({
        id: 'weather-icon-layer',
        data: weatherData,
        getIcon: (d) => ({
          url: d.properties.icon,
          width: 200,
          height: 200,
        }),
        getPosition: (d) => d.coordinates,
        getSize: 7,
        sizeScale: 10,
      }),
      new TextLayer({
        id: 'weather-text-layer',
        data: weatherTextData,
        getText: (d) => d.text,
        getPixelOffset: (d) => d.offset,
        getAlignmentBaseline: 'top',
        getSize: 10,
        getPosition: (d) => d.coordinates,
        getColor: [110, 114, 115],
      }),
    ]
  }
}
SchemeLayer.layerName = 'SchemeLayer'
