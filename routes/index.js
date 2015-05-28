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
var users_friend_model = require ('../models/user')[3];
//models end

//test1
router.get ('/test1', function (req, res, next) {
	//res.render ('userPage', {head_img_name: 'head_test.png'});
});

router.route ('/state').get (function (req, res) {
	res.render ('state');
}).post (function (req, res) {
	//console.log (req);
});

router.route ('/sendState').post (function (req, res) {
	var filenames;
	users_state_model.find ({_id: req.session.user.username}, function (err, docs) {
		//console.log ("FOUND: " + req.session.user.username);
		filenames = docs[0].filenames;
		var filename = "./users_things/states/" + req.session.user.username + '/';
		if (filenames.length !== 0) {
			console.log ("FILENAMES: " + filenames);
			filename += (filenames.length + "_states_of_" + req.session.user.username + ".txt");
			filenames.push (filename);
			fs.writeFile (filename, req.body.state, function (err) {
				if (!err) {
					console.log ('WRITE SUCCESS!!!!');
					users_state_model.update ({_id: req.session.user.username}, {$set: {filenames: filenames}}, function (err, docs) {

					});
				}
			});
		} else {
			fs.mkdir (filename, function (err) {
				if (err) {
					console.log ("ERROR: " + err);
				} else {
					console.log ("success");
				}
				filename += "0_states_of_" + req.session.user.username + ".txt";
				filenames = [filename];

				fs.writeFile (filename, req.body.state, function (err) {
					if (!err) {
						console.log ('WRITE SUCCESS!!!!');
						users_state_model.update ({_id: req.session.user.username}, {$set: {filenames: filenames}}, function (err, docs) {

						});
					}
				});


			});
		}

	});
	console.log (req.body);
});

router.route ('/acceptFriendApply').post (function (req, res) {
	var accepter = req.session.user.username;
	var applier = req.body.applierID;
	console.log (req.session.user.username + ' accepted the friend apply of ' + req.body.applierID);
	friendAccepter (accepter, applier);
});

function friendAccepter (accepter, applier) {
	users_friend_model.find ({_id: accepter}, function (err, docs) {
		if (!err) {
			if (docs.length !== 0) {
				var friends_ids = docs[0].friends_ids;
				if (noRecurPush (friends_ids, applier)) {
					var new_applied_by = docs[0].applied_by.filter(function (xid) {return xid !== applier;});
					users_friend_model.update ({_id: accepter}, {$set: {friends_ids: friends_ids, applied_by: new_applied_by}}, function (err, docs) {});
					console.log ('ACCEPTED!!!!!');
				} else {
					//do nothing
				}
			} else {
				console.log (accepter + ' not found');
			}
		} else {
			console.log (err);
		}
	});

	users_friend_model.find ({_id: applier}, function (err, docs) {
		if (!err) {
			if (docs.length !== 0) {
				var friends_ids = docs[0].friends_ids;
				if (noRecurPush (friends_ids, accepter)) {
					var new_appling = docs[0].appling.filter(function (xid) {return xid !== accepter;});
					users_friend_model.update ({_id: applier}, {$set: {friends_ids: friends_ids, appling: new_appling}}, function (err, docs) {});
					console.log ('BEING ACCEPTED!!!!!!');
				} else {
					//do nothing
				}
			} else {

			}
		} else {

		}
	});
}


router.route ('/friendManagement').get (function (req, res) {
	console.log ('friendManagement');
	res.render ('friendManagement');
});



router.route ('/friendAdder').post (function (req, res) {
	var from_whom = req.session.user.username;
	var to_whom = req.body.user_id;
	friendApplitor (from_whom, to_whom);
	console.log ("Applying!" + req.body.user_id);
});

function friendApplitor (from_whom, to_whom) {
/*
    _id: {type: String},
    friends_ids: {type: Array},
    applied_by: {type: Array},
    appling: {type: Array}
*/
	users_friend_model.find ({_id: from_whom}, function (err, docs) {
		if (!err) {
			if (docs.length !== 0) {
				var fromer_appling = docs[0].appling;//Array
				if (noRecurPush (fromer_appling, to_whom)) {
					if (fromer_appling === null) {
						console.log ('Fromer_appling');
					} else {
						users_friend_model.update ({_id: from_whom}, {$set: {appling: fromer_appling}}, function (err, docs) {});
					}
				} else {
					console.log (to_whom + " is already in appling queue of " + from_whom);
				}
			} else {
				//holy shit
			}
		} else {
			console.log ('[friendApplitor]ERROR: ' + err);
		}
	});

	users_friend_model.find ({_id: to_whom}, function (err, docs) {
		if (!err) {
			if (docs.length !== 0) {
				var toer_applied_by = docs[0].applied_by;
				if (noRecurPush (toer_applied_by, from_whom)) {
					if (toer_applied_by === null) {
						console.log ('Toer_applied_by');
					} else {
						users_friend_model.update ({_id: to_whom}, {$set: {applied_by: toer_applied_by}}, function (err, docs) {});
					}
				} else {
					console.log (from_whom + " is already in applied_by queue of " + to_whom);
				}
			} else {
				//holy shit
			}
		} else {
			console.log ('[friendApplitor]ERROR: ' + err);
		}
	});

}


router.get ('/userPage', function (req, res, next) {
	res.render ('userPage', {head_img_name: 'head_test.png', username: req.session.user.nickname, qq: req.session.user.qq, email: req.session.user.email});
});

//test1


//file upload

//file upload

/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log(req.cookies);
  	res.render('index', { title: 'Home Page' });
});





//search for friend


router.post ('/search', function (req, res) {
	var search_key = req.body.friend;
	console.log ("Search: " + search_key);
	req.session.search_key = search_key;
	// users_login_model.find ({nickname: search_key}, function (err, docs) {
	// 	if (!err) {
	// 		if (docs.length > 0) {
	// 			res.end (docs);
	// 		} else {
	// 			console.log ("Not found");
	// 		}
	// 	} else {
	// 		console.log ("query error");
	// 	}
	// });
	res.render ('search');
});

//search for friend


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
				//console.log ("info: " + docs[0]);
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
	// console.log (req.session);
	res.render ('login', {title: 'Login_get'});
});
/*
.post (function (req, res) {
	var isInDB = false;
	var username = req.body.username;
	var password = req.body.password;

	users_login_model.find ({$and: [{_id: username}, {password: password}]}, function (err, docs) {
		if (!err) {
			if (docs != '') {
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
			res.redirect ('/chat');
			//res.render ('chat', { username: currentId });
		} else {
			//alert ("Wrong username or password!");
			res.render ('errorPage', {title: 'ACCOUNT_PASSWORD_PROBLEM'});
		}
	});

});
*/


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
	};
/*
    _id: {type: String},
    friends_ids: {type: Array},
    applied_by: {type: Array},
    appling: {type: Array}
*/
	var doc_friend = {
		_id: username,
		friends_ids: new Array (),
		applied_by: new Array (),
		appling: new Array ()
	};

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
	    					users_friend_model.create (doc_friend, function (error_friend_model) {
	    						if (error_friend_model) {
			    					res.render ('errorPage', {title: 'REGISTER_FAILED'});
	    						} else {
					    			isLogin = true;
					    			res.render ('index', {title: (username + ' Register successed')});
	    						}
	    					});

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

function noRecurPush (arr, value) {
	for (var i = 0; i < arr.length; ++i) {
		if (arr[i] === value) {
			return false;
		}
	}
	arr.push (value);
	return true;
}


module.exports = router;
