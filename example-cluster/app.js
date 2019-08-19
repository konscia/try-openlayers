import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import FeatureGenerator from "./../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {Circle} from "ol/style";
import Style from "ol/style/Style";

const styleGenerator = new StyleGenerator();
const featureGenerator = new FeatureGenerator(4500000, 0, 0);

let distance = document.getElementById('distance');
let features = featureGenerator.generatePoints(100);

let clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: new VectorSource({
    features: features
  })
});

let styleCache = {};

function getStyle2(feature) {
  let size = feature.get('features').length;
  return [styleGenerator.circleWithText(size)];
}

function getStyle (feature, resolution){
  var size = feature.get('features').length;
  var style = styleCache[size];
  if (!style) {
    var color = size>25 ? "192,0,0" : size>8 ? "255,128,0" : "0,128,0";
    var radius = Math.max(8, Math.min(size*0.75, 20));
    var dash = 2*Math.PI*radius/6;
    dash = [ 0, dash, dash, dash, dash, dash, dash ];
    style = styleCache[size] = new Style({
      image: new Circle({
        radius: radius,
        stroke: new Stroke({
          color: "rgba("+color+",0.5)",
          width: 15 ,
          lineDash: dash,
          lineCap: "butt"
        }),
        fill: new Fill({
          color:"rgba("+color+",1)"
        })
      }),
      text: new Text({
        text: size.toString(),
        //font: 'bold 12px comic sans ms',
        //textBaseline: 'top',
        fill: new Fill({
          color: '#fff'
        })
      })
    });
  }
  return [style];
}

// let clusters = new VectorLayer({
//   source: clusterSource,
//   style: getStyle
// });

// Animated cluster layer
let clusterLayer = new AnimatedCluster({
  name: 'Cluster',
  source: clusterSource,
  animationDuration: 500,
  style: getStyle
});

let raster = new TileLayer({
  source: new OSM()
});

new Map({
  layers: [raster, clusterLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

distance.addEventListener('input', function() {
  clusterSource.setDistance(parseInt(distance.value, 10));
});