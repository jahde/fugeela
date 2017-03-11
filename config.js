
var dotenv = require('dotenv');
var cfg = {};

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.config({path: '.env'});
} else {
  dotenv.config({path: '.env.test', silent: true});
}

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// A random string that will help generate secure one-time passwords and
// HTTP sessions
cfg.secret = process.env.APP_SECRET || 'keyboard cat';

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
cfg.accountSid = 'AC57d3bd32e3118fec5b037b5fef2a63e8';
cfg.authToken = '47066a79e3940eeafe36b9b6ac3f06a3';
cfg.sendingNumber = '+19737551725';

var requiredConfig = [cfg.accountSid, cfg.authToken, cfg.sendingNumber];
var isConfigured = requiredConfig.every(function(configValue) {
  return configValue || false;
});

if (!isConfigured) {
  var errorMessage =
    'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER must be set.';

  throw new Error(errorMessage);
}

// Export configuration object
module.exports = cfg;
