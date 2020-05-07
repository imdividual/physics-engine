var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');
var {Entity, StaticEntity, DynamicEntity} = require('./Entity.js');

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

  // intersection of two line segments
  intersect(a1, a2, b1, b2) {
    var o1 = a1.orientation(a2, b1);
    var o2 = a1.orientation(a2, b2);
    var o3 = b1.orientation(b2, a1);
    var o4 = b1.orientation(b2, a2);
    if(o1 != o2 && o3 != o4) return true;

    // special cases
    if (o1 == 0 && b1.onseg(a1, a2)) return true;
    if (o2 == 0 && b2.onseg(a1, a2)) return true;
    if (o3 == 0 && a1.onseg(b1, b2)) return true;
    if (o4 == 0 && a2.onseg(b1, b2)) return true;

    return false;
  }

  inside(point, shape) {
    var vertices = shape.vertices;
    var count = 0;
    for(var i = 0; i < vertices.length; ++i) {
      var v1 = vertices[i];
      var v2 = (i == vertices.length-1) ? vertices[0] : vertices[i+1];
      //console.log(point);
      //console.log(v1);
      //console.log(v2);
      if(point.onseg(v1, v2)) return true;
      var result = this.intersect(point, new Vector(99999, point.y), v1, v2);
      if(result) {
        //console.log('intersected');
        // account for vertex intersection
        if(point.y == v1.y && point.y >= v2.y) ++count;
        else if(point.y == v2.y && point.y >= v1.y) ++count;
        else if(point.y != v2.y && point.y != v1.y) ++count;
      } else {
        //console.log('not intersected');
      }
    }
    return count % 2 != 0;
  }

  detect(s1, s2) {
    var edges = (s1.edges()).concat(s2.edges());

    // console.log(edges)
    for(var i = 0; i < edges.length; ++i) {
      var axis = edges[i].normal();
      var proj1 = this.projShape(axis, s1);
      var proj2 = this.projShape(axis, s2);
      if(!proj1.overlap(proj2)) {
        return false;
      }
    }

    return true;
  }

  collide(delta, entity1, entity2) {
    if(entity1 instanceof StaticEntity && entity2 instanceof StaticEntity) return false;

    if(entity1 instanceof StaticEntity && entity2 instanceof DynamicEntity) {
      var temp = entity1;
      entity1 = entity2;
      entity2 = temp;
    }

    var s1 = entity1.shape;
    var s2 = entity2.shape;
    var edges1 = s1.edges();
    var edges2 = s2.edges();

    var overlapMin = null;
    var overlapDir = null;

    // console.log(edges)
    for(var i = 0; i < edges1.length; ++i) {
      var axis = edges1[i].normal().scale(-1); // normals point inwards
      var proj1 = this.projShape(axis, s1);
      var proj2 = this.projShape(axis, s2);
      if(!proj1.overlap(proj2)) {
        // console.log(proj1);
        // console.log(proj2);
        return false;
      } else {
        var overlap =
          Math.abs(Math.min(proj1.y, proj2.y) - Math.max(proj1.x, proj2.x));
        if(overlapMin == null || overlap < overlapMin) {
          overlapMin = overlap;
          overlapDir = axis;
        }
      }
    }

    for(var i = 0; i < edges2.length; ++i) {
      var axis = edges2[i].normal(); // normals point outward
      var proj1 = this.projShape(axis, s1);
      var proj2 = this.projShape(axis, s2);
      if(!proj1.overlap(proj2)) {
        // console.log(proj1);
        // console.log(proj2);
        return false;
      } else {
        var overlap =
          Math.abs(Math.min(proj1.y, proj2.y) - Math.max(proj1.x, proj2.x));
        if(overlapMin == null || overlap < overlapMin) {
          overlapMin = overlap;
          overlapDir = axis;
        }
      }
    }

    // resolution

    var mtv = overlapDir.normalize().scale(overlapMin);
    var v1 = entity1.vel;
    var v2 = entity2.vel;

    // collided vertex
    var hits = [];
    for(var i = 0; i < s1.vertices.length; ++i) {
      var cur = s1.vertices[i];
      if(this.inside(cur, s2)) {
        hits.push(cur);
      }
    }
    for(var i = 0; i < s2.vertices.length; ++i) {
      var cur = s2.vertices[i];
      if(this.inside(cur, s1)) {
        hits.push(cur);
      }
    }
    console.log(hits.length);
    if(hits.length != 0) {
      if(!mtv.zero()) {
        if(entity2 instanceof StaticEntity) {
          var e = 0.80;
          var n = overlapDir;
          var v_ap = v1;
          var m_a = 1.0;
          var p = hits[0];
          if(hits.length >= 2) p = hits[1].add(hits[0]).scale(0.5);
          var r_ap = p.sub(s1.center);
          var i_a = 1.0;
          var j_num = -1 * (1 + e) * v_ap.dot(n);
          var j_den = 1 / m_a + Math.pow(r_ap.cross(n), 2) / i_a;
          var j = j_num / j_den;
          entity1.vel = entity1.vel.add(n.scale(j / m_a));
        } else if(entity2 instanceof DynamicEntity) {
          var e = 0.8;
          var n = overlapDir;
          var v_ab = v1.sub(v2);
          var m_a = 1.0;
          var m_b = 1.0;
          var p = hits[0];
          if(hits.length >= 2) p = hits[1].add(hits[0]).scale(0.5);
          var r_ap = p.sub(s1.center);
          var r_bp = p.sub(s2.center);
          var i_a = 1.0;
          var i_b = 1.0;

          //var v_n = v_ab.dot(n);
          //if(v_n <= 0) {
            var j_num = -1 * (1 + e) * v_ab.dot(n);
            var j_den = 1 / m_a + 1 / m_b +
                        Math.pow(r_ap.cross(n), 2) / i_a +
                        Math.pow(r_bp.cross(n), 2) / i_b;
            var j = j_num / j_den;
            entity1.vel = entity1.vel.add(n.scale(j / m_a));
            entity2.vel = entity2.vel.sub(n.scale(j / m_b));
          //}
        }
      }
    }

    if(!mtv.zero()) {
      entity1.translate(mtv.x, mtv.y);
    }

    /*

    */



      /*

      // collide vertex
      var vertex = null;
      for(var i = 0; i < s1.vertices.length; ++i) {
        var cur = s1.vertices[i];
        if(this.inside(cur, s2)) {
          vertex = cur;
          break;
        }
      }

      if(vertex != null) {
        // console.log(vertex);
        var dir = vertex.sub(s1.center).cross(v1f.sub(v1));
        if(dir > 0) entity1.avel += 0.00005 * vertex.sub(s1.center).mag() * Math.abs(v1f.sub(v1).mag());
        if(dir < 0) entity1.avel -= 0.00005 * vertex.sub(s1.center).mag() * Math.abs(v1f.sub(v1).mag());
        entity1.avel *= 0.95;
        if((dir < 0 && entity1.avel > 0) || (dir > 0 && entity1.avel < 0)) {
          entity1.avel *= -0.45;
        }
      }
      */

  }

}

module.exports = Collision;
