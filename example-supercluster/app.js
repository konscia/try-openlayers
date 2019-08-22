import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import {Vector as VectorLayer, Tile as TileLayer} from 'ol/layer.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster.js';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import Hover from 'ol-ext/interaction/Hover';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source.js';
import FeatureGenerator from "./../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";
import SuperCluster from "ol-supercluster";
import convexHull from "ol-ext/geom/ConvexHull";
import Popup from "ol-ext/overlay/Popup";

const styleGenerator = new StyleGenerator();
const featureGenerator = new FeatureGenerator(1000000, 0, 0);
const animationTime = 400;
const maxZoomToExpandCluster = 19;

let features = featureGenerator.generatePoints(80);

features.forEach((feature) => {
  feature.set('totalValue', 100);
  feature.set('randomValue', Math.floor(Math.random()*100));
});
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
  let sumValue = 0;
  let sumTotal = 0;
  features.forEach((feature) => {
     sumValue += feature.get('randomValue');
     sumTotal += feature.get('totalValue');
  });
  let index = size+"-"+sumTotal+type;
  let style = styleCache[index];
  if (!style) {
    let color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
    let radius = Math.max(8, Math.min(size*0.75, 20));
    style = styleCache[index] = styleGenerator.circleWithTextAndTrasnparentBorder(
      radius,
      type === '%' ? Math.round(sumValue / sumTotal * 100).toString() + '%' : sumValue.toString(),
      color);
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

var type = '';
window.changeType = function(_type) {
  type = _type;
  clusterLayer.setStyle(clusterLayer.getStyle());
}

let raster = new TileLayer({
  source: new OSM()
});

var vector = new VectorLayer({ source: new VectorSource() })

let map = new Map({
  layers: [raster, vector, clusterLayer],
  target: 'map',
  view
});


// Select interaction to spread cluster out and select features
var selectCluster = new SelectCluster({
  // Point radius: to calculate distance between the features
  pointRadius: 7,
  animate: true,
  spiral: true,
  // Feature style when it springs apart
  featureStyle: function(){
    return [ styleGenerator.circleForClusterExample() ]
  }
});
map.addInteraction(selectCluster);

// On selected => get feature in cluster and show info
selectCluster.getFeatures().on(['add'], function (e){
  let zoomToFly = clusterSource.getClusterExpansionZoom(e.element);
  let features = e.element.get('features');

  if(zoomToFly <= maxZoomToExpandCluster && zoomToFly !== view.getZoom()) {
    view.animate({
      zoom: zoomToFly,
      duration: animationTime,
      center: e.element.getGeometry().getFirstCoordinate()
    });
  }

  if(features.length === 1) {
    let feature = features[0];
    let content = 'Um valor qualquer: ' + feature.get("randomValue");
    popup.show(feature.getGeometry().getFirstCoordinate(), content);
  }
});

selectCluster.getFeatures().on(['remove'], function (e){
  popup.hide();
});


var hover = new Hover({
  cursor: "pointer",
  layerFilter: function(l){
    return l===clusterLayer;
  }
});
map.addInteraction(hover);

hover.on("enter", function(e) {
  let h = e.feature.get("convexHull");
  if (!h) {
    var cluster = e.feature.get("features");
    if (cluster && cluster.length)
    {	var c = [];
      for (var i=0, f; f = cluster[i]; i++) {
        c.push(f.getGeometry().getCoordinates());
      }
      h = convexHull(c);
      e.feature.get("convexHull", h);
    }
  }

  vector.getSource().clear();
  if (h.length>2) {
    vector.getSource().addFeature (
      new Feature( new Polygon([h]) )
    );
  }
});
hover.on("leave", function(e) {
  vector.getSource().clear();
});

// Popup overlay
var popup = new Popup({
  popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
  closeBox: true,
  onshow: function() {
    // console.log("You opened the box");
  },
  onclose: function() {
    // console.log("You close the box");
  },
  positioning: 'auto',
  autoPan: true,
  autoPanAnimation: { duration: 250 }
});
map.addOverlay(popup);
