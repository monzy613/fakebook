var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require ('mongoose');
var fs = require ('fs');
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/user_db');
var session = require ('express-session');
var multer = require ('multer');

var users_login_model = require ('./models/user')[0];
var users_info_model = require ('./models/user')[1];
var users_state_model = require ('./models/user')[2];
var users_friend_model = require ('./models/user')[3];
var users_gallery_model = require ('./models/user')[4];
var users_position_model = require ('./models/user')[5];


var routes = require ('./routes/index');
var users = require('./routes/users');






var app = express();
//app.use (session ({secret: 'monzy zhang', cookie: {maxAge: 60000}}));
//app.use(express.cookieParser());//开启cookie
//app.use(express.session({//开启session
//    secret: config.session_secret
//}));
//app.use(app.router);
////////
var chattingServer = require ('http').Server (app);
var io = require ('socket.io')(chattingServer);




var mwCookie = cookieParser('my secret');
var mwSession = session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: true,
  store: new session.MemoryStore(),
});



// app.post ('/galleryUploader', function (req, res) {
//   fileMulter.dest = './';
//   console.log ('path changed ' + fileMulter.dest);
//   res.end ();
// });



//file


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(mwCookie);
app.use(mwSession);



var fileMulter = multer({
  rename: function (fieldname, filename, req, res) {
    console.log ('fieldname: ' + fieldname + ' filename: ' + filename);
    return  fieldname;
  },
  changeDest: function (dest, req) {
    console.log ('changedest: ' + req.session.user.username);
    dest = 'public/images/uploads/galleries/' + req.session.user.username + '/';
    try {
      fs.mkdirSync (dest);
      console.log ("mkdir success: " + req.session.user.username);
    } catch (ex) {
      console.log (dest + '[already exists]');
    }
    return dest;
  },
  onFileUploadComplete: function (file, req, res) {
    console.log ('extension: ' + file.path);
    var username = req.session.user.username;
    users_gallery_model.find ({ _id: username}, function (err, docs) {
      if (!err) {
        if (docs.length === 0) {
          console.log ('user not found');
        } else {
          var filenames = docs[0].filenames;
          var filename = path.join ('images', 'uploads', 'galleries', username, file.name);
          filenames.push (filename);
          users_gallery_model.update ({_id: username}, {$set: {filenames: filenames}}, function (err2, docs2) {});
        }
      } else {
        console.log ('ERR: ' + err);
      }
    });
  }
});




app.use(fileMulter);



// socket.io

io.use(function(socket, next) {
  var req = socket.handshake;
  var res = {};
  mwCookie(req, res, function(err) {
    if (err) return next(err);
    mwSession(req, res, next);
  });
});


chattingServer.listen (3000);


function getAllNames () {
	return clients.map (function (socket) {
		return socket._name;
	});
}

function getAllStates (username, socket) {
    users_state_model.find ({_id: username}, function (err, docs) {
        if (!err) {
          var filenames = docs[0].filenames;
          if (filenames.length === 0) {

          } else {
            var fileContents = [];
            console.log ("FILEs: " + filenames);
            for (var i = 0; i < filenames.length; ++i) {
              fileContents.push (fs.readFileSync (filenames[i]).toString ());
            }
            socket.emit ("gethistorystatesfromserver", fileContents);
          }
        } else {
            console.log ('ERROR: ' + err);
        }
    });
}

function getAllUsersNicknamed (search_key, socket) {
  users_info_model.find ({nickname: search_key}, function (err, docs) {
    if (!err) {
      var usersFound = docs;
      if (usersFound.length > 0) {
        console.log ('USERS FIND: ' + usersFound);
        socket.emit ('getSearchResultFromServer', usersFound);
      } else {
        console.log ('holy shit');
      }
    } else {
      console.log ('ERROR-IN-SEARCH:' + err);
    }
  });
}

function getAllFriendApply (username, socket) {
  users_friend_model.find ({_id: username}, function (err, docs) {
    if (!err) {
      if (docs.length !== 0) {
        var applied_by = docs[0].applied_by;
        console.log ("APPLIED_BY: " + applied_by);
        socket.emit ('getAppliersIDFromServer', applied_by);
      } else {
        console.log (username + ' not found in users_friend_model');
      }
    } else {
      console.log ('ERROR_FROM_[getAllFriendApply] ' + err);
    }
  });
}

function getAllFriendsOf (username, socket) {
  users_friend_model.find ({_id: username}, function (err, docs) {
    if (!err) {
      if (docs.length !== 0) {
        var friends = docs[0].friends_ids;
        console.log ("Friends: " + friends);
        socket.emit ('getFriendListFromServer', friends);
      } else {
        console.log (username + ' not found in users_friend_model');
      }
    } else {
      console.log ('ERROR_FROM_[getAllFriendsOf] ' + err);
    }
  });
}

function getGalleryOf (username, socket) {
  users_gallery_model.find ({_id: username}, function (err, docs) {
    if (!err) {
      if (docs.length !== 0) {
        var filenames = docs[0].filenames;
        console.log ("Gallery: " + filenames);
        socket.emit ('getGalleryFromServer', filenames);
      } else {
        console.log (username + ' not found in users_gallery_model');
      	var doc_gallery = {
      		_id: username,
      		filenames: new Array()
      	};
        users_gallery_model.create (doc_gallery, function (err_in_insert_gallery) {
          if (!err_in_insert_gallery) {
            console.log ('established');
          }
        });
      }
    } else {
      console.log ('ERROR_FROM_[getGalleryOf] ' + err);
    }
  });
}




