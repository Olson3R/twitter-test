var TwitterStrategy  = require('passport-twitter').Strategy;
var config = require("../config/auth").twitterAuth; // twitter auth variables

module.exports = function(passport) {
	// serialize user for the session
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	// deserialize the user
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	// Twitter authentication strategy and callback function
	passport.use(new TwitterStrategy({
		consumerKey		: config.consumerKey,
		consumerSecret	: config.consumerSecret,
		callbackURL		: config.callbackURL
	},
	function(token, tokenSecret, profile, done) {
		// needs to be asynchronous so we have all the data
		process.nextTick(function() {
			// populate user model
			var user = {
				id			: profile.id,
				token		: token,
				tokenSecret	: tokenSecret,
				username	: profile.username,
				displayName	: profile.displayName
			};

			return done(null, user);
		});
	}));
};
