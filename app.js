//============================================================================//
//===== DEFINE AND INITIALIZE STARTED ========//
//express
var express = require("express");
var app = express();

//body-parser to use req.body. ...
var bodyParser  = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//mongoose
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/auth_demo_app', { useNewUrlParser: true });

//User model    
var User = require("./models/user");

//express-session
var expressSession = require("express-session");
app.use(expressSession({
    secret: "This is the secret line. It could be anything I want. This secret will be used to encode and decode the sessions.",
    resave: false,
    saveUninitialized: false
}));

var passportLocalMongoose = require("passport-local-mongoose");

//passport
var passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
//they are responsible for reading the session, taking the data from the session that's encoded and unencoding it(deserialize) 
//and then encoding it and putting it back into the session is done by serialize.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passport-local and passport-local-mongoose
var localStrategy = require("passport-local");
passport.use(new localStrategy(User.authenticate()));

app.set("view engine", "ejs");

//===== DEFINE AND INITIALIZE ENDS ========//

//============================================================================//

app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

//AUTH Routes

//=========== SIGN UP =====================//

//show signup form

app.get("/register", function(req, res){
    res.render("register");
});

//sign up to the DB

app.post("/register", function(req, res){
    
    //we make a new User object that isnt saved into the database yet. We only pass in username through it. The reason for only sending username
    //is because we dont actually save the password in the database.
    //User.register will take password as an argument and hash that password, meaning it will turn it into a huge string of letters and numbers
    //and it stores that in the database.
    //And then if everything goes well, it will then return a new user that has everything (username and hashed password) inside of it.
    
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.render("register");
        } else {
            //passport.authenticate will run the serializeUser method. It will log the user in. It will take of everything in the session.
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secret");
            });
        }
    });
});

//=========== LOGIN =====================//

//render login form
app.get("/login", function(req, res){
    res.render("login");
})

//login logic
//middleware: the code that runs before the final route callback function. middleware here is passport.authenticate method
//middleware sits between the beginning of the route and the end.
//passport automatically takes in the username and password and authenticates.
//The password is compared to hashed password
//passport.authenticate is provided an object with 2 parameters

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "login"
}), 
    function(req, res){
        
    });
    
//=========== LOGOUT =====================//

//req.logout is a method from passport.
//Even after we logout, if we go to OR if someone knows the url(.../secret), we can access it.
//To prevent this, we have to create a middleware isLoggedIn

app.get("/logout", function(req, res){
    
    //passport destroys the user data in this session. It is no longer keeping track of user data in this session from request to request.
   req.logout(); 
   
   res.redirect("/");
});

//==================== isLOGGEDIN MIDDLEWARE ========================//
//function to check if the user is still logged in or not.
//these are standard argument for middleware
//req and res refers to request and response object
//next refers to the next thing that needs to be called.
//The arguments/parameters are standard, meaning predefined in express.
//isAuthenticated method is derived from passport

function isLoggedIn(req, res, next){
    
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/login");
    }
};

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("=========> SERVER has started.......");
});