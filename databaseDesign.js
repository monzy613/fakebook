users_logins {
	_id: {type: String},
	password: {type: String},
	email: {type: String},
	qq: {type: String},
}

users_states {
	_id: {type: String},
	filenames: {type: Array},
}

//filenames:
//i_states_of_xxxxx.txt

users_friends {
	_id: {type: String},
	friendIDs: {type: Array},
}


users_albums {
    _id: {type: String},
    filenames: {type: Array},
}
