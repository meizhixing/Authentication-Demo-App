var mongoose = require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

//Due to passport local mongoose package
userSchema.plugin(passportLocalMongoose); //add a bunch of methods/functionality/features defined within passport local mongoose package to userSchema.

//due to model export package
module.exports = mongoose.model("User", userSchema);