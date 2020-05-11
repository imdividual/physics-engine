var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');

class Entity {

  pos = new Vector(0, 0);
  vel = new Vector(0, 0);
  acc = new Vector(0, 0);

  rot = 0;
  rvel = 0;
  racc = 0;

  shape = null;
  sprite = null;

  constructor(shape) {
    this.pos = shape.center
    this.rot = shape.rot;
    this.shape = shape;
  }

  rotate(dr) {
    this.rot += dr;
    if(this.shape instanceof Polygon) {
      for(var i = 0; i < this.shape.vertices.length; ++i) {
        this.shape.vertices[i] = this.shape.vertices[i].rotate(
          this.shape.center, dr
        );
      }
    }
  }

  translate(dx, dy) {
    this.pos.x += dx;
    this.pos.y += dy;
    this.shape.center.x = this.pos.x;
    this.shape.center.y = this.pos.y;
    if(this.shape instanceof Polygon) {
      for(var i  = 0; i < this.shape.vertices.length; ++i) {
        this.shape.vertices[i].x += dx;
        this.shape.vertices[i].y += dy;
      }
    }
  }

  update() {}

}

class StaticEntity extends Entity {

  constructor(shape) {
    super(shape);
  }

}

class DynamicEntity extends Entity {

  constructor(shape) {
    super(shape);
  }

  update() {
    //this.vel.x += this.acc.x;
    //this.vel.y += this.acc.y;
    this.vel = this.vel.add(this.acc);
    this.translate(this.vel.x, this.vel.y);

    this.rvel += this.racc;
    this.rotate(this.rvel);
  }

}

module.exports = {Entity, StaticEntity, DynamicEntity};
