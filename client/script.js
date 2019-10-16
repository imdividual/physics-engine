// Chrome 1 - 71
var chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

if(!chrome) {
  throw new Error("my error message");
}


var socket = io();

import Debug from '/client/Debug.js';

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

class Entity {

  engine = null;

  rot = 0;
  pos = new Vector(0, 0);
  vel = new Vector(0, 0);
  acc = new Vector(0, 0);

  shape = null;
  sprite = null;

  constructor(engine, shape) {
    this.engine = engine;
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

  constructor(engine, shape) {
    super(engine, shape);
  }

}

class DynamicEntity extends Entity {

  constructor(engine, shape) {
    super(engine, shape);
  }

  update() {
    //this.vel.x += this.acc.x;
    //this.vel.y += this.acc.y;
    this.translate(0, -1);
    this.rotate(0.1);

    var entities = this.engine.entityManager.entities;
    for(var i = 0; i < entities.length; ++i) {
      var entity = entities[i];
      if(entity != this) {
        var collide = this.engine.entityManager.collision.detect(
          this.shape, entity.shape
        );
        console.log(collide);
        if(collide !== false) {
          this.translate(collide.x, collide.y);
        }
      }
    }


  }

}

class Collision {

  engine = null;

  constructor(engine) {
    this.engine = engine;
  }

  detect(s1, s2) {
    // console.log(s1.vertices);
    // console.log(s2.vertices);
    var edges = (s1.edges()).concat(s2.edges());

    var overlapMin = null;
    var overlapDir = null;

    // console.log(edges)
    for(var i = 0; i < edges.length; ++i) {
      var axis = edges[i].normal();
      var proj1 = axis.projShape(s1);
      var proj2 = axis.projShape(s2);
      if(!proj1.overlap(proj2)) {
        // console.log(proj1);
        // console.log(proj2);
        return false;
      } else {
        var overlap = Math.abs(
          Math.min(proj1.y, proj2.y) - Math.max(proj1.x, proj2.x)
        );
        if(overlapMin == null || overlap < overlapMin) {
          overlapMin = overlap;
          overlapDir = axis;
        }
      }
    }

    // return mtv
    var mtv = (overlapDir.normalize()).scale(overlapMin);
    return mtv;
  }

}

class EntityManager {

  entities = [];
  collision = new Collision(engine);

  update() {
    var len = this.entities.length;
    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      entity.update();
    }
    /*
    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      if(!(this.player == entity)) {
        var collide = this.collision.detect(
          this.player.shape, entity.shape
        );
        // console.log(collide);
        if(collide !== false) {
          this.player.translate(collide.x, collide.y);
        }
      }
    }
    */
  }

  add(entity) {
    this.entities.push(entity);
  }

}

class Renderer {
  engine = null;

  canvas = null;
  width = 0;
  height = 0;

  graphics = null;

  offset = null;
  center = null;

