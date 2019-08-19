import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import FeatureGenerator from "../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";
import {fromLonLat} from "ol/proj";

const lonBrazil = -49.921875;
const latBrazil = -14.6048472;

const featureGeneratorLatLon = new FeatureGenerator(15, lonBrazil, latBrazil);
const featureGeneratorPseudoMercator = new FeatureGenerator(4500000, 0, 0);

const styleGenerator = new StyleGenerator();

let pseudoMercatorLayer = new VectorLayer({
  source: new VectorSource({
    features: featureGeneratorPseudoMercator.generatePoints(100)
  }),
  style: styleGenerator.blueSmallCircle()
});

let latLonLayer = new VectorLayer({
  source: new VectorSource({
    features: featureGeneratorLatLon.generatePoints(100),
  }),
  style: styleGenerator.redSmallCircle()
});

let raster = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [raster, pseudoMercatorLayer],
  target: 'map',
  view: new View({
    projection: 'EPSG:3857',
    center: fromLonLat([lonBrazil, latBrazil]),
    zoom: 2
  })
});

new Map({
  layers: [raster, latLonLayer],
  target: 'map-lat-lon',
  view: new View({
    projection: 'EPSG:4326',
    center: [lonBrazil, latBrazil],
    zoom: 5
  })
});