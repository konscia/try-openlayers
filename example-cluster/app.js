import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import FeatureGenerator from "./../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";

const styleGenerator = new StyleGenerator();
const featureGenerator = new FeatureGenerator(4500000, 0, 0);

let distance = document.getElementById('distance');
let features = featureGenerator.generatePoints(10000);

let clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: new VectorSource({
    features: features
  })
});

let styleCache = {};
let clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    let size = feature.get('features').length;
    let style = styleCache[size];
    if (!style) {
      style = styleGenerator.circleWithText(size);
      styleCache[size] = style;
    }
    return style;
  }
});

let raster = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [raster, clusters],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

distance.addEventListener('input', function() {
  clusterSource.setDistance(parseInt(distance.value, 10));
});