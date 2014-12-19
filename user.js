var mongoose = require('mongoose'),
	// Allow us to create new instances of schemas
    Schema   = mongoose.Schema,
    bcrypt   = require('bcrypt-nodejs');

var UserSchema = new Schema({
	//Create User model
	username: String,
	password: String,

});

//bcrypt to hash it; npm install bcrypt-nodejs --save
//pass in the password
UserSchema.methods.generateHash = function(password){
	//salt for encryption, 8 is the length of the salt
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.isValidPassword = function(password){
	//this is referring to the object context that it is coming from
	return bcrypt.compareSync(password, this.password);
};

//Export to be used elsewhere, call upon it as User and the value is UserSchema
module.exports = mongoose.model("User", UserSchema);