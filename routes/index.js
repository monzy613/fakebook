var crypto = require ('crypto');
var express = require('express');
var router = express.Router();
var User = require ('../models/user');
var app = express ();
var mongoose = require ('mongoose');
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/user_db');
var requestIDs = [];//[{reqId: xxx, _id: xxx}, {reqId: xxx, _id: xxx}];
var fs = require ('fs');
var session = require ('express-session');




////temp
var isLogin = false;
var currentId = 'defaultID';
var currentNickname = 'defaultNickname';
var currentQQ = 'defaultQQ';
var currentEmail = 'dafaultEmail';
////temp

//schemas start

// models start
//var users_login_model = db.model ('users_login', users_login);
// var users_login_model = require ('../models/user')[0];
// var users_info_model = db.model ('users_info', users_info);
// var users_state_model = db.model ('users_state', users_state);
var users_login_model = require ('../models/user')[0];
var users_info_model = require ('../models/user')[1];
var users_state_model = require ('../models/user')[2];
//models end

//test1
router.get ('/test1', function (req, res, next) {
	//res.render ('userPage', {head_img_name: 'head_test.png'});
});

router.route ('/state').get (function (req, res) {
	res.render ('state');
}).post (function (req, res) {
	console.log (req);
});

router.route ('/sendState').post (function (req, res) {
	var filenames;
	users_state_model.find ({_id: req.session.user.username}, function (err, docs) {
		//console.log ("FOUND: " + req.session.user.username);
		filenames = docs[0].filenames;
		var filename = "./users_things/";
		if (filenames != "") {
			filenames = filenames.split (',');
			console.log ("FILENAMES: " + filenames);
			filename += (filenames.length + "_states_of_" + req.session.user.username + ".txt");
			filenames.push (filename);
		} else {
			filename += "0_states_of_" + req.session.user.username + ".txt";
			filenames = [filename];
		}
		var data = req.body.state;
		fs.writeFile (filename, data, function (err) {
			if (!err) {
				console.log ('WRITE SUCCESS!!!!');
				users_state_model.update ({_id: req.session.user.username}, {$set: {filenames: filenames}}, function (err, docs) {

				});
			}
		});
	});
	console.log (req.body);
});


router.get ('/userPage', function (req, res, next) {
	res.render ('userPage', {head_img_name: 'head_test.png', username: req.session.user.nickname, qq: req.session.user.qq, email: req.session.user.email});
});

//test1


//file upload

//file upload

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log (req);
	//console.log(req.cookies);
  	res.render('index', { title: 'Home Page' });
});



//userPage
//userPage

router.get ('/chat', function (req, res, next) {
	if (isLogin) {
		res.render ('chat', { title: req.session.user.username});
	} else {
		res.render ('errorPage', {title: "PLEASE_LOGIN_FIRST"});
	}
});

router.get ('/personalPage', function (req, res, next) {
	console.log ('req personalPage');
	if (isLogin) {
		res.render ('personalHomePage', {title: req.session.user.username});
	} else {
		res.render ('errorPage', {title: "PLEASE_LOGIN_FIRST"});
	}
});

router.get ('/myinfo', function (req, res) {
	console.log('myinfo request');
	res.send ('Helloworld');
});

router.route ('/personalPage').post (function (req, res) {
	var isInDB = false;
	var username = req.body.username;
	var password = req.body.password;
	users_login_model.find ({_id: username, password: password}, function (err, docs) {
		if (!err) {
			if (docs != '') {

				requestIDs.push (docs[0]);
				console.log ("info: " + docs[0]);
				req.session.user = {
					username: docs[0]._id,
					nickname: docs[0].nickname,
					email: docs[0].email,
					qq: docs[0].qq
				};
				//req.session.username = "MONZY666";
				//res.setHeader ("Set-Cookie", ["username=" + docs[0]._id, "nickname=" + docs[0].nickname, "email=" + docs[0].email, "qq=" + docs[0].qq]);
				console.log ('account validation success');

				currentId = username;
				isLogin = true;
				isInDB = true;
			} else {
				console.log ('account validation failed');
				isLogin = false
				isInDB = false;
			}
		} else {
			isLogin = false;
			console.log ('LOGIN_ERROR');
		}

		if (isInDB) {
			//res.render ('personalHomePage', {title: 'Login Success', username: username});
			res.redirect ('/userPage');
			//res.render ('chat', { username: currentId });
		} else {
			//alert ("Wrong username or password!");
			res.render ('errorPage', {title: 'ACCOUNT_PASSWORD_PROBLEM'});
		}
	});
	//res.render ('personalHomePage', {title: username});
});

