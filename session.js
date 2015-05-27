var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression')
var session = require('express-session');

// express

var mwCookie = cookieParser('my secret');
var mwSession = session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: true,
  store: new session.MemoryStore(),
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(mwCookie);
app.use(mwSession);


// socket.io

io.use(function(socket, next) {
  var req = socket.handshake;
  var res = {};
  mwCookie(req, res, function(err) {
    if (err) return next(err);
    mwSession(req, res, next);
  });
});

io.on('connection', function (socket) {
  // server restarted, re-auth required
  if (socket.handshake.session.user === undefined) {
    socket.emit('relogin');
    return;
  }
  socket.join(socket.handshake.session.user.UID);
});
