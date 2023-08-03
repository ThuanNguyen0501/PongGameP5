var path = require("path");
var express = require("express");
var http = require("http");
var socketIO = require("socket.io");
var uuidv = require("uuid/v4");

//create app
const publicPath = path.join(__dirname, "../public");
var port = process.env.PORT || 8080;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

//Server start
server.listen(port, () => {
  console.log("Server start: http://localhost:" + port);
});

// view engine setup
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", __dirname);

//Init--------------------------
function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const colours = [
  "#FF0046",
  "#FF8202",
  "#0000FE",
  "#01CFFF",
  "#FF0078",
  "#FFF602",
  "#00FFA3",
  "#00FF89",
  "#7D01E9",
  "7D01E9",
  "FFF602",
];
const _width = 1366,
  _height = 768;
var players = [];
var cells = [];
for (var i = 0; i < 10; i++) {
  let x = random(-_width, _width);
  let y = random(-_height, _height);
  cells[i] = { id: uuidv(), x, y, r: 16, color: colours[randomInt(10)] };
}

function Blob(id, x, y, r, c) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = c;
}

//Socket--------------------------
//Broadcast
setInterval(() => {
  broadcastCommon("players");
}, 100);

function broadcastCommon(type) {
  if (players.length !== 0) {
    io.emit("broadcast", { cells, players });
  }
}

//Conection
io.on("connection", (socket) => {
  // socket.emit('request', /* … */); // emit an event to the socket
  // io.emit('broadcast', /* … */); // emit an event to all connected sockets
  console.log("> New connection: ", socket.id);

  socket.on("disconnect", () => {
    console.log("> User was disconnected: ", socket.id);
    let index = players.findIndex((player) => player.id == socket.id);
    if (index !== -1) {
      players.splice(index, 1);
    }
  });

  socket.on("start", (data) => {
    // console.log(">Start: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
    var player = new Blob(socket.id, data.x, data.y, data.r, data.color);
    players.push(player);
    socket.emit("yourID", { id: socket.id });
  });

  socket.on("updatePlayerPosition", (data) => {
    // console.log(">updatePlayer: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
    let { x, y, r } = data;
    let index = players.findIndex((player) => player.id == socket.id);
    if (index !== -1) {
      players[index].x = x;
      players[index].y = y;
      players[index].r = r;
    }
  });

  socket.on("eatCell", (smallCell) => {
    let index = cells.findIndex((cell) => cell.id == smallCell.id);
    if (index !== -1) {
      cells.splice(index, 1);
      socket.emit("eatOK", { r: 16 });
      cells.push({
        id: uuidv(),
        x: random(-_width, _width),
        y: random(-_height, _height),
        r: 16,
        color: colours[randomInt(10)],
      });
    }
  });

  socket.on("eatPlayer", (guy) => {
    let { r, id } = guy;
    let index = players.findIndex((player) => player.id == guy.id);
    if (players[index]) {
      socket.emit("eatOK", { r });
      players.splice(index, 1);
      let loser = io.sockets.connected[id];
      loser.emit("youLose");
    }
  });

  socket.on("dead", (guy) => {
    let index = players.findIndex((player) => player.id == socket.id);
    if (players[index]) {
      socket.emit("youLose");
      players.splice(index, 1);
    }
  });
});

//Route
app.get("/", function (req, res) {
  res.render("../public/welcome/index");
});

app.get("/agario", function (request, response) {
  response.render("../public/agario/index");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("../public/error404/error-page.html");
});
