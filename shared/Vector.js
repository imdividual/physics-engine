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

  copy() {
    return new Vector(this.x, this.y);
  }

  toString() {
    return '[' + this.x + ', ' + this.y + ']';
  }

}

module.exports = Vector;
