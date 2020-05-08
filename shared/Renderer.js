var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');

class Renderer {
  canvas = null;
  width = 0;
  height = 0;

  graphics = null;

  offset = null;
  center = null;

  constructor() {
    this.canvas = canvas;
    this.graphics = this.canvas.getContext("2d");

    this.canvas.width = Math.max(600, window.innerWidth);
    this.canvas.height = Math.max(400, window.innerHeight);
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.offset = new Vector(this.width/2, this.height/2);
  }

  render(entities) {
    var width = this.canvas.offsetWidth;
    var height = this.canvas.offsetHeight;
    this.graphics.clearRect(0, 0, width, height);
    this.graphics.fillStyle = "#eeeeee";
    this.graphics.fillRect(0, 0, width, height);

    for(var i = 0; i < entities.length; ++i) {
      var entity = entities[i];
      this.shape(entity, this.offset);
    }
  }

  resize() {

  }

  text(x, y, msg) {

  }

  shape(shape, offset) {
    //if(shape instanceof Polygon) {
      if(shape.collided)
        this.graphics.strokeStyle = 'red';
      else
        this.graphics.strokeStyle = 'black';
      this.polygon(shape.vertices, offset);
    //}
  }

  polygon(points, offset) {
    this.graphics.beginPath();
    this.graphics.moveTo(
      points[0].x + offset.x,
      -points[0].y + offset.y
    );
    for(var i = 1; i < points.length; ++i) {
      this.graphics.lineTo(
        points[i].x + offset.x,
        -points[i].y + offset.y
      );
    }
    this.graphics.closePath();
    this.graphics.stroke();
    // console.log(offset);
  }

}

module.exports = Renderer;
