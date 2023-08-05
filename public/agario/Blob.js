function Blob(x, y, r, color) {
  this.r = r;
  this.id = "";
  this.pos = createVector(x, y);
  this.vel = createVector(0, 0);
  this.color = color;

  this.show = () => {
    fill(color);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

    fill(0, 102, 153);
    textSize(14);
    text("X: " + this.pos.x, this.pos.x + 70, this.pos.y + 70);
    text("Y: " + this.pos.y, this.pos.x + 70, this.pos.y + 84);
    text("R: " + this.r, this.pos.x + 70, this.pos.y + 98);
  };

  this.update = () => {
    var newVel = createVector(mouseX - width / 2, mouseY - height / 2);
    newVel.setMag(3);
    this.vel.lerp(newVel, 0.2);
    this.pos.add(this.vel);
  };

  this.constrain = () => {
    blob.pos.x = constrain(blob.pos.x, -width, width);
    blob.pos.y = constrain(blob.pos.y, -height, height);
  };

  this.eats = (other) => {
    let d = p5.Vector.dist(this.pos, other.pos);
    if (d < this.r + other.r) {
      let sum = PI * this.r * this.r + PI * other.r * other.r;
      this.r = sqrt(sum / PI);
      return true;
    } else {
      return false;
    }
  };
}
