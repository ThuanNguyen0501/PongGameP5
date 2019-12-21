var blob;

var blobs = [];
var zoom = 1;

function setup() {
  createCanvas(1120, 600);
  blob = new Blob(0, 0, 64);

  for (var i = 0; i < 100; i++) {
    let x = random(-width, width);
    let y = random(-height, height);
    blobs[i] = new Blob(x, y, 16);
  }
}

function draw() {
  background(0);
  //giu co dinh
  translate(width / 2, height / 2);
  //smoooth zoom
  let newZoom = 64 / blob.r;
  zoom = lerp(zoom, newZoom, 0.1);
  scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);
  //render blobs
  for (var i = blobs.length - 1; i >= 0; i--) {
    blobs[i].show();
    if (blob.eats(blobs[i])) {
      blobs.splice(i, 1);
    }
  }

  blob.show();
  blob.update();


}