  constructor(engine) {
    this.engine = engine;
    this.canvas = canvas;
    this.graphics = this.canvas.getContext("2d");
    Debug.log({type: 'info', msg: 'draw initialized'});

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

    var entities = this.engine.entityManager.entities;
    for(var i = 0; i < entities.length; ++i) {
      var entity = entities[i];
      this.shape(entity.shape, this.offset);
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

class Input {

  keys = [];
  left = 37;
  up = 38;
  right = 39;
  down = 40;

  checkPress(key) {
    return this.keys[key] === true;
  }

  keyDown(key) {
    this.keys[key] = true;
  }

  keyUp(key){
    this.keys[key] = false;
  }

}

class Engine {

  renderer = null;
  input = null;
  entityManager = null;
  fps = null;

  constructor() {
    // init graphics
    this.renderer = new Renderer(this);
    this.input = new Input();
    // init resize event
    this.resize();
    this.entityManager = new EntityManager();
    if(Debug.active) {
      // this.fps = this.draw.text(1, 1, fps);
    }
    Debug.log({type: 'info', msg: 'engine initialized'});
  }

  // resize event
  resize() {
    // this.draw.resize(window.innerWidth, window.innerHeight);
    Debug.log({type: 'info', msg: 'window resized'});
  }

  update() {
    this.entityManager.update();
    // this.camera.update();
    // this.fps.text = Math.floor(fps);
  }

  render() {
    this.renderer.render();
  }

}

var canvas = document.getElementById('canvas')
var engine = new Engine();

var previous = 0;
var cap = 80;
var delta = 0;
var step = 1000 / cap;

var elapse = 0;
var frames = 0;
var fps = 0;
var frame = 0;

function loop(time) {
  elapse = time - previous;
  delta = elapse;
  previous = time;

  while(delta >= step) {
    engine.update();
    delta -= step;
    ++frames;
  }

  fps = frames / (elapse / 1000);
  frames = 0;

  engine.render();
  requestAnimationFrame(loop);
}

function keysDown(e) {
  e = e || window.event;
  engine.input.keyDown(e.keyCode);
}

function keysUp(e) {
  e = e || window.event;
  engine.input.keyUp(e.keyCode);
}

// testing

var caseCounter = 1;

function assert(bool) {
  if(bool) {
    console.log('test case ' + caseCounter + ': assert passed');
  } else {
    console.log('test case ' + caseCounter + ': assert failed');
  }
  ++caseCounter;
}

function approx(a, b) {
  var epsilon = 0.001;
  var delta = Math.abs(a - b);
  return delta < epsilon;
}

function test() {
  // test vector basic

  var v1 = new Vector(1, 3);
  var v2 = new Vector(3, 2);

  // 1
  assert(approx(v1.mag(), 3.16227));

  var s1 = v1.scale(3.1);

  // 2
  assert(approx(s1.x, v1.x * 3.1));
  assert(approx(s1.y, v1.y * 3.1));

  var p1 = v1.proj(v2);

  // 4
  assert(approx(p1.x, 9 / 10));
  assert(approx(p1.y, 27/ 10));

  var r1 = v1.rotate(v2, 3);
  // console.log(r1);
  // assert(approx(r1.x, -2.809843422391));
  //  assert(approx(r1.y, 1.4507859737556));

  var n1 = v1.normal();

  // 6
  assert(approx(n1.x, -0.94868329805));
  assert(approx(n1.y, 0.31622776601));
  assert(v1.dot(n1) == 0);

  var v3 = new Vector(2, 4);
  var v4 = new Vector(3, 6.6)

  // 9
  assert(v1.overlap(v3));
  assert(v4.overlap(v2));

  var vt1 = [
    new Vector(1, 2), new Vector(3,4),
    new Vector(5, 4.3), new Vector(-3, -3)
  ];
  var xa = new Vector(1, 0);
  var sh1 = new Polygon(new Vector(0, 0), vt1);
  var p2 = xa.projShape(sh1);

  // 11
  assert(p2.x == -3);
  assert(p2.y == 5);

  // test collision
  var collision = new Collision(null);

  var rec1 = new Polygon(
    new Vector(0, 0),
    [
      new Vector(-1, 1), new Vector(1, 1),
      new Vector(1, -1), new Vector(-1, -1)
    ]
  );

  var rec2 = new Polygon(
    new Vector(0, 0),
    [
      new Vector(0, 2.5), new Vector(2.5, 2.5),
      new Vector(2.5, 0), new Vector(0, 0)
    ]
  );

  // 13
  assert(collision.detect(rec1, rec2));

  var tri1 = new Polygon(
    new Vector(0, 0),
    [new Vector(0, 1), new Vector(1, -2), new Vector(-1, -2)]
  );

  var tri2 = new Polygon(
    new Vector(0, 0),
    [new Vector(0, -1), new Vector(1, 1), new Vector(1, -1)]
  );

  var tri3 = new Polygon(
    new Vector(0, 0),
    [new Vector(3, 1), new Vector(4, -2), new Vector(2, -2)]
  );

  // 14
  assert(collision.detect(tri1, tri2));
  assert(!collision.detect(tri1, tri3));

  var tri4 = new Polygon(
    new Vector(1, 11),
    [new Vector(-2, 2), new Vector(4, 6), new Vector(1, -1)]
  );

  var tri5 = new Polygon(
    new Vector(2, 22),
    [new Vector(4, 0), new Vector(-2, -1), new Vector(2, 6)]
  );

  // 16
  assert(collision.detect(tri4, tri5));

  assert((new Vector(1, 3)).overlap(new Vector(2, 4)));

  // 18
  var vecd1 = new Vector(0, 0);
  var vecd2 = new Vector(3, 4);
  assert(approx(vecd1.dist(vecd2), 5));

}

test();


function run() {
  var width = engine.renderer.width;
  var height = engine.renderer.height;

  var floor = new Polygon(
    new Vector(0, -height/2+50),
    [
      new Vector(-width/2, -height/2+100),
      new Vector(width/2, -height/2+100),
      new Vector(width/2, -height/2),
      new Vector(-width/2, -height/2),
    ]
  );
  engine.entityManager.add(new StaticEntity(engine, floor));


  var rec = new Polygon(
    new Vector(25, 25),
    [
      new Vector(0, 50),
      new Vector(50, 50),
      new Vector(50, 0),
      new Vector(0, 0),
    ]
  );
  engine.entityManager.add(new DynamicEntity(engine, rec));

  var pentagon = new Polygon(
    new Vector(150, 160),
    [
      new Vector(0, 200),
      new Vector(50, 100),
      new Vector(100, 100),
      new Vector(150, 200),
      new Vector(100, 250),
    ]
  );
  engine.entityManager.add(new DynamicEntity(engine, pentagon));

  window.addEventListener("resize", function() {engine.resize()});
  document.onkeydown = keysDown;
  document.onkeyup = keysUp;
  requestAnimationFrame(loop);
}

run();