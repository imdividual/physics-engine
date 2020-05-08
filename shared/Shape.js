var Vector = require('./Vector.js');

class Shape {

  id = 0;
  center = new Vector(0, 0);
  rot = 0;

  collided = false;

  constructor(center) {
    this.id = this.genID();
    this.center = center;
  }

  genID() {
    return Math.random().toString(36).substr(2, 9);
  }

}

module.exports = Shape;
