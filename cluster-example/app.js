import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import FeatureGenerator from "./FeatureGenerator";

const featureGenerator = new FeatureGenerator();
let features = featureGenerator.generatePointsToMercatorProjection(10000);

var distance = document.getElementById('distance');

var source = new VectorSource({
  features: features
});

var clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: source
});

var styleCache = {};
var clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    var size = feature.get('features').length;
    var style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#3399CC'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      });
      styleCache[size] = style;
    }
    return style;
  }
});

var raster = new TileLayer({
  source: new OSM()
});

var map = new Map({
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