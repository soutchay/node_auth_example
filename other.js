////////****Alex's app.js******///////
//to run this version:
//in terminal, nodemon other.js

var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    passport       = require('passport'),
    passportLocal  = require('passport-local'),
    cookieParser   = require('cookie-parser'),
    expressSession = require('express-session'),
    port           = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'secret'
}));

app.use(passport.initialize()); // grabs user data needed for session
app.use(passport.session()); // puts that data into session


passport.use(new passportLocal.Strategy(function(username, password, callback){

  if (username === password) {
    callback(null, {id: username, name: username});
  } else {
    callback(null, null);
  }

}));

passport.serializeUser(function(user, callback) {
  callback(null, user.id);
});
passport.deserializeUser(function(id, callback){
  callback(null, {id: id, name: id});
})

app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('home', {
    isAuthenticated: request.isAuthenticated(),
    name: request.user.name 
  });
});

app.get('/login', function(request, response) {
  response.render('login');
});

app.post('/login', passport.authenticate('local'), function(request, response) {
  response.redirect('/');
});


app.listen(port);

console.log('Server is running on port ' + port);