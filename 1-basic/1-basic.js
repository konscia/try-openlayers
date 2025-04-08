import Map from 'ol/Map';
import OSM from "ol/source/OSM";
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {fromLonLat} from "ol/proj";

new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([37.41, 8.82]),
    zoom: 4
  })
});