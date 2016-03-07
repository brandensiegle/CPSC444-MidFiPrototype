
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
	    res.redirect('/group');
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
   			res.redirect('/login'); //Inside a callback… bulletproof!
  		});
	});


	/*GET admin page*/
	router.get('/admin', isAuthenticated, function(req, res, next){
		var db = req.db;
	    var collection = db.collection('users');
	    
	    if (req.user.username == 'Admin'){

		    User.find({}, function (err, docs) {
		    	res.render('admin', {
		            "userlist" : docs,
		            title: "Admin_Page"
		        });
		    });

		} else {
			next();
		}
	});




/*GET groupranking page*/
router.get('/groupranking', isAuthenticated, function(req, res, next){
	//var username = "test";

	console.log(req.user);

	var todayDate = new Date();
	var yy = todayDate.getFullYear();
	var mm = todayDate.getMonth();
	var dd = todayDate.getDate();

	var today = new Date(yy, mm, dd);

	var thisGroupOnlyStats = [];
	
	EntryData.find({date: today}, function(err, entriesForToday){
		
		Group.find({}, function(err, allGroups){
			var curGroup = 0;
			var groupStats = [];
			var data;

			//Function for iterating through groups
			function searchThroughGroups(){
				if(curGroup < (allGroups.length - 1)){
					

					
					var currentGroupName = allGroups[curGroup].groupname;
					
					
					User.find({groupname: currentGroupName}, function(err, usersInThis){
						var totalGroupSteps = 0;

						
						for (var userCounter = 0 ;userCounter < usersInThis.length; userCounter++) {
							var u = usersInThis[userCounter];
							
							
							for(var i = 0; i < entriesForToday.length; i++){
								var e = entriesForToday[i];

								if(u.username == e.username){
									console.log(e);
									console.log(e.steps);
									totalGroupSteps = totalGroupSteps + e.steps;
									break;
								}
							}
							
						}


						if(req.user.groupname == currentGroupName){
							groupStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: true});
							thisGroupOnlyStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: true});
						} else{
							groupStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: false});
						}
						

						curGroup++;
						searchThroughGroups();
					});

					
					

					
				}
				else{
					var currentGroupName = allGroups[curGroup].groupname;

					User.find({groupname: currentGroupName}, function(err, usersInThis){
						//console.log(usersInThis);

						var totalGroupSteps = 0;
						

						
						for (var userCounter = 0;userCounter < usersInThis.length;userCounter++) {
							var u = usersInThis[userCounter];
							

							for(var i = 0; i < entriesForToday.length; i++){
								var e = entriesForToday[i];


								if(u.username == e.username){
									totalGroupSteps = totalGroupSteps + e.steps;
									break;
								}
							}
							
						}

						

						if(req.user.groupname == currentGroupName){
							groupStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: true});
							thisGroupOnlyStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: true});
						} else{
							groupStats.push({groupname: currentGroupName, totalSteps: totalGroupSteps, offColour: false});
						}
						

						curGroup++;

						if(req.user.groupblind){
							groupStats = thisGroupOnlyStats;
						}

						res.render('groupranking', {allgroups: groupStats});
					});

				}

			}

			searchThroughGroups();
			


			

		});
	});


	
});

/*GET groups page*/
router.get('/group', isAuthenticated, function(req, res, next){
	
	var todayDate = new Date();
	var yy = todayDate.getFullYear();
	var mm = todayDate.getMonth();
	var dd = todayDate.getDate();

	var today = new Date(yy, mm, dd);

	//var username = 'test';
	var username = req.user.username;

	User.findOne({username: username}, function(err, currentUser){
		User.find({groupname: currentUser.groupname}, function(err, groupmates){

			console.log(groupmates);
			EntryData.find({date: today}, function(err, entriesForToday){

				var singleMember = [];
				var memberData = [];
				var totalSteps = 0;

				for(var i=0; i<groupmates.length; i++){
					var user = groupmates[i].username;

					var logged = false;
					for(var j=0; j<entriesForToday.length; j++){
						
						if (entriesForToday[j].username == user){
							
							

							if(currentUser.username == user){
								singleMember.push({username : entriesForToday[j].username,
											 steps: entriesForToday[j].steps,
											 goal: groupmates[i].goal,
											 percentage: (entriesForToday[j].steps/groupmates[i].goal)*100,
											 offColour: true });

								memberData.push({username : entriesForToday[j].username,
											 steps: entriesForToday[j].steps,
											 goal: groupmates[i].goal,
											 percentage: (entriesForToday[j].steps/groupmates[i].goal)*100,
											 offColour: true});
							} else{
								memberData.push({username : entriesForToday[j].username,
											 steps: entriesForToday[j].steps,
											 goal: groupmates[i].goal,
											 percentage: (entriesForToday[j].steps/groupmates[i].goal)*100,
											 offColour: false});
							}
							
							totalSteps = totalSteps + entriesForToday[j].steps;
							logged = true;
							break;
						}
					}
					if (!logged){
						
						if(currentUser.username == user){
								singleMember.push({username :  groupmates[i].username,
											 steps: 0,
											 goal: groupmates[i].goal,
											 percentage: 0,
											 offColour: true });

								memberData.push({username : groupmates[i].username,
											 steps: 0,
											 goal: groupmates[i].goal,
											 percentage: 0,
											 offColour: true});
						} else {

							memberData.push({username : groupmates[i].username,
											 steps: 0,
											 goal: groupmates[i].goal,
											 percentage: 0,
											 offColour: false});
						}
					}
				}

				Group.findOne({groupname: currentUser.groupname}, function(err, thisGroup){
					
					memberData.sort(function(a, b) {
						return b.steps - a.steps;
					});

					if(currentUser.memberblind){
						memberData = singleMember;
					}

					res.render('group', {members: memberData,
											groupTotal: totalSteps,
											groupGoal: thisGroup.goal,
											groupName:  thisGroup.groupname,
											otherVisible : !currentUser.memberblind});

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
	
	var username = 'test';
	//var username = req.user.username;

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
