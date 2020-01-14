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
