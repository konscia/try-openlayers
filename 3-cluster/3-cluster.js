import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source';
import {Text, Fill, Stroke, Circle, Style} from "ol/style";
import {fromLonLat} from "ol/proj";

// OL Extensions
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster.js';

//Datapedia utils
import FeatureGenerator from "./../src/FeatureGenerator";

const latRJ = -22.79831745308043;
const lonRJ = -43.90160744212326;
const center = fromLonLat([lonRJ, latRJ])

const featureGenerator = new FeatureGenerator(4500000, center[0], center[1]);

let distance = document.getElementById('distance');
let features = featureGenerator.generatePoints(100);

/**
 * Usa a classe "Cluster" do próprio Open Layers
 * Como vetor, usa as features geradas aleatoriamente
 */
let clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: new VectorSource({
    features: features
  })
});

//Um cache de estilo é importante para, no movimento do cluster, não gerar sempre e sempre novos objetos sem necessidade.
let styleCache = {};

function getStyle (feature, resolution){
  const size = feature.get('features').length;
  const cachedStyle = styleCache[size];

  if(cachedStyle) {
    return [cachedStyle];
  }

  const color = size > 25 ? "192,0,0" : size>8 ? "255,128,0" : "0,128,0";
  const radius = Math.max(8, Math.min(size*0.75, 20));
  const dash = 2 * Math.PI * radius / 6;
  const dashStyle = [ 0, dash, dash, dash, dash, dash, dash ];
  const style = styleCache[size] = new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: "rgba("+color+",0.5)",
        width: 15 ,
        lineDash: dashStyle,
        lineCap: "butt"
      }),
      fill: new Fill({
        color:"rgba("+color+",1)"
      })
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({
        color: '#fff'
      })
    })
  });

  return [style];
}

// Essa seria a camada tradicional, substituída aqui pela camada animada das extensões do Open Layers
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
    center: center,
    zoom: 2
  })
});

distance.addEventListener('input', function() {
  clusterSource.setDistance(parseInt(distance.value, 10));
});