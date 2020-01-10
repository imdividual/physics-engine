var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');

class Collision {

  constructor() {}

  projShape(vec, shape) {
    if(shape instanceof Polygon) {
      var min = vec.dot(shape.vertices[0]);
      var max = min;
      for(var i = 1; i < shape.vertices.length; ++i) {
        var dp = vec.dot(shape.vertices[i]);
        if(dp < min) {
          min = dp;
        } else if(dp > max) {
          max = dp;
        }
      }
      return new Vector(min, max);
    }
    else if(shape instanceof Circle) {

    }
  }

  detect(s1, s2) {
    // console.log(s1.vertices);
    // console.log(s2.vertices);
    var edges = (s1.edges()).concat(s2.edges());

    var overlapMin = null;
    var overlapDir = null;

    // console.log(edges)
    for(var i = 0; i < edges.length; ++i) {
      var axis = edges[i].normal();
      var proj1 = this.projShape(axis, s1);
      var proj2 = this.projShape(axis, s2);
      if(!proj1.overlap(proj2)) {
        // console.log(proj1);
        // console.log(proj2);
        return false;
      } else {
        var overlap = Math.abs(
          Math.min(proj1.y, proj2.y) - Math.max(proj1.x, proj2.x)
        );
        if(overlapMin == null || overlap < overlapMin) {
          overlapMin = overlap;
          overlapDir = axis;
        }
      }
    }

    // return mtv
    var mtv = (overlapDir.normalize()).scale(overlapMin);
    return mtv;
  }

}

module.exports = Collision;
