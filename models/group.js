var mongoose = require('mongoose');

module.exports = mongoose.model('Group',{
	//id: String,
	groupname: String,
	goal: {type: Number},
	numbermembers: {type: Number}
});