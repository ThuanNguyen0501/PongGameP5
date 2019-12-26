
// const theme = require('../../constant/theme');

let socket = io();

var blob;
var players = [];
var cells = []
var zoom = 1;

socket.on('connect', () => { console.log('_Conected to server!', socket.id); })

socket.on('disconnect', () => { console.log('_Disconected from server!'); })

socket.on('yourID', (payload) => { blob.id = payload.id; })

socket.on('broadcast', (payload) => {
  // console.log('>>heartBeat!', payload);
  cells = payload.cells;
  players = payload.players;
})

socket.on('eatCellOK', (payload) => {
  console.log(">>eatCellOK", payload)
  let { r } = payload;
  let sum = PI * blob.r * blob.r + PI * r * r;
  blob.r = sqrt(sum / PI);
})

socket.on('youLose', (payload) => {
  console.log(">>youLose", payload)
  // let { x, y, r } = payload;
  // blob.x = x;
  // blob.y = y;
  // blob.r = r;
})





function setup() {
  //P5 handler ----------------------
  createCanvas(1120, 600);

  blob = new Blob(random(width), random(height), 64, '#FF0046');

  // for (var i = 0; i < 100; i++) {
  //   let x = random(-width, width);
  //   let y = random(-height, height);
  //   players[i] = new Blob(x, y, 16, '#00FFA3');
  //   // players[i] = new Blob(x, y, 16, theme.colors[random(0, theme.colors.length - 1)]);
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

  //Render cells
  for (let i = cells.length - 1; i >= 0; i--) {

    fill('#00FFA3 ');
    ellipse(cells[i].x, cells[i].y, cells[i].r * 2, cells[i].r * 2);

    let touch = checkComplict({ x: cells[i].x, y: cells[i].y, r: cells[i].r });
    if (touch) {
      socket.emit('eatCell', cells[i]);
    }
  }

  //Render players
  for (let i = players.length - 1; i >= 0; i--) {
    if (!players[i].id || players[i].id !== blob.id) {
      fill('#00FFA3');
      ellipse(players[i].x, players[i].y, players[i].r * 2, players[i].r * 2);

      let touch = checkComplict({ x: players[i].x, y: players[i].y, r: players[i].r });
      if (touch) {
        if (blob.r > players[i].r && players[i].live) {
          socket.emit('eatPlayer', players[i]);
        }
      }

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
  socket.emit('updatePlayerPosition', data);
  // console.log("TCL: draw -> data", data)
}

function checkComplict(other) {
  let d = p5.Vector.dist(blob.pos, createVector(other.x, other.y));
  return (d < blob.r + other.r);
}