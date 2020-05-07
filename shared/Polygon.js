const Vector = require('./Vector.js');
const Shape = require('./Shape.js');

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
