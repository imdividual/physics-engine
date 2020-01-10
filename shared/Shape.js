var Vector = require('./Vector.js');

class Shape {

  center = new Vector(0, 0);
  rot = 0;

  constructor(center) {
    this.center = center;
  }

}

module.exports = Shape;
