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
app.set('views', './public');
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//socket
io.on('connection', socket => {
    console.log('>New connection: ', socket.id);
    socket.on('disconnect', () => {
        console.log('User was disconnected: ', socket.id);
    })

    // socket.emit('request', /* … */); // emit an event to the socket
    // io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('mouse', (data) => {
        console.log("TCL: data", data)
        socket.broadcast.emit('mouse', data);
    }); // listen to the event
});





// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // error handler
// app.use(function (err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error404/error-page.html');
// });

app.get("/", function (request, response) {
    console.log("Response: ___________________ Welcome")
    response.render('welcome/welcome');
});

app.get("/agario", function (request, response) {
    console.log('Response: ___________________ Agario');
    response.render("agario/index");
});

