const Debug = require('../shared/Debug.js');
const EntityManager = require('./EntityManager.js');

// for init
var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');
var {Entity, StaticEntity, DynamicEntity} = require('./Entity.js');

class Engine {
  entityManager = null;
  fps = null;

  constructor() {
    // init graphics
    this.entityManager = new EntityManager();
    if(Debug.active) {
      // this.fps = this.draw.text(1, 1, fps);
    }
    Debug.log({type: 'info', msg: 'engine initialized'});
  }

  update(delta) {
    this.entityManager.update(delta);
    // this.camera.update();
    // this.fps.text = Math.floor(fps);
  }

  init() {
    var width = 1000;
    var height = 500;

    var floor = new Polygon(
      new Vector(0, -height/2+50),
      [
        new Vector(width/2, -height/2+100),
        new Vector(-width/2, -height/2+100),
        new Vector(-width/2, -height/2),
        new Vector(width/2, -height/2),
      ]
    );
    var efloor = new StaticEntity(floor);
    this.entityManager.add(efloor);

    var wall = new Polygon(
      new Vector(width/2, height/2+50),
      [
        new Vector(width/2+100, height),
        new Vector(width/2, height),
        new Vector(width/2, -height/2),
        new Vector(width/2+100, -height/2),
      ]
    );
    var ewall = new StaticEntity(wall)
    this.entityManager.add(ewall);

    var wall2 = new Polygon(
      new Vector(-width/2, height/2+50),
      [
        new Vector(-width/2, height),
        new Vector(-width/2-100, height),
        new Vector(-width/2-100, -height/2),
        new Vector(-width/2, -height/2),
      ]
    );
    var ewall2 = new StaticEntity(wall2)
    this.entityManager.add(ewall2);

    /*
    var rec = new Polygon(
      new Vector(25, 25),
      [
        new Vector(0, 50),
        new Vector(50, 50),
        new Vector(50, 0),
        new Vector(0, 0),
      ]
    );
    var erec = new DynamicEntity(rec);
    erec.translate(0, 100);
    erec.rotate(1);
    this.entityManager.add(erec);

    this.entityManager.add(
      new DynamicEntity(new Polygon(
        new Vector(25, 25),
        [
          new Vector(0, 50),
          new Vector(50, 50),
          new Vector(50, 0),
          new Vector(0, 0),
        ]
      ))
    );

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
    var epol = new DynamicEntity(pentagon);
    epol.translate(0, 100);
    this.entityManager.add(epol);
    */

  }
}

module.exports = Engine;
