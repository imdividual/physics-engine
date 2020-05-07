var socket = io();
var entities = [];
var canvas = document.getElementById('canvas');

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

  // idk the exact why
  projShape(shape) {
    if(shape instanceof Polygon) {
      var min = this.dot(shape.vertices[0]);
      var max = min;
      for(var i = 1; i < shape.vertices.length; ++i) {
        var dp = this.dot(shape.vertices[i]);
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

class Shape {

  center = new Vector(0, 0);
  rot = 0;

  constructor(center) {
    this.center = center;
  }

}

class Circle extends Shape {

  radius = 0;

  constructor(center, radius) {
    super(center);
    this.radius = radius;
  }

}

class Polygon extends Shape {

  vertices = []; // array of Vector

  constructor(center, vertices) {
    super(center);
    this.vertices = vertices;
    // this.translate(center.x, center.y); // WTF???
  }

  edges() {
    var len = this.vertices.length;
    var edges = [];
    edges.push(this.vertices[0].sub(this.vertices[len-1]));
    for(var i = 1; i < len; ++i) {
      var edge = this.vertices[i].sub(this.vertices[i-1]);
      edges.push(edge);
    }
    return edges;
  }

  translate(dx, dy) {
    for(var i  = 0; i < this.vertices.length; ++i) {
      this.vertices[i].x += dx;
      this.vertices[i].y += dy;
    }
  }

  copy() {

  }

}

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

  render() {
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
      this.polygon(shape.vertices, offset);
    //}
  }

  polygon(points, offset) {
    this.graphics.fillStyle = 'red';
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
    this.graphics.fill();
    // console.log(offset);
  }

}

var renderer = new Renderer();

socket.on('update', function(data) {
  entities = data.entities;
  renderer.render();
});

function onclick(event) {
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) - canvas.width/2;
  var y = canvas.height/2 - (event.clientY - rect.top);
  console.log(x + " " + y);
  socket.emit('add', {x: x, y: y});
}

document.addEventListener("click", onclick);
