
// const theme = require('../../constant/theme');

let socket = io();

var blob;
var blobs = [];
var zoom = 1;

socket.on('connect', () => {
  console.log('_Conected to server!', socket.id);
})

socket.on('disconnect', () => {
  console.log('_Disconected from server!');
})

socket.on('yourID', (payload) => {
  // console.log('yourID: ', payload);
  blob.id = payload.id;
})

socket.on('broadcast', (payload) => {
  console.log('>>heartBeat!', payload);
  blobs = payload;
})

function setup() {
  //P5 handler ----------------------
  createCanvas(1120, 600);

  blob = new Blob(random(width), random(height), 64, '#FF0046');

  // for (var i = 0; i < 100; i++) {
  //   let x = random(-width, width);
  //   let y = random(-height, height);
  //   blobs[i] = new Blob(x, y, 16, '#00FFA3');
  //   // blobs[i] = new Blob(x, y, 16, theme.colors[random(0, theme.colors.length - 1)]);
  // }

  //Socket handler ----------------------
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    color: '#FF0046'
  }
  socket.emit('start', data);
}

function draw() {
  // strokeWeight(4);
  // stroke(51);
  background('#F3FAFF');
  //translate ra giua
  translate(width / 2, height / 2);

  //smoooth zoom
  let newZoom = 64 / blob.r;
  zoom = lerp(zoom, newZoom, 0.1);
  scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);

  //render blobs
  for (let i = blobs.length - 1; i >= 0; i--) {
    // console.log("TCL: draw -> blobs.length", blobs.length)
    // if (blobs[i].id) console.log('%c ID', 'color: white; background: green; font-size: 24px;', blobs[i].id);

    // socket.id !== id.substring(2, id.length)
    if (!blobs[i].id || blobs[i].id !== blob.id) {
      // let t = new Blob(blobs[i].x, rblobs[i].y, blobs[i].r, '#FF0046');
      // t.show();
      // if (blob.eats(t)) {
      //   socket.emit('eats', i);
      // }

      fill('#00FFA3 ');
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);
      // đang boi roi cho nay
      let params = checkComplict({ x: blobs[i].x, y: blobs[i].y, r: blobs[i].r });
      if (params.eat) {
        let data = {
          myseft: params.myseft,
          uniq: params.myseft ? blob.id : i,
        }
        if (params.myseft) {
          let result = window.confirm('You lose!');
          if (result) { window.location.reload(); }
        }
        socket.emit('eats', data);
      }
      // đang boi roi cho nay

      //   // fill(255);
      //   // textAlign(CENTER);
      //   // textSize(4);
      //   // text(id);
      // }
    }
  }

  blob.show();
  blob.update();
  blob.constrain();

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    color: '#FF0046',
  }
  socket.emit('update', data);
  // console.log("TCL: draw -> data", data)
}

function checkComplict(other) {
  let d = p5.Vector.dist(blob.pos, createVector(other.x, other.y));
  if (d < blob.r + other.r) {
    let sum = PI * blob.r * blob.r + PI * other.r * other.r;
    blob.r = sqrt(sum / PI);
    return { myseft: blob.r < other.r ? true : false, eat: true };
  } else { return false; }
}