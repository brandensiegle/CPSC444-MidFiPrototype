
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var ensureLoggedIn = require('connect-ensure-login');
var User = require('../models/user');
var express = require('express');
var router = express.Router();


var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/login');
}



module.exports = function(passport){

	/* GET home page. */
	router.get('/', isAuthenticated, function(req, res){
	    res.render('index', { title: req.user.username });
	  });

	/* GET Userlist page. */
	router.get('/userlist', function(req, res) {
	    var db = req.db;
	    var collection = db.collection('users');
	    
	    User.find({}, function (err, docs) {
	    	res.render('userlist', {
	            "userlist" : docs,
	            title: "TheTitle"
	        });
	    });

	    /*collection.find({},{},function(e,docs){
	        res.render('userlist', {
	            "userlist" : docs,
	            title: "TheTitle"
	        });
	    });*/
	});

	/*GET Login page*/
	router.get('/login', function(req, res, next) {

		res.render('login', {}
			);
	});


	/*POST to Login*/
	router.post('/login', passport.authenticate('login', {
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash : false  
		
	}));


	/*GET admin page*/
	router.get('/admin', function(req, res){
		var db = req.db;
	    var collection = db.collection('users');
	    
	    User.find({}, function (err, docs) {
	    	res.render('admin', {
	            "userlist" : docs,
	            title: "TheTitle"
	        });
	    });
	});

	/*POST new user*/
	router.post('/user', passport.authenticate('signup', {
	    successRedirect: '/',
	    failureRedirect: '/admin',
	    failureFlash : false 
	}));

	/*DELETE User*/
	router.delete('/user/:username', function(req, res){
		var username = req.param("username");
		console.log("delete: "+username);
		
		User.find({username:username}).remove().exec();

		res.end(username);
	});

	return router;
}