//longitude, latitude0.02
/*       {$and: [
          {$and: [{longitude: {$lte: data.longitude + 0.02}}, {latitude: {$lte: data.latitude + 0.02}}]},
          {$and: [{longitude: {$gte: data.longitude - 0.02}}, {latitude: {$gte: data.latitude - 0.02}}]}
         ]}
*/

function getPeopleAround (username, nickname, data, socket) {
  console.log ("getPeopleAround");
  var options = {upsert: true};
  users_position_model.update({_id: username}, {$set: {nickname: nickname, longitude: data.longitude, latitude: data.latitude}}, options, function(err) {
    users_position_model.find (
      {$and: [
          {$and: [{longitude: {$lte: data.longitude + 0.02}}, {latitude: {$lte: data.latitude + 0.02}}]},
          {$and: [{longitude: {$gte: data.longitude - 0.02}}, {latitude: {$gte: data.latitude - 0.02}}]}
      ]}, function (err, docs) {
      if (!err) {
        if (docs.length !== 0) {
          socket.emit('peopleAround', docs.filter(function(people) {return people._id !== username}));
        } else {
          console.log ("no people around");
        }
      } else {

      }
    }
)  });
}



function onListChanged () {
	io.emit ('list_changed', getAllNames ());
}
// public/a.js
app.use (express.static ('public'));

var clients = [];
io.on ('connection', function (socket) {
	onListChanged ();
	clients.push (socket);
	socket.on ('changename', function (name) {
		socket._name = name;
    console.log ("CHANGENAME: " + name);
		onListChanged ();
	});
	socket.on ('disconnect', function () {
		for (var i = clients.length - 1; i >= 0; --i) {
			if (clients[i] === socket) {
				console.log ('---[' + socket._name + ']---DISCONNECT');
				clients.splice (i, 1);
				onListChanged ();
				break;
			}
		}
		onListChanged ();
	});

  socket.on ('gethistorystates', function (data) {
    console.log ("gethistorystates: " + data.some);
    getAllStates (socket.handshake.session.user.username, socket);
  });

  socket.on ('getSearchRequest', function (data) {
    //var req = socket.handshake;
    getAllUsersNicknamed (socket.handshake.session.search_key, socket);
  });

  socket.on ('friendManagement', function (data) {
    getAllFriendApply (socket.handshake.session.user.username, socket);
  });

  socket.on ('getFriendList', function (data) {
    getAllFriendsOf (socket.handshake.session.user.username, socket);
  });

  socket.on ('getGallery', function (data) {
    getGalleryOf (socket.handshake.session.user.username, socket);
  });

  socket.on ("sendPositionToServer", function (data) {
    console.log ("Position get from: " + data.username + ": (" + data.longitude + ", " + data.latitude + ").");
    getPeopleAround(socket.handshake.session.user.username, socket.handshake.session.user.nickname, data, socket);
  });



  //ios use
  socket.on ('comment', function (data) {
    console.log(data.username + "+" + data.content);
    io.emit ('comment', {username: data.username, content: data.content});
  })

  //ios use
  socket.on ('p2pchat', function (data) {
    console.log("ios_p2pchat: " + data.from_id + ", " + data.to_id + ", " + data.msg);
    p2pSender(data.from_id, data.to_id, data.msg);
  });

});


/// /comment ->> see index.html
app.get ('/comment', function (req, res) {
  var username = req.query.username;
  var content = req.query.text;
	io.emit ('comment', {username: username, content: content});
	console.log (req.query.text + ", " + req.query.username);
	res.end ();
});

/////////

app.post ('/p2pchat', function (req, res) {
  // var p2pchat_packege = {
  //   from_id: req.session.user.username,
  //   to_id: req.body.friendID,
  //   msg: req.body.msg
  // };
  // console.log ("message fr: " + p2pchat_packege.from_id);
  // io.emit ('getMessage-' + p2pchat_packege.to_id, p2pchat_packege);
  // io.emit ('getMessage-' + p2pchat_packege.from_id, p2pchat_packege);
  p2pSender(req.session.user.username, req.body.friendID, req.body.msg);
  res.end ();
});


function p2pSender(_from_id, _to_id, _msg) {
  var p2pchat_packege = {
    from_id: _from_id,
    to_id: _to_id,
    msg: _msg
  };
  console.log ("message fr: " + p2pchat_packege.from_id);
  io.emit ('getMessage-' + p2pchat_packege.to_id, p2pchat_packege);
  io.emit ('getMessage-' + p2pchat_packege.from_id, p2pchat_packege);
}



/*
  var send_package = {
    friendID: friendID,
    msg: msg
  };
  $.post ('/p2pchat', send_package);
*/

///////////





// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine ('html', require ('ejs').renderFile);
app.set ('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use ('/login', routes);
app.use ('/register', routes);
app.use('/chat', routes);
app.use ('/personalPage', routes);
app.use ('/test1', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
/*
app.get ('/', routes.index);
app.get ('/login', routes.login);
app.post ('/login', routes.doLogin);
app.get ('/register', routes.register);
app.post ('/register', routes.doRegister);
//routes (app);
*/
//mongoose
mongoose.connect ('mongodb://localhost:27017/user_db');


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//app.listen (3000);

module.exports = app;
