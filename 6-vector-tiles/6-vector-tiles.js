import Map from 'ol/Map';
import OSM from "ol/source/OSM";
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {VectorTile as VectorTileSource} from "ol/source";
import rj_center from "../src/rj_center";
import MVT from "ol/format/MVT";
import VectorTileLayer from "ol/layer/VectorTile";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import {Stroke} from "ol/style";
import TileState from "ol/TileState";

const urlBase = "https://datapedia-tiles.s3-sa-east-1.amazonaws.com/setores-por-municipio/3304557";
const urlMetadata = urlBase + "/metadata.json"

async function getJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

async function main() {
  const metadata = await getJson(urlMetadata);

  /*
   * Loader especial idealizado pelo fjorgemota que
   * carrega somente os titles que foram de fato criados
   * para cada município, eliminando erros 404 de request para tiles que não existem
   */
  function datapediaLoader(tile, url) {
    let parts = url.substr(0, url.length - 4).split("/");
    parts = parts.slice(parts.length - 3);

    tile.setLoader((extent, resolution, projection) => {
      let tmp = metadata.files;
      for (let part of parts) {
        if (!tmp[part]) {
          tile.setState(TileState.ERROR);
          return;
        }
        tmp = tmp[part];
      }

      fetchTitle(url, extent, tile, projection);
    });

    function fetchTitle(url, extent, tile, featureProjection) {
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then(
          (data) => {
            const format = tile.getFormat();
            const features = format.readFeatures(data, {featureProjection, extent})
            tile.setFeatures(features);
          },
          () => tile.setState(TileState.ERROR)
        );
    }
  }

  const source = new VectorTileSource({
    tileLoadFunction: datapediaLoader,
    url: `${urlBase}/{z}/{x}/{y}.pbf`,
    overlaps: false,
    minZoom: metadata.minzoom,
    maxZoom: metadata.maxzoom,
    wrapX: false,
    format: new MVT()
  });

  const layer = new VectorTileLayer({
    source,
    style: function(feature, resolution) {
      const id = feature.get('CD_GEOCODI');
      const indexColor = id % 5
      let opacity = 0;
      let displayBorders = false;
      if(resolution < 50) {
        displayBorders = true;
        opacity = 1;
      } else if(resolution < 100) {
        opacity = 1;
      } else if(resolution < 1000) {
        opacity = (1000 - resolution) / 1000;
      } else {
        opacity = 0.1;
      }

      const colors = [
        [156, 137, 184],
        [240, 166, 202],
        [239, 195, 230],
        [240, 230, 239],
        [184, 190, 221]
      ]

      const color = colors[indexColor];
      color.push(opacity)

      return new Style({
        fill: new Fill({ color }),
        stroke: displayBorders ? new Stroke({ color: [255, 255, 255, opacity / 2], width: 1 }) : null
      })
    }
  })

  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      layer
    ],
    view: new View({
      center: rj_center,
      zoom: 8
    })
  });
}

main();