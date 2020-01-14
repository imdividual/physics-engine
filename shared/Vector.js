const Debug = require('../server/Debug.js');

class Vector {

  x = 0;
  y = 0;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  zero() {
    return (this.x == 0 && this.y == 0);
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }

  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  scale(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }

  // vector properties

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    if(this.zero()) {
      Debug.log({type: 'error', msg: 'vector normalize error'});
    }
    return this.scale(1 / this.mag());
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  // project vec onto this
  proj(vec) {
    if(this.zero()) {
      Debug.log({type: 'error', msg: 'vector projection error'});
    }
    var coeff = this.dot(vec) / Math.pow(this.mag(), 2);
    return this.scale(coeff);
  }

  perp(vec) {
    var p = vec.sub(this.proj(vec));
    return p;
  }

  // normalized normal
  normal() {
    var n = new Vector(-this.y, this.x);
    return n.normalize();
  }

  rotate(pivot, dr) {
    var diff = this.sub(pivot);
    var vec = new Vector(
      diff.x * Math.cos(dr) - diff.y * Math.sin(dr),
      diff.x * Math.sin(dr) + diff.y * Math.cos(dr)
    );
    vec = vec.add(pivot);
    return vec;
  }

  // interval properties

  contains(num) {
    return this.x <= num && num <= this.y;
  }

  overlap(interval) {
    /*
    console.log(this.contains(interval.x));
    console.log(this.contains(interval.y));
    console.log(interval.contains(this.x));
    console.log(interval.contains(this.y));
    */
    var bool =
      this.contains(interval.x) || this.contains(interval.y) ||
      interval.contains(this.x) || interval.contains(this.y);
      return bool;
  }

  dist(vec) {
    return Math.sqrt(
      (this.x-vec.x)*(this.x-vec.x)+(this.y-vec.y)*(this.y-vec.y));
  }

  cross(vec) {
    return this.x * vec.y - this.y * vec.x;
  }

  // direction of point to a directed line segment
  // onseg = 0
  // left = -1
  // right = 1
  // p1 and p2 are ordered
  direction(p1, p2) {
    console.log(p1 + " " + p2);
    var v1 = p2.sub(p1);
    var v2 = this.sub(p1);
    var dir = v1.cross(v2);
    if(dir == 0) return 0;
    return (dir > 0) ? -1 : 1;
  }

  // orientation of three ordered points
  // this, p1, p2
  // colinear = 0
  // clockwise = -1
  // cclockwise = 1
  orientation(p1, p2) {
    var orient = (p1.y - this.y) * (p2.x - p1.x) -
      (p1.x - this.x) * (p2.y - p1.y);
    if(orient == 0) return 0;
    return (orient > 0) ? -1 : 1;
  }

  onseg(p1, p2) {
    return this.orientation(p1, p2) == 0 &&
      this.x >= Math.min(p1.x, p2.x) && this.x <= Math.max(p1.x, p2.x) &&
      this.x >= Math.min(p1.y, p2.y) && this.x <= Math.max(p1.y, p2.y);
  }

  // check if point intersects line seg formed by p1, p2
  // point extends to +INF
  intersect(p1, p2) {
      console.log(this);
      console.log(p1);
      console.log(p2);
      console.log((p2.y - p1.y) * (this.x - p1.x) + p1.y * (p2.x - p1.x) >=
        this.y * (p2.x - p1.x));
      return
        (p2.y - p1.y) * (this.x - p1.x) + p1.y * (p2.x - p1.x) >=
          this.y * (p2.x - p1.x) &&
        this.x <= Math.max(p1.x, p2.x) &&
        this.y >= Math.min(p1.y, p2.y) && this.y <= Math.max(p1.y, p2.y);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '[' + this.x + ', ' + this.y + ']';
  }

}

module.exports = Vector;
