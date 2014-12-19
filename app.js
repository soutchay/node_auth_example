var express        = require('express'),
    //Instantiate app as express
    app            = express(),
    bodyParser     = require('body-parser'),
    passport       = require('passport'),
    passportLocal  = require('passport-local'),
    cookieParser   = require('cookie-parser'),
    expressSession = require('express-session'),
    mongoose       = require('mongoose'),
    User           = require('./user'),
    // set up port that we want to listen to
    port           = process.env.PORT || 3000;
// 12)Hook up database mongoose ODM, turn on mongod
mongoose.connect('mongodb://localhost/node_auth');

//Tell express to use bodyparser's method urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// 5)Need to use/fire cookie-parser and express-session
//cookie for browser
app.use(cookieParser());
//session for server
app.use(expressSession({
// 6) Now we see a bunch of deprecated stuff, we don't need the stuff so set to false
	resave: false,
	saveUninitialized: false,
	// we need secret for security
	secret: process.env.SESSION_SECRET || 'secret'
}));


//After body parser
// 1) passport will grab user data in order to do sessions
app.use(passport.initialize());
// 2) puts the data grabbed into session ie.session id
app.use(passport.session());
// 3) Now we need cookie parser to help store session id into client side: npm i cookie-parser --save
// 4) Need to store session id into server: npm i express-session --save

// 7) tell passport to use dependencies, passport-local; strategy of auth
passport.use(new passportLocal.Strategy('', function(username, password, callback){
	//when everything is done, do callback
	//if username and password are equal, send callback
	//first callback parameter is error so we set it to null
	//second parameter is the user object
	// // Previously we had the below...********
	// if (username === password){
	// 	callback(null, {id: username, name: username});
	// }
	// else {
	// 	//null error, null user
	// 	callback(null, null);
	// }

	// // Now we can real authentication.... *****
	// username has to match the model
	User.findOne({username: username}, function(error, user){
		if (error) console.log('could not find user');
		// Return user to request body to work with it
		// Final Step
		return callback(null, user);
	});
}));
//gets sent to app.post('/login')


// username/password is serialized which gets stored as a session id
passport.serializeUser(function(user, callback){
// 8) null error and serialize user id; user.id as a key
	callback(null, user.id);
});
// 9) memento used to deserialize user id, server can deserialize
passport.deserializeUser(function(id, callback){
	//the object is the user instance
	// callback(null, {id: id, name: id});
	//since we are passing the id that is serialized
	User.findById(id, function(error, user){
		if (error) console.log("could not find user");
		//Give back the entire user
		callback(null, user);
	});
});

//To be able to read EJS(embedded javascript), tell express we need to be able to render EJS
//EJS is looking specifically for view folder
app.set('view engine', 'ejs');

app.get('/', function(request, response){
	// response.send('hello');
	//Instead of send, render the home
	response.render('home', {
		//Render this file home, and pass along this javascript
		//isAuthenticated will see if you're logged in or not
		// isAuthenticated: false,
		// 10) check if username and password are the same
		// isAuthenticated() comes from passport
		isAuthenticated: request.isAuthenticated(),
		// name: "Beyonce"
		// 11) user is reflected in the home.ejs, thus in home.ejs we do user.name in home.ejs
		user: request.user
	});
});

app.get('/login', function(request, response){
	response.render('login', {
	});
});

// 8) Now, put passport.authenticate('local'); must go through this middleware; defined as 'local' before functiion(req,res) 
app.post('/login', passport.authenticate('local'), function(request, response){
	// 1) Get undefined because need body-parser
	// 2) Get an empty object since value has no place to go
	// 3) After defining the object in the login.ejs, we can now see it in request.body
	console.log("This is being requested by login.ejs:", request.body);
	//In order to create a session we need some middleware to pass in
	//Between '/login' and function(req/res), we add another function
	//we need passport as middleware thus, npm i passport --save
	//also need: npm i passport-local --save
	response.redirect('/');
});

app.get('/logout', function(request, response){
	//logout the request
	request.logout();
	response.redirect('/login');
});

// 13) configure passport for signup, tell passport to use passportlocal; middleware for signing up
passport.use('signup', new passportLocal.Strategy(function(username, password, callback){
	console.log(username);
	console.log(password);

	var newUser = new User();
	//Comes from fields of schema
	newUser.username = username;
	//use generateHash function on password to salt
	newUser.password = newUser.generateHash(password);

	newUser.save(function(error){
		if (error) console.log("Unable to save new user because:", error);
		// else
		console.log('User saved');
		console.log(newUser);
	});
	//After user is saved need to return callback!!! in order to be used
	//callback is what is coming back to the event loop
	return callback(null, newUser);
}));

//In order to get a sign up page
app.get('/signup', function(request, response){
	response.render('signup');
});

app.post('/signup', passport.authenticate('signup'), function(request, response){
	console.log('in DA SIGN UP controller');
	console.log(request.body);
	response.redirect('/');
});

app.listen(port);
//Verify that server is running, listening to port
console.log("Server is running on", port);