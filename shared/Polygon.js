const Shape = require('./Shape.js');

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

module.exports = Polygon;
