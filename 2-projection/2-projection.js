import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
import {Stroke} from "ol/style";
import Fill from "ol/style/Fill";

/*
 * O GeoJson do Rio de Janeiro utiliza dados em latitude e longitude tradicionais.
 * Se simplesmente carregarmos ele para o mapa, sem converter a projeção, ele só funcionará com o padrão EPSG:4326
 * O padrão do Open Layers, entretanto, é o EPSG:3857 que projeta os dados da esfera no plano cartesiano.
 * O importante é alinhar a projeção das features com aquela usada no mapa.
 */
import rj_geojson from '../geojson/rj.json'

// Conversor de GeoJson
const geojsonFormat = new GeoJSON();

/* **** EXEMPLO ESFÉRICO - EPSG:4326 - LATITUDE E LONGITUDE TRADICIONAIS **** */

const latBrazil = -22.79831745308043;
const lonBrazil = -43.90160744212326;

const source = new VectorSource({
  features: geojsonFormat.readFeatures(rj_geojson),
});

const style = new Style({
  stroke: new Stroke({
    color: 'blue',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(0, 255, 255, 0.1)'
  })
});

const layer = new VectorLayer({
  source: source,
  style:  style
});

const tiles = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [tiles, layer],
  target: 'map-lat-lon',
  view: new View({
    projection: 'EPSG:4326',
    center: [lonBrazil, latBrazil],
    zoom: 6
  })
});

/* **** EXEMPLO MERCATOR - EPSG:3857 - PADRÃO DO OPEN LAYERS **** */

const latBrazilMeters = 0;
const lonBrazilMeters = 0;

const source3857 = new VectorSource({
  features: geojsonFormat.readFeatures(rj_geojson, {
    featureProjection: 'EPSG:3857'
  }),
});

const style3857 = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(0, 255, 0, 0.1)'
  })
});

const layer3857 = new VectorLayer({
  source: source3857,
  style:  style3857
});

const tiles3857 = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [tiles3857, layer3857],
  target: 'map',
  view: new View({
    center: fromLonLat([lonBrazil, latBrazil]),
    zoom: 6
  })
});



//
//
// // 4326
// const vectorSource3857 = new VectorSource({
//   features: geojsonFormat.readFeatures(rj_geojson, {
//     // featureProjection: "EPSG:3857",
//   }),
// });
//
// const vectorLayer3857 = new VectorLayer({
//   source: vectorSource3857,
//   style:  new Style({
//     stroke: new Stroke({
//       color: 'blue',
//       width: 1
//     }),
//     fill: new Fill({
//       color: 'rgba(0, 255, 255, 0.1)'
//     })
//   })
// });
//
// new Map({
//   layers: [raster1, pseudoMercatorLayer],
//   target: 'map',
//   view: new View({
//     projection: 'EPSG:3857',
//     center: fromLonLat([lonBrazil, latBrazil]),
//     zoom: 2
//   })
// });
//
//
// // If we put the vectorLayer3857 in this Map it won't work because the projection is different
