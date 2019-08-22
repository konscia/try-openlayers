import Feature from "ol/Feature";
import Point from "ol/geom/Point";

export default class FeatureGenerator {
  constructor(bound, centerLon, centerLat) {
    this.boxBound = bound;
    this.centerLon = centerLon;
    this.centerLat = centerLat;
  }

  generatePoints(numOfPoints) {
    let features = new Array(numOfPoints*2);
    for (var i = 0; i < numOfPoints * 2; ++i) {
      let point = this.generatePoint(this.boxBound);
      features[i] = new Feature(point);
      features[++i] = new Feature(point);
    }

    return features;
  }

  generatePoint(bound) {
    let coordinates = [
      this.generateCoord(bound) + this.centerLon,
      this.generateCoord(bound) + this.centerLat
    ];

    return new Point(coordinates);
  }

  generateCoord(bound) {
    return 2 * bound * Math.random() - bound;
  }
}