import Feature from "ol/Feature";
import Point from "ol/geom/Point";

const centerPointMercator = 4500000;

export default class FeatureGenerator {
  generatePointsToMercatorProjection(numOfPoints) {
    let features = new Array(numOfPoints);
    for (var i = 0; i < numOfPoints; ++i) {
      features[i] = new Feature(this.generatePoint(centerPointMercator));
    }

    return features;
  }

  generatePoint(centerPoint) {
    let coordinates = [this.generateCoord(centerPoint), this.generateCoord(centerPoint)];
    return new Point(coordinates);
  }

  generateCoord(centerPoint) {
    return 2 * centerPoint * Math.random() - centerPoint;
  }
}