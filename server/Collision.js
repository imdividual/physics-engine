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

  clip1(shape, n) {
    var len = shape.vertices.length;
    var max = -99999;
    var index = 0;
    for (var i = 0; i < len; i++) {
      var proj = n.dot(shape.vertices[i]);
      if (proj > max) {
        max = proj;
        index = i;
      }
    }

    var v = shape.vertices[index];
    var v0 = shape.vertices[(index-1+len)%len];
    var v1 = shape.vertices[(index+1)%len];

    var l = v.sub(v1).normalize();
    var r = v.sub(v0).normalize();

    var edges = {};
    if (r.dot(n) <= l.dot(n)) {
      edges.max = v;
      edges.v1 = v0;
      edges.v2 = v;
      edges.edge = v.sub(v0);
    } else {
      edges.max = v;
      edges.v1 = v;
      edges.v2 = v1;
      edges.edge = v1.sub(v);
    }

    return edges;
  }

  clip2(v1, v2, n, o) {
    var cp = [];
    var d1 = n.dot(v1) - o;
    var d2 = n.dot(v2) - o;
    // console.log(d1);
    // console.log(d2);
    if(d1 >= 0) cp.push(v1);
    if(d2 >= 0) cp.push(v2);
    if(d1 * d2 < 0) {
      var e = v2.sub(v1);
      var u = d1 / (d1 - d2);
      e = e.scale(u).add(v1);
      cp.push(e);
    }
    return cp;
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
      var axis = edges1[i].normal();
      var proj1 = this.projShape(axis, s1);
      var proj2 = this.projShape(axis, s2);
      if(!proj1.overlap(proj2)) {
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
      var axis = edges2[i].normal();
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

    // correct normal direction
    var cacb = s2.center.sub(s1.center);
    if(cacb.dot(overlapDir) < 0) {
      overlapDir = overlapDir.scale(-1);
    }

    var mtv = overlapDir.scale(-1).normalize().scale(overlapMin)
    var n = overlapDir;

    s1.collided = true;
    s2.collided = true;

    if(mtv.zero()) return;

    // clipping algorithm

    var e1 = this.clip1(s1, n);
    var e2 = this.clip1(s2, n.scale(-1));

    var ref = null;
    var inc = null;
    var flip = false;
    if(Math.abs(e1.edge.dot(n)) <= Math.abs(e2.edge.dot(n)) && !(entity2 instanceof StaticEntity)) {
      ref = e1;
      inc = e2;
    } else {
      ref = e2;
      inc = e1;
      flip = true;
    }

    // s1.clip0 = [inc.v1, inc.v2, ref.v1, ref.v2];

    // console.log(ref);
    var refv = ref.edge.normalize();

    var o1 = refv.dot(ref.v1);
    var cp1 = this.clip2(inc.v1, inc.v2, refv, o1);
    // console.log(cp1);
    if(cp1.length < 2) return;

    var o2 = refv.dot(ref.v2);
    var cp2 = this.clip2(cp1[0], cp1[1], refv.scale(-1), -o2);
    // console.log(cp2);
    if(cp2.length < 2) return;

    var refn = new Vector(ref.edge.y * -1, ref.edge.x);
    // if(flip) refn.scale(-1);
    var max = refn.dot(ref.max);

    var cp = [];
    var rm0 = (refn.dot(cp2[0]) - max) < 0;
    var rm1 = (refn.dot(cp2[1]) - max) < 0;
    if(!rm0) cp.push(cp2[0]);
    if(!rm1) cp.push(cp2[1]);

    // console.log(cp);
    s1.clips.push(cp);
    s1.normal = [s1.center, s1.center.add(mtv)];

    var p = null;
    if(cp.length == 0) return;
    if(cp.length == 1) {
      p = cp[0];
    } else if(cp.length == 2) {
      p = new Vector((cp[0].x + cp[1].x) / 2, (cp[0].y + cp[1].y) / 2);
    }

    var v1 = entity1.vel;
    var v2 = entity2.vel;

    if(entity2 instanceof StaticEntity) {
      var e = 0.80;
      var cn = overlapDir.scale(-1);
      var v_ap = v1;
      var m_a = 1.0;
      var r_ap = p.sub(s1.center);
      var i_a = 4000.0;
      var j_num = -1 * (1 + e) * v_ap.dot(cn);
      var j_den = 1 / m_a + Math.pow(r_ap.cross(cn), 2) / i_a;
      var j = j_num / j_den;
      entity1.vel = entity1.vel.add(cn.scale(j / m_a));
      console.log(v_ap);
      console.log(cn);
      console.log(v_ap.dot(cn));
      // console.log(r_ap);
      // console.log(r_ap.cross(cn));
      console.log(j_num + " " + j_den);
    }
    else if(entity2 instanceof DynamicEntity) {
      var e = 0.8;
      var n = overlapDir;
      var v_ab = v1.sub(v2);
      var m_a = 1.0;
      var m_b = 1.0;
      var r_ap = p.sub(s1.center);
      var r_bp = p.sub(s2.center);
      var i_a = 4000.0;
      var i_b = 4000.0;

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
      entity2.translate(-mtv.x, -mtv.y);
    }
    entity1.translate(mtv.x, mtv.y);
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
