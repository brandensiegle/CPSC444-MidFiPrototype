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

/* GET users listing. */
router.get('/data', isAuthenticated, function(req, res, next) {
  res.send('respond with data points');
});

router.post('/data', isAuthenticated, function(req, res, next){


});

/*GET groups page*/
router.get('/group', function(req, res, next){

	res.render('group', {groupName: 'Group Name'});

});

module.exports = router;
