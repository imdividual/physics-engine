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
