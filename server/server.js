var path = require("path");
var express = require("express");
var http = require("http");
var socketIO = require("socket.io");

//create app
const publicPath = path.join(__dirname, '../public')
var port = process.env.PORT || 8080;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);


app.use(express.static(publicPath));

//Server start
server.listen(port, () => {
    console.log('_________Server start: http://localhost:' + port);
});

// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
// app.set('view engine', 'ejs');


//--------------------------
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var players = [];
var cells = [];
var lastId = 0;
// function init() {
for (var i = 0; i < 10; i++) {
    let x = getRandomArbitrary(-1120, 1120);
    let y = getRandomArbitrary(-600, 600);
    cells[i] = { id: i, x, y, r: 16, color: '#00FFA3' };
    // blobs[i] = new Blob(x, y, 16, theme.colors[random(0, theme.colors.length - 1)]);
}
lastId = cells.length;
// }

function Blob(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r
}
//Socket--------------------------

//Broadcast
// function updateUserPosition() {

function heartBeat() {
    // console.log(">heartBeat -> blobs", blobs.length);
    if (players.length !== 0) io.emit('broadcast', { players });
}
// }

function broadcastCommon(type) {
    if (players.length !== 0) {
        if (type === 'cells') {
            io.emit('broadcast', { cells });
        } else io.emit('broadcast', { players });
    }
}

setInterval(broadcastCommon('players'), 100);


//Conection
io.on('connection', socket => {
    console.log('>New connection: ', socket.id);

    socket.on('disconnect', () => {
        console.log('User was disconnected: ', socket.id);
        let index = players.findIndex(player => player.id == socket.id);
        if (index !== -1) { players.splice(index, 1); }
    })

    // socket.emit('request', /* … */); // emit an event to the socket
    // io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('start', (data) => {
        console.log(">Start: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        var player = new Blob(socket.id, data.x, data.y, data.r);
        players.push(player);

        // io.clients[sessionID].send(socket.id);
        socket.emit('yourID', { id: socket.id });
    });

    socket.on('updatePlayerPosition', (data) => {
        // console.log(">updatePlayer: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        let { x, y, r } = data;
        let index = players.findIndex(player => player.id == socket.id);
        if (index !== -1) {
            players[index].x = x;
            players[index].y = y;
            players[index].r = r;
        }
    });

    socket.on('eatCells', (smallCell) => {
        // console.log(">updatePlayer: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        let { x, y, r, id } = smallCell;
        let index = cells.findIndex(cell => cell.id == id);
        if (index !== -1) {
            socket.emit('eatCellsOK', { r });
            cells.push({ id: lastId, x, y, r: 16, color: '#00FFA3' })
            lastId = index;
            cells.splice(index, 1);
            broadcastCommon('cell')
        }
    });

    socket.on('eats', (data) => {
        console.log(">>Eats:", data)
        let index;
        if (data.myseft) {
            index = blobs.findIndex(blob => blob.id == data.uniq);
        } else index = data.uniq;
        if (blobs[index]) { blobs.splice(index, 1); };

    });
});


app.get("/", function (req, res) {
    console.log("Response: ___________________ Welcome")
    res.render("../public/welcome/index");
});

app.get("/agario", function (request, response) {
    console.log('Response: ___________________ Agario');
    response.render("../public/agario/index");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('../public/error404/error-page.html');
}); 
