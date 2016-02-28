var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	//id: String,
	username: String,
	password: String,
	groupname: String,
	groupblind: Boolean,
	memberblind: Boolean
});