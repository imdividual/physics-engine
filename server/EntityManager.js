var {Entity, StaticEntity, DynamicEntity} = require('./Entity.js');
var Collision = require('../server/Collision.js');

class EntityManager {

  entities = [];
  collision = new Collision();

  update() {
    var len = this.entities.length;
    for(var i = 0; i < len; ++i) {
      var entity = this.entities[i];
      entity.update();
    }

    for(var i = 0; i < len; ++i) {
      var entity1 = this.entities[i];
      if(entity1 instanceof DynamicEntity) {
        for(var j = 0; j < len; ++j) {
          if(i != j) {
            var entity2 = this.entities[j];
            var collided = this.collision.collide(entity1, entity2);
          }
        }
      }
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
