var util = require("util");
var TwitterAPI = require("./twitter-api");

module.exports = function(app, passport) {
	// handle requests
	// handle index request
	app.get("/", function(req, res) {
		res.render("index.ejs");
	});
	// log the user out (cannot logout from Twitter)
	app.get("/logout", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Authentication required
	// search tweets
	app.get("/tweet", isLoggedIn, function(req, res) {
		var q = req.query.q;
		if (q) { // search term supplied
			new TwitterAPI(req.user.token, req.user.tokenSecret).searchTweets(
				{ q: q, count: 100 },
				function(tw_err, tw_res, tw_body) {
					res.render("tweet.ejs", {
						user	: req.user, // session user
						q		: q, // query string
						error	: getError(tw_err) // error
					});
				},
				function(tw_json) {
					res.render("tweet.ejs", {
						user	: req.user, // session user
						q		: q, // query string
						tweets	: tw_json.statuses // tweets from search
					});
				});
		} else { // no search term
			res.render("tweet.ejs", {
				user:	req.user // session user
			});
		}
	});
	// user timeline
	app.get("/user", isLoggedIn, function(req, res) {
		var screenName = req.query.screenName; // the user to search for
		var showMap = req.query.showMap; // determines if tweets are shown on map
		var head_include = "";
		if (screenName) { // screen name supplied
			new TwitterAPI(req.user.token, req.user.tokenSecret).getUserTimeline(
				{ screen_name: screenName, count: 100 },
				function(tw_err, tw_res, tw_body) {
					res.render("user.ejs", {
						user		: req.user, // session user
						showMap		: showMap,
						screenName	: screenName, // screen name
						error		: getError(tw_err) // error information
					});
				},
				function(tw_json) {
					if (showMap) {
						// remove non-geocoded tweets
						for (var i = tw_json.length - 1; i>= 0; i--) {
							if (tw_json[i] && (typeof tw_json[i].geo == "undefined" || tw_json[i].geo == null)) {
								tw_json.splice(i, 1);
							}
						}
						// include google map script
						head_include += "<script src=\"https://maps.google.com/maps/api/js?sensor=false\" type=\"text/javascript\"></script>";
					}
					res.render("user.ejs", {
						user		: req.user, // session user
						showMap		: showMap,
						screenName	: screenName, // screen name
						head_include: head_include, // code to include in header
						tweets		: tw_json // tweets from searched user
					});
				});
		} else {
			res.render("user.ejs", {
				user	: req.user, // session user
				showMap	: showMap
			});
		}
	});

	// Twitter
	// twitter auth and login
	app.get("/auth/twitter", passport.authenticate("twitter"));
	// twitter auth and login callback
	app.get("/auth/twitter/callback",
		passport.authenticate("twitter", {
			successRedirect: "/tweet",
			failureRedirect: "/"
		})); 

	// handle errors
	// handle 404 not found requests
	app.use(function(req, res, next) {
		res.status(404);

		if (req.accepts("html")) {
			res.render("error/404.ejs", { url: req.url });
		} else if (req.accepts("json")) {
			res.send( { error: "Not found" });
		} else {
			res.type("txt").send("Not found");
		}

		// log 404 information
		console.log("404: " + req.url);
	});
	// handle 500 internal server errors
	app.use(function(err, req, res, next) {
		res.status(500);
		if (req.accepts("html")) {
			res.render("error/500.ejs", { url: req.url });
		} else if (req.accepts("json")) {
			res.send( { error: "Internal server error" });
		} else {
			res.type("txt").send("Internal server error");
		}

		// log 500 information
		console.error("500: " + req.url);
		console.error(err);
	});
};

/**
 * Determine if a user is authenticated.
 * Redirects to index if not authenticated.
 *
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The function if authenticated
 */
function isLoggedIn(req, res, next) {
	// continue if authenticated
	if (req.isAuthenticated())
		return next();

	// not authenticated, redirect to index
	res.redirect("/");
}

/**
 * Determine if a user is authenticated.
 * Redirects to index if not authenticated.
 *
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The function if authenticated
 */
function getError(err) {
console.log("errors: " + JSON.stringify(err));
	try {
		return err.message;
	} catch(error) {}

	return "An unknown error has occured."; // catch all
}
