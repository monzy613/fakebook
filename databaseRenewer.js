var mongoose = require ('mongoose');
var db = mongoose.createConnection ('mongodb://127.0.0.1:27017/user_db');

var users_login_model = require ('./models/user')[0];
var users_info_model = require ('./models/user')[1];
var users_state_model = require ('./models/user')[2];
var users_friend_model = require ('./models/user')[3];

var users_ids = [];
mongoose.connect ('mongodb://localhost:27017/user_db');
var doc_friend = {
	_id: 'monzy666',
	friend_ids: new Array (),
	applied_by: new Array (),
	appling: new Array ()
};
users_friend_model.create (doc_friend, function (error_in_create) {
	if (error_in_create) {
		console.log (error_in_create);
	} else {
		console.log ('success');
	}
});
/*
users_login_model.find ({_id: {$exists: true}}, function (err, docs) {
	console.log (docs);
	for (var i in docs) {
		console.log (docs[i]._id);
		users_ids.push (docs[i]._id);
	}



	for (var j in users_ids) {
		users_friend_model.find ({_id: users_ids[j]}, function (err, docs) {
			if (err) {
				console.log ("FIND " + err);
			} else {
				console.log ("||" + docs);
				if (docs.length === 0) {
					var doc_friend = {
						_id: users_ids[j],
						friend_ids: new Array (),
						applied_by: new Array (),
						appling: new Array ()
					};
					users_friend_model.create (doc_friend, function (error_in_create) {
						console.log ("CREATE: " + error_in_create);
					});
				}
				else {
				}
			}

		});
	}
	
});

*/
