import Style from "ol/style/Style";
import {Circle as CircleStyle, Stroke, Text} from "ol/style";
import Fill from "ol/style/Fill";

export default class StyleGenerator {
  redSmallCircle() {
    return this.circle(10, '#aa3e3c');
  }

  blueSmallCircle() {
    return this.circle(10, '#4345aa');
  }

  circleWithText(size) {
    return new Style({
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
  }

  circleWithTextAndTrasnparentBorder(radius, text, color) {
    return new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: "rgba("+color+",0.5)",
          width: 2,
        }),
        fill: new Fill({
          color:"rgba("+color+",1)"
        })
      }),
      text: new Text({
        text: text,
        fill: new Fill({
          color: '#fff'
        })
      })
    });
  }

  circle(radius, color) {
    return new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: '#fff'
        }),
        fill: new Fill({
          color
        })
      })
    });
  }
}