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
    filenames: {type: String}
});
//schemas end

module.exports = [mongoose.model ('users_login', users_login), mongoose.model ('users_info', users_info), mongoose.model ('users_state', users_state)];
