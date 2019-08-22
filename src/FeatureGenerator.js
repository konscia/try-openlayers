import Feature from "ol/Feature";
import Point from "ol/geom/Point";

export default class FeatureGenerator {
  constructor(bound, centerLon, centerLat) {
    this.boxBound = bound;
    this.centerLon = centerLon;
    this.centerLat = centerLat;
  }

  generatePointsWithSomeOnSamePosition(numOfPoints, numOfFeatures) {
    let points = new Array(numOfPoints);
    for (var i = 0; i < numOfPoints; ++i) {
      points[i] = this.generatePoint(this.boxBound);
    }

    let features = new Array(numOfFeatures);
    for (i = 0; i < numOfFeatures; ++i) {
      let point = points[Math.floor(Math.random()*numOfPoints)];
      features[i] = new Feature(point);
    }

    return features;
  }

  generatePoints(numOfPoints) {
    let features = new Array(numOfPoints);
    for (var i = 0; i < numOfPoints; ++i) {
      features[i] = new Feature(this.generatePoint(this.boxBound));
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