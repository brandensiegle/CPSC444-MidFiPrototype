var mongoose = require('mongoose');

module.exports = mongoose.model('EntryData',{
	username: String,
	date: {type: Date},
	steps: {type: Number}
});