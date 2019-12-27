let socket = io();

const colours = ['#FF0046', '#FF8202', '#0000FE', '#01CFFF', '#FF0078', '#FFF602', '#00FFA3', '#00FF89', '#7D01E9', '01CFFF', '01CFFF'];
const _width = 1120, _height = 600;
var blob;
var players = [];
var cells = []
var zoom = 1;


socket.on('connect', () => { console.log('_Conected to server!', socket.id); })

socket.on('disconnect', () => { console.log('_Disconected from server!'); })

socket.on('yourID', (payload) => { blob.id = payload.id; })

socket.on('broadcast', (payload) => {
  cells = payload.cells;
  players = payload.players;
})

socket.on('eatOK', (payload) => {
  console.log(">>eatCellOK", payload)
  let { r } = payload;
  let sum = PI * blob.r * blob.r + PI * r * r;
  blob.r = sqrt(sum / PI);
})

socket.on('youLose', (payload) => {
  console.log(">>youLose", payload)
  dead();
})

function dead() {
  var res = window.confirm(`Con gà!! Tiếp tục không?`);
  if (res) {
    blob.pos.x = randomFloat(-_width, _width);
    blob.pos.y = randomFloat(-_height, _height);
    blob.r = 64;
    blob.color = colours[randomInt(10)];
    var data = {
      x: blob.pos.x,
      y: blob.pos.y,
      r: 64,
      color: blob.color
    }
    socket.emit('start', data);
  } else { location.replace("/") }
}

function randomFloat(min, max) { return Math.random() * (max - min) + min; }

function randomInt(max) { return Math.floor(Math.random() * Math.floor(max)); }

function setup() {
  //P5 handler ----------------------
  createCanvas(1120, 600);
  blob = new Blob(random(width), random(height), 64, colours[randomInt(10)]);

  //Socket handler ----------------------
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    color: blob.color,
  }
  socket.emit('start', data);
}

function draw() {
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

    fill(cells[i].color);
    ellipse(cells[i].x, cells[i].y, cells[i].r * 2, cells[i].r * 2);

    let touch = checkComplict({ x: cells[i].x, y: cells[i].y, r: cells[i].r });
    if (touch) {
      socket.emit('eatCell', cells[i]);
    }
  }

  //Render players
  for (let i = players.length - 1; i >= 0; i--) {
    if (!players[i].id || players[i].id !== blob.id) {
      fill(players[i].color);
      ellipse(players[i].x, players[i].y, players[i].r * 2, players[i].r * 2);

      let touch = checkComplict({ x: players[i].x, y: players[i].y, r: players[i].r });
      if (touch) {
        if (blob.r > players[i].r) {
          socket.emit('eatPlayer', players[i]);
        } else {
          socket.emit('dead', players[i]);
        }
      }
    }
  }

  blob.show();
  blob.update();
  blob.constrain();

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
  }
  socket.emit('updatePlayerPosition', data);
  // console.log("draw -> data", data)
}

function checkComplict(other) {
  let d = p5.Vector.dist(blob.pos, createVector(other.x, other.y));
  return (d < blob.r + other.r);
}