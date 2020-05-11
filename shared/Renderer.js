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

      if(shape.normal.length == 2) {
        this.graphics.strokeStyle = 'blue';
        this.graphics.lineWidth = 1;
        this.vector(shape.normal[0], shape.normal[1], offset);
        this.graphics.lineWidth = 1;
      }

      this.graphics.strokeStyle = 'green';
      this.graphics.lineWidth = 4;
      for(var i = 0; i < shape.clips.length; ++i) {
        var clip = shape.clips[i];
        if(clip.length == 1) {
          this.point(clip[0], offset, 'green');
        } else if(clip.length >= 2) {
          this.line(clip[0], clip[1], offset);
        }
      }
      this.graphics.lineWidth = 1;
  }

  line(p1, p2, offset) {
    this.graphics.beginPath();
    this.graphics.moveTo(p1.x+offset.x, -p1.y+offset.y);
    this.graphics.lineTo(p2.x+offset.x, -p2.y+offset.y);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  vector(p1, p2, offset, color='blue') {
    this.line(p1, p2, offset);
    this.point(p2, offset, color);
  }

  point(p0, offset, color='blue') {
    this.graphics.fillStyle = color;
    this.graphics.beginPath();
    this.graphics.arc(p0.x+offset.x, -p0.y+offset.y, 3, 0, 2 * Math.PI);
    this.graphics.fill();
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