router.route ('/login').get (function (req, res) {
	console.log (req.session);
	res.render ('login', {title: 'Login_get'});
});
// .post (function (req, res) {
// 	var isInDB = false;
// 	var username = req.body.username;
// 	var password = req.body.password;

// 	users_login_model.find ({$and: [{_id: username}, {password: password}]}, function (err, docs) {
// 		if (!err) {
// 			if (docs != '') {
// 				console.log ('account validation success');
// 				currentId = username;
// 				isLogin = true;
// 				isInDB = true;
// 			} else {
// 				console.log ('account validation failed');
// 				isLogin = false
// 				isInDB = false;
// 			}
// 		} else {
// 			isLogin = false;
// 			console.log ('LOGIN_ERROR');
// 		}

// 		if (isInDB) {
// 			//res.render ('personalHomePage', {title: 'Login Success', username: username});
// 			res.redirect ('/chat');
// 			//res.render ('chat', { username: currentId });
// 		} else {
// 			//alert ("Wrong username or password!");
// 			res.render ('errorPage', {title: 'ACCOUNT_PASSWORD_PROBLEM'});
// 		}
// 	});

// });


router.route ('/register').get (function (req, res) {
	res.render ('register', {title: 'Register_get'});
}).post (function (req, res) {
	//income register infos
	//username
	//password
	//email
	//qq
	//nickname

	/*
	var users_info = new mongoose.Schema ({
	_id: {type: String},
	email: {type: String},
	nickname: {type: String},
	qq: {type: String}
	});
	*/

	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	var nickname = req.body.nickname;
	var qq = req.body.qq? req.body.qq: null;

	var doc_login = {
		_id: username,
		password: password,
		email: email,
		nickname: nickname,
		qq: qq,
		isOnline: false
	};
	var doc_info = {
		_id: username,
		email: email,
		nickname: nickname,
		qq: qq
	};
	var doc_state = {
		_id: username,
		filenames: new Array ()
	}

	users_login_model.create(doc_login, function(error_login_model){
	    if(error_login_model) {
	        console.log(error_login_model);
			isLogin = false;
			res.render ('errorPage', {title: 'REGISTER_FAILED'});
	    } else {
	    	users_info_model.create (doc_info, function (error_info_model) {
	    		if (error_info_model) {
	    			console.log ('doc_info_create_error' + '---' + error_info_model);
	    			isLogin = false;
	    			res.render ('errorPage', {title: 'REGISTER_FAILED'});
	    		} else {
	    			console.log ('save ok');
	    			console.log ('REGISTER _id: ' + username);
	    			console.log ('REGISTER password: ' + password);
	    			console.log ('REGISTER email: ' + email);
	    			console.log ('REGISTER nickname: ' + nickname);
	    			console.log ('REGISTER qq: ' + qq);

	    			users_state_model.create (doc_state, function (error_state_model) {
	    				if (error_state_model) {
	    					res.render ('errorPage', {title: 'REGISTER_FAILED'});
	    				} else {
			    			isLogin = true;
			    			res.render ('index', {title: (username + ' Register successed')});
	    				}
	    			});
	    		}
	    	});


	  //       console.log('save ok');
			// console.log ('REGISTER_ID: ' + username);
			// console.log ('REGISTER_PWD: ' + password);
			// isLogin = true;
			// currentId = username;
			// res.render ('index', {title: username});
	    }
	});
});


function debugSession (req) {
	console.log (req.session);
}


module.exports = router;
