var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	//id: String,
	username: String,
	password: String,
	goal: {type: Number},
	groupname: String,
	groupblind: Boolean,
	memberblind: Boolean
});