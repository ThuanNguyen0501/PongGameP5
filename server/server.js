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

var blobs = [];
// function init() {
for (var i = 0; i < 5; i++) {
    let x = getRandomArbitrary(-1120, 1120);
    let y = getRandomArbitrary(-600, 600);
    blobs[i] = { x, y, r: 16, color: '#00FFA3' };
    // blobs[i] = new Blob(x, y, 16, theme.colors[random(0, theme.colors.length - 1)]);
}
// }

function Blob(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r
}
//Socket--------------------------

//Broadcast
setInterval(heartBeat, 1000);
function heartBeat() {
    // console.log(">>heartBeat -> blobs", blobs.length);
    if (blobs.length !== 0) io.emit('broadcast', blobs);
}
//Conection
io.on('connection', socket => {
    console.log('>New connection: ', socket.id);

    socket.on('disconnect', () => {
        console.log('User was disconnected: ', socket.id);
        let index = blobs.findIndex(blob => blob.id == socket.id);
        if (index !== -1) { blobs.splice(index, 1); }
    })

    // socket.emit('request', /* … */); // emit an event to the socket
    // io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('start', (data) => {
        console.log(">Start: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        var blob = new Blob(socket.id, data.x, data.y, data.r);
        blobs.push(blob);

        // socket.broadcast.emit('yourID', { id: socket.id });
        // io.clients[sessionID].send(socket.id);
        socket.emit('yourID', { id: socket.id });
    });

    socket.on('update', (data) => {
        console.log(">Update: ", socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        let { x, y, r } = data;
        let index = blobs.findIndex(blob => blob.id == socket.id);
        if (index !== -1) {
            blobs[index].x = x;
            blobs[index].y = y;
            blobs[index].r = r;
        }
    });

    socket.on('eats', (data) => {
        console.log(">>Eats:", data)

    });
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
    res.render('error404/error-page.html');
});

app.get("/", function (request, response) {
    console.log("Response: ___________________ Welcome")
    response.render("welcome/index");
});

app.get("/agario", function (request, response) {
    console.log('Response: ___________________ Agario');
    response.render("agario/index");
});

