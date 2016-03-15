var flash = require('connect-flash');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;

/*~~~~PASSPORT~~~~
  ----------------
  ----------------
*/
var initPassport = require('./passport/init');
initPassport(passport);


/*
*******************************************************************************
*/


var mongo = require('mongodb');
var monk = require('monk');
var mongoose = require('mongoose');
mongoose.connect('mongodb://brandensiegle:admin@ds017688.mlab.com:17688/cpsc444-midfi')
var db = mongoose.connection;


var routes = require('./routes/index')(passport);
var users = require('./routes/user')(passport);
var loggeddata = require('./routes/loggeddata');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({ secret: 'NeverGonnaCatchMe', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use(function(req,res,next){
    req.auth = passport;
    next();
});

app.use('/', routes);
app.use('/user', users);
app.use('/loggeddata',loggeddata);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Oh No! Not Found');
    err.status = 404;
    next(err);
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;