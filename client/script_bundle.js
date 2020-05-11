(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var socket = io();
var entities = [];
var canvas = document.getElementById('canvas');

var Renderer = require('../shared/Renderer.js');
var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');

var renderer = new Renderer();
var entities = [];

socket.on('update', function(data) {
  this.entities = data.entities;
  renderer.render(data.entities);
});

/*
canvas.addEventListener('click', function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) - canvas.width/2;
  var y = canvas.height/2 - (event.clientY - rect.top);
  console.log("left click: " + x + " " + y);
  socket.emit('add', {x: x, y: y});
});
*/

var mousedown = false;

canvas.addEventListener('mousedown', function(e) {
  if(e.which == 1) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) - canvas.width/2;
    var y = canvas.height/2 - (event.clientY - rect.top);
    mousedown = true;
    socket.emit('lock', {x: x, y: y});
  }
});

canvas.addEventListener('mouseup', function(e) {
  if(e.which == 1) {
    mousedown = false;
    socket.emit('unlock', {});
  }
});

canvas.addEventListener('mousemove', function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) - canvas.width/2;
  var y = canvas.height/2 - (event.clientY - rect.top);
  // console.log("left click: " + x + " " + y);
  if(mousedown) socket.emit('move', {x: x, y: y});
});

canvas.addEventListener('contextmenu', function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) - canvas.width/2;
  var y = canvas.height/2 - (event.clientY - rect.top);
  // console.log("right click: " + x + " " + y);
  socket.emit('add', {x: x, y: y});
  e.preventDefault();
});

},{"../shared/Circle.js":2,"../shared/Polygon.js":4,"../shared/Renderer.js":5,"../shared/Shape.js":6,"../shared/Vector.js":7}],2:[function(require,module,exports){
var Shape = require('./Shape.js');

class Circle extends Shape {

  radius = 0;

  constructor(center, radius) {
    super(center);
    this.radius = radius;
  }

}

module.exports = Circle;

},{"./Shape.js":6}],3:[function(require,module,exports){
class Debug {

  // enables or disables reporting
  static active = true;

  static log(report) {
    if(Debug.active) {
      if(report.type === 'info') {
        console.log('message: ' + report.msg);
      } else if(report.type === 'error' || report.type === 'fatal') {
        console.log('error: ' + report.msg);
      }
    }
  }

  static set active(status) {
    Debug.active = status;
  }

}

module.exports = Debug;

},{}],4:[function(require,module,exports){
const Vector = require('./Vector.js');
const Shape = require('./Shape.js');

// polygon vertices must be counter clockwise

class Polygon extends Shape {

  vertices = []; // array of Vector

  constructor(center, vertices) {
    super(center);
    this.vertices = vertices;
    super.center = this.centroid(vertices);
    // this.translate(center.x, center.y); // WTF???
  }

  centroid(vertices) {
    var x = 0;
    var y = 0;
    var len = vertices.length;
    for(var i = 0; i < vertices.length; ++i) {
      x += vertices[i].x;
      y += vertices[i].y;
    }
    return new Vector(x/len, y/len);
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

}

module.exports = Polygon;

},{"./Shape.js":6,"./Vector.js":7}],5:[function(require,module,exports){
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

},{"../shared/Circle.js":2,"../shared/Polygon.js":4,"../shared/Shape.js":6,"../shared/Vector.js":7}],6:[function(require,module,exports){
var Vector = require('./Vector.js');

class Shape {

  id = 0;
  center = new Vector(0, 0);
  rot = 0;

  collided = false;
  normal = [];
  clips = [];

  constructor(center) {
    this.id = this.genID();
    this.center = center;
  }

  genID() {
    return Math.random().toString(36).substr(2, 9);
  }

}

module.exports = Shape;

},{"./Vector.js":7}],7:[function(require,module,exports){
const Debug = require('../shared/Debug.js');

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

  equals(vec) {
    return this.x == vec.x && this.y == vec.y;
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

},{"../shared/Debug.js":3}]},{},[1]);
