var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');
var Collision = require('./Collision.js');

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

function tests() {
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
  var collision = new Collision();
  var p2 = collision.projShape(xa, sh1);

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

module.exports = tests;
