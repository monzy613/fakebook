var mongoose = require('mongoose')
    , Schema = mongoose.Schema
	    , ObjectId = Schema.ObjectId;


//schemas start

var users_login = new mongoose.Schema({
    _id: {type: String},
    password: {type: String},
    email: {type: String},
    nickname: {type: String},
    qq: {type: String},
    isOnline: {type: Boolean}
});

var users_info = new mongoose.Schema ({
    _id: {type: String},
    email: {type: String},
    nickname: {type: String},
    qq: {type: String}
});

var users_state = new mongoose.Schema ({
    _id: {type: String},
    filenames: {type: Array}
});

var users_friend = new mongoose.Schema ({
    _id: {type: String},
    friends_ids: {type: Array},
    applied_by: {type: Array},
    appling: {type: Array}
});

var users_position = new mongoose.Schema ({
    _id: {type: String},
    nickname: {type: String},
    longitude: 0.0,
    latitude:  0.0
});


var users_gallery = new mongoose.Schema ({
    _id: {type: String},
    filenames: {type: Array}
});


var users_notification = new mongoose.Schema ({
	_id: {type: String},
});
//schemas end

module.exports = [
mongoose.model ('users_login', users_login),
mongoose.model ('users_info', users_info),
mongoose.model ('users_state', users_state),
mongoose.model ('users_friend', users_friend),
mongoose.model ('users_gallery', users_gallery),
mongoose.model ('users_position', users_position)];
