import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import {Vector as VectorLayer, Tile as TileLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';

//Extensões
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import Hover from 'ol-ext/interaction/Hover';
import convexHull from "ol-ext/geom/ConvexHull";
import Popup from "ol-ext/overlay/Popup";

//Supercluster
import SuperCluster from "ol-supercluster";

//Datapedia
import FeatureGenerator from "./../src/FeatureGenerator";
import StyleGenerator from "../src/StyleGenerator";

//Parâmetros base
const styleGenerator = new StyleGenerator();
const featureGenerator = new FeatureGenerator(1000000, 0, 0);
const animationTime = 400;
const maxZoomToExpandCluster = 19;

//Gera features
let features = featureGenerator.generatePointsWithSomeOnSamePosition(1000, 2300);
features.forEach((feature) => {
  feature.set('totalValue', 100);
  feature.set('randomValue', Math.floor(Math.random()*100));
});

// VIEW - Prepara antes porque a fonte SuperCluster depende da View para calcular os agregados
let view = new View({
  center: [0, 0],
  zoom: 2
});

// SOURCE
let clusterSource = new SuperCluster({
  radius: 120,
  source: new VectorSource({
    features: features
  }),
  view
});

// STYLE
let styleCache = {};
function getStyle (feature){
  //Pega valores necessários
  let features = feature.get('features');
  let size = features.length;
  let sumValue = 0;
  let sumTotal = 0;
  features.forEach((feature) => {
     sumValue += feature.get('randomValue');
     sumTotal += feature.get('totalValue');
  });

  //Monta índice e checa o cache
  let index = size + "-" + sumTotal + type;
  if (index in styleCache) {
    return styleCache[index];
  }

  let color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
  let radius = Math.max(8, Math.min(size*0.75, 20));
  const style = styleCache[index] = styleGenerator.circleWithTextAndTrasnparentBorder(
    radius,
    type === '%' ? Math.round(sumValue / sumTotal * 100).toString() + '%' : sumValue.toString(),
    color
  );

  return [style];
}

// LAYER - Animated cluster layer
let clusterLayer = new AnimatedCluster({
  name: 'Cluster',
  source: clusterSource,
  animationDuration: animationTime,
  style: getStyle
});

// TILES
let raster = new TileLayer({
  source: new OSM()
});

// CAMADA DE VETORES - USADA PARA ÁREA DE SELEÇÃO DOS CLUSTER
const vector = new VectorLayer({ source: new VectorSource() })

// MAPA
let map = new Map({
  layers: [raster, vector, clusterLayer],
  target: 'map',
  view
});

// CAMADA POPUP - IMPORTANTE PARA O CLICK

// Popup overlay
const popup = new Popup({
  popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
  closeBox: true,
  onshow: function() { },
  onclose: function() { },
  positioning: 'auto',
  autoPan: true,
  autoPanAnimation: { duration: 250 }
});

map.addOverlay(popup);

// CLICK INTERAÇÃO

// Select interaction to spread cluster out and select features
const selectCluster = new SelectCluster({
  pointRadius: 7, // Point radius: to calculate distance between the features
  animate: true,
  spiral: true,
  featureStyle: function(){
    // Feature style when it springs apart
    return [ styleGenerator.circleForClusterExample() ]
  }
});
map.addInteraction(selectCluster);

// On selected => get feature in cluster and show info
selectCluster.getFeatures().on(['add'], function (e) {
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

// MOUSEOVER - INTERAÇÃO
const hover = new Hover({
  cursor: "pointer",
  layerFilter: (l) => l === clusterLayer
});

map.addInteraction(hover);

hover.on("enter", function(e) {
  //Verifica se já existe um "casco" para esse cluster
  let h = e.feature.get("convexHull");
  if (!h) {
    //Se não, cria.
    const cluster = e.feature.get("features");
    if (cluster && cluster.length) {
      const c = [];
      for (var i=0, f; f = cluster[i]; i++) {
        c.push(f.getGeometry().getCoordinates());
      }
      h = convexHull(c);
      e.feature.set("convexHull", h);
    }
  }

  //Limpa algo anterior que existisse na camada
  vector.getSource().clear();
  //Se tem mais do que 1 ítem, adiciona o "casco"
  if (h.length > 2) {
    vector.getSource().addFeature(new Feature(new Polygon([h])));
  }
});

// Quando o mouse sai, limpa a feature
hover.on("leave", function(e) {
  vector.getSource().clear();
});

// ABSOLUTO E PERCENTUAL - Função criada para alterar o tipo pelo console e visualizar o efeito no cluster
let type = '';
window.changeType = function(_type) {
  type = _type;
  clusterLayer.setStyle(clusterLayer.getStyle());
}