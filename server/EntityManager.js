var Vector = require('../shared/Vector.js');
var Shape = require('../shared/Shape.js');
var Circle = require('../shared/Circle.js');
var Polygon = require('../shared/Polygon.js');
var {Entity, StaticEntity, DynamicEntity} = require('./Entity.js');
var Collision = require('../server/Collision.js');

class EntityManager {

  mode = 1;

  entities = [];
  collision = new Collision();

  update(delta) {
    var len = this.entities.length;

    // reset collision parameters
    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      entity.shape.collided = false;
      entity.shape.normal = [];
      entity.shape.clips = [];
    }

    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      entity.update();
    }

    for(var i = 0; i < len; ++i) {
      var entity1 = this.entities[i];
      //if(entity1 instanceof DynamicEntity) {
        for(var j = i+1; j < len; ++j) {
          if(i != j) {
            var entity2 = this.entities[j];
            var collided = this.collision.collide(delta, entity1, entity2);
          }
        }
      //}
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

  random(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  addRandom(x, y, radius=100) {
    if(this.mode == 1) radius = 40;
    var center = new Vector(x, y);
    var vertices = [];
    var sides = this.random(3, 4);
    for(var i = 0; i < sides; ++i) {
      var angle = i * 2 * Math.PI / sides;
      var vo = new Vector(
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      );
      var v = vo.add(center);
      vertices.push(v);
    }
    console.log(vertices)
    var e = new DynamicEntity(new Polygon(center, vertices))
    if(this.mode == 1) e.acc = new Vector(0, -0.1);
    this.add(e);
  }

  locked = null;

  lock(x, y) {
    var len = this.entities.length;
    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      var click = new Vector(x, y);
      var inside = this.collision.inside(click, entity.shape);
      if(inside) {
        this.locked = entity;
        break;
      }
    }
  }

  unlock() {
    if(this.locked == null) return;
    this.locked.acc = new Vector(0, -0.1);
    this.locked = null;
  }

  move(x, y) {
    if(this.locked == null) return;
    var click = new Vector(x, y);
    var delta = click.sub(this.locked.shape.center);
    this.locked.translate(delta.x, delta.y);
    this.locked.vel = new Vector(0,0);
    this.locked.acc = new Vector(0,0);
    this.locked.rvel = 0;
    this.locked.racc = 0;
  }

  package() {
    var send = [];
    var len = this.entities.length;
    for(var i = 0; i < len; ++i) {
      send.push(this.entities[i].shape);
    }
    return send;
  }

}

module.exports = EntityManager;
