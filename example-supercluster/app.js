import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer} from 'ol/layer.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import FeatureGenerator from "./../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";
import SuperCluster from "ol-supercluster";

const styleGenerator = new StyleGenerator();
const featureGenerator = new FeatureGenerator(1000000, 0, 0);
const animationTime = 400;

let features = featureGenerator.generatePoints(8000);

let view = new View({
  center: [0, 0],
  zoom: 2
});

let clusterSource = new SuperCluster({
  radius: 120,
  source: new VectorSource({
    features: features
  }),
  view
});

let styleCache = {};
function getStyle (feature){
  let features = feature.get('features');
  let size = features.length;
  let index = size;
  let style = styleCache[index];
  if (!style) {
    let color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
    let radius = Math.max(8, Math.min(size*0.75, 20));
    style = styleCache[index] = styleGenerator.circleWithTextAndTrasnparentBorder(
      radius,
      size.toString(),
      color
    );
  }
  return [style];
}

// Animated cluster layer
let clusterLayer = new AnimatedCluster({
  name: 'Cluster',
  source: clusterSource,
  animationDuration: animationTime,
  style: getStyle
});

let raster = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [raster, clusterLayer],
  target: 'map',
  view
});
