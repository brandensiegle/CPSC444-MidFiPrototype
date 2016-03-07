var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var Group = require('../models/group');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){


	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {


            findOrCreateUser = function(){
                
                // find a user in Mongo with provided username
                User.findOne({ 'username' :  username }, function(err, user) {
                    
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: '+username);
                        return done(null, false, req.flash('message','User Already Exists'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.goal = req.param('indgoal');
                        newUser.groupname = req.param('groupname');
                        newUser.groupblind = req.param('groupblind');
                        newUser.memberblind = req.param('memberblind');

                        if(!newUser.groupblind){
                            newUser.groupblind = false
                        }

                        if(!newUser.memberblind){
                            newUser.memberblind = false
                        }

                        Group.findOne({ 'groupname' : newUser.groupname}, function(grerr, group){
                            if(grerr){
                                console.log('Error in SignUp: '+grerr);
                                return done(grerr)
                            }

                            if (!group){
                                var newGroup = new Group();

                                newGroup.groupname = newUser.groupname;
                                newGroup.goal = 0;
                                newGroup.numbermembers = 1;

                                newGroup.save(function(err) {
                                    if (err){
                                        console.log('Error in Saving user: '+err);  
                                        throw err;
                                    }


                                });
                            } else {
                                console.log("~~~~~~~~~~~~");
                                console.log(group.numbermembers);
                                console.log(group.numbermembers + 1);
                                group.numbermembers = group.numbermembers + 1;

                                group.save(function(err){
                                    if (err){
                                        console.log('Error in Saving user: '+err);  
                                        throw err;
                                    }
                                });
                            }

                        });

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');




                            return done(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}