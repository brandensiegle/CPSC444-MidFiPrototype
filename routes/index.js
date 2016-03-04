
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

	/* GET home page. */
	router.get('/', isAuthenticated, function(req, res){
	    res.render('index', { title: req.user.username });
	  });

	// /* GET Userlist page. */
	// router.get('/userlist', function(req, res) {
	//     var db = req.db;
	//     var collection = db.collection('users');
	    
	//     User.find({}, function (err, docs) {
	//     	res.render('userlist', {
	//             "userlist" : docs,
	//             title: "TheTitle"
	//         });
	//     });

	//     /*collection.find({},{},function(e,docs){
	//         res.render('userlist', {
	//             "userlist" : docs,
	//             title: "TheTitle"
	//         });
	//     });*/
	// });

	/*GET Login page*/
	router.get('/login', function(req, res, next) {

		res.render('login', {}
			);
	});


	/*POST to Login*/
	router.post('/login', passport.authenticate('login', {
			successRedirect: '/group',
			failureRedirect: '/login',
			failureFlash : false  
		
	}));

	/*GET logout */
	router.get('/logout', isAuthenticated, function(req, res){
		req.session.destroy(function (err) {
   			res.redirect('/'); //Inside a callback… bulletproof!
  		});
	});


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




/*GET groupranking page*/
router.get('/groupranking', isAuthenticated, function(req, res, next){

	res.render('groupranking');
});

/*GET groups page*/
router.get('/group', isAuthenticated, function(req, res, next){
	
	var todayDate = new Date();
	var yy = todayDate.getFullYear();
	var mm = todayDate.getMonth();
	var dd = todayDate.getDate();

	var today = new Date(yy, mm, dd)

	//var username = 'test';
	var username = req.user.username;

	User.findOne({username: username}, function(err, currentUser){
		User.find({groupname: currentUser.groupname}, function(err, groupmates){

			console.log(groupmates);
			EntryData.find({date: today}, function(err, entriesForToday){

				var memberData = [];
				var totalSteps = 0;

				for(var i=0; i<groupmates.length; i++){
					var user = groupmates[i].username;

					var logged = false;
					for(var j=0; j<entriesForToday.length; j++){
						
						if (entriesForToday[j].username == user){
							memberData.push({username : entriesForToday[j].username,
											 steps: entriesForToday[j].steps});

							
							totalSteps = totalSteps + entriesForToday[j].steps;
							logged = true;
						}
					}
					if (!logged){
						memberData.push({username : groupmates[i].username,
											 steps: 0});
					}
				}

				Group.findOne({groupname: currentUser.groupname}, function(err, thisGroup){
					

					res.render('group', {members: memberData,
											groupTotal: totalSteps,
											groupGoal: thisGroup.goal,
											groupName:  thisGroup.groupname});

				});


				
				
			});

			
		});

	});

	

});

/*GET adddata page*/
router.get('/addData', isAuthenticated, function(req, res, next){

	res.render('adddata');
});


/*POST new data*/
router.post('/addData', isAuthenticated, function(req, res, next){
	
	//var username = 'test';
	var username = req.user.username;

	var todayDate = new Date();
	var yy = todayDate.getFullYear();
	var mm = todayDate.getMonth();
	var dd = todayDate.getDate();

	var today = new Date(yy, mm, dd)

	EntryData.findOne({username: username, date: today}, function(err, entry){
		if(entry){
			entry.steps = req.body.steps;
			entry.save();

		} else {
			var newentry = new EntryData();
			newentry.username = username;
			newentry.date = today;
			newentry.steps = req.body.steps;
			newentry.save();
		}
	});


	res.redirect('/group');
});

	return router;
}
