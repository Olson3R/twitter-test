/**
 * Twitter API wrapper
 * Implements:
 * 	/search/tweets.json
 * 	/statuses/user_timeline.json
 */
var OAuth = require('oauth').OAuth;
var qs = require('qs');
var config = require('../config/auth').twitterAuth; // twitter configurations

/**
 * Stores OAuth information and initializes OAuth object.
 *
 * @param {String} accessToken Twitter user access token
 * @param {String} accessTokenSecret Twitter user access token secret
 */
function Twitter(accessToken, accessTokenSecret) {
	this.consumerKey = config.consumerKey;
	this.consumerSecret = config.consumerSecret;
	this.accessToken = accessToken;
	this.accessTokenSecret = accessTokenSecret;
	this.callBackUrl = config.callBackUrl;
	this.baseUrl = 'https://api.twitter.com/1.1';
	this.oauth = new OAuth(
		'https://api.twitter.com/oauth/request_token',
		'https://api.twitter.com/oauth/access_token',
		this.consumerKey,
		this.consumerSecret,
		'1.0',
		this.callBackUrl,
		'HMAC-SHA1'
	);
}

/**
 * Retrieve a user's timeline using /statuses/user_timeline.json.
 *
 * @param {Object} params Requires information to identify the user
 * @param {Function} error The function to call for an error response
 * @param {Function} success The function to call for a success response
 */
Twitter.prototype.getUserTimeline = function (params, error, success) {
	var path = '/statuses/user_timeline.json' + this.buildQS(params);
	var url = this.baseUrl + path;
	this.doRequest(url, error, success);
};

/**
 * Retrieve tweets matching search criteria using /search/tweets.json.
 *
 * @param {Object} params Requires tweet search criteria
 * @param {Function} error The function to call for an error response
 * @param {Function} success The function to call for a success response
 */
Twitter.prototype.searchTweets = function (params, error, success) {
	var path = '/search/tweets.json' + this.buildQS(params);
	var url = this.baseUrl + path;
	this.doRequest(url, error, success);
};

/**
 * Send a request to the Twitter API and route the response.
 *
 * @param {String} url The Twitter API URL to call
 * @param {Function} error The function to call for an error response
 * @param {Function} success The function to call for a success response
 */
Twitter.prototype.doRequest = function (url, error, success) {
	this.oauth.get(url, this.accessToken, this.accessTokenSecret, function (err, body, response) {
		console.log("TwitterAPI: " + url);
		if (!err && response.statusCode == 200) {
			var json = JSON.parse(body);
			success(json);
		} else {
			try {
				var data = JSON.parse(err.data);
				error({ statusCode: err.statusCode, message: data.errors[0].message }, response, body); // return twitter api error
			} catch(error) {
				error(err, response, body);
			}
		}
	});
};

/**
 * Build a query string from the params objects properties.
 *
 * @param {Object} params An object containing the parameter key/value pairs
 * @return {String} Query string built from the key/value pairs
 */
Twitter.prototype.buildQS = function (params) {
	if (params && Object.keys(params).length > 0) {
		return '?' + qs.stringify(params);
	}
	return '';
};

if (!(typeof exports === 'undefined')) {
	module.exports = Twitter;
}
