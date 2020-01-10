var Shape = require('./Shape.js');

class Circle extends Shape {

  radius = 0;

  constructor(center, radius) {
    super(center);
    this.radius = radius;
  }

}

module.exports = Circle;
