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

  // 19
  var p3 = new Vector(0, 1);
  var p4 = new Vector(-4, 1);
  var p5 = new Vector(-2, 0);
  var tri6 = new Polygon(
    new Vector(0, 0),
    [new Vector(0, 0), new Vector(2, 1), new Vector(-2, 2)]
  );
  assert(collision.inside(p3, tri6));
  assert(!collision.inside(p4, tri6));
  assert(!collision.inside(p5, tri6));

  var s1 = new Polygon(new Vector(11, 6.5), [new Vector(14, 9), new Vector(8, 9), new Vector(8, 4), new Vector(14, 4)]);
  var s2 = new Polygon(new Vector(8, 3.5), [new Vector(12, 5), new Vector(4, 5), new Vector(4, 2), new Vector(12, 2)]);
  var n = new Vector(0, -1);
  var e1 = collision.clip1(s1, n);
  var e2 = collision.clip1(s2, n.scale(-1));

  var ref = null;
  var inc = null;
  var flip = false;
  if(Math.abs(e1.edge.dot(n)) <= Math.abs(e2.edge.dot(n))) {
    ref = e1;
    inc = e2;
  } else {
    ref = e2;
    inc = e1;
    flip = true;
  }

  var refv = ref.edge.normalize();
  var o1 = refv.dot(ref.v1);

  console.log(ref.max + " " + ref.v1 + " " + ref.v2 + " " + ref.edge);
  console.log(inc.max + " " + inc.v1 + " " + inc.v2 + " " + inc.edge);
  console.log(refv.toString());
  console.log(o1);
  var cp1 = collision.clip2(inc.v1, inc.v2, refv, o1);
  console.log(cp1);
  var o2 = refv.dot(ref.v2);
  console.log(o1);
  var cp2 = collision.clip2(cp1[0], cp1[1], refv.scale(-1), -o2);
  console.log(cp2);
  if(cp2.length < 2) return;

  var refn = new Vector(refv.y * -1, refv.x);
  var max = refn.dot(ref.max);
  // if(flip) refn.scale(-1);
  console.log(flip);
  console.log(refn.toString());
  console.log(max);

  var cp = [];
  var rm0 = (refn.dot(cp2[0]) - max) < 0;
  var rm1 = (refn.dot(cp2[1]) - max) < 0;
  if(!rm0) cp.push(cp2[0]);
  if(!rm1) cp.push(cp2[1]);

  s1.clip = cp;
  console.log(cp);

  var max = refn.dot(ref.max);
}

module.exports = tests;
