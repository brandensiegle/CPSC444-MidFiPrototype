var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var ensureLoggedIn = require('connect-ensure-login');
var User = require('../models/user');
var Group = require('../models/group');
var EntryData = require('../models/entrydata');

var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	//return next();
	res.redirect('/login');
}


module.exports = function(passport){

	/*POST new user*/
	router.post('/', passport.authenticate('signup', {
	    successRedirect: '/group',
	    failureRedirect: '/admin',
	    failureFlash : false 
	}));


	/*DELETE User*/
	router.delete('/:username', function(req, res){
		var username = req.param("username");
		console.log("delete: "+username);
		
		User.find({username:username}, function(err, user){
			
			
			Group.find({groupname: user[0].groupname}, function(err, group){
				var usersgroup = group[0];

				if(usersgroup.numbermembers == 1){
					usersgroup.remove();
				} else{
					usersgroup.numbermembers = usersgroup.numbermembers - 1;
					usersgroup.save();
				}

			});

			


		}).remove().exec();

		res.end(username);
	});

	return router;

}
