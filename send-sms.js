// Twilio Credentials
var accountSid = 'AC57d3bd32e3118fec5b037b5fef2a63e8';
var authToken = '47066a79e3940eeafe36b9b6ac3f06a3';

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: "+16462038581", 
    from: "+19737551725",
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
}, function(err, message) {
    console.log(message.sid);
});
