var express = require("express");
var passport = require("passport"); // used for authentication
var engine = require("ejs-locals"); // used for layouts

var port = process.env.PORT || 5000; // port to listen on
var app = express();

// local variables
app.locals({
	title: "Twitter Test"
});

app.use("/public", express.static(__dirname + "/public")); // serve static pages
app.engine("ejs", engine); // ejs template engine
app.set("views", __dirname + "/app/views"); // specify direectory for views
app.set("view engine", "ejs"); // specify view engine
app.use(express.logger()); // log requests
app.use(express.urlencoded()); // parse urlencoded request bodies to req.body
app.use(express.json()); // parse json request bodies to req.body
app.use(express.cookieParser()); // req.cookie
app.use(express.session({ secret: 'aV9mOMgQRo7QUmH' })); // session secret
app.use(passport.initialize()); // initialize passport
app.use(passport.session()); // initialize passport session
app.use(express.csrf()); // handle cross site request forgery
app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); // log errors

// config
require("./app/passport")(passport); // passport config

require('./app/routes.js')(app, passport); // route requests

// start listening for requests
app.listen(port, function() {
	console.log("Listening on port " + port);
});
