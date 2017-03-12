var express = require('express')
var app = express()
var path = require('path')
var basicAuth = require('basic-auth')
var bodyParser = require('body-parser')
var session = require('express-session')

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.png');
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

// // TEST Mong
// var MongoClient = require('mongodb').MongoClient
// var assert = require('assert');
//
// // Connection URL
// var url = 'mongodb://localhost:27017/fugeela';
// // Use connect method to connect to the server
// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected successfully to server");
//
//   insertDocuments(db, function() {
//     db.close();
//   });
// });
// // END test

// token management
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var twilioClient = require('./twilioClient');

var pathToMongoDb = 'mongodb://localhost:27017/fugeela';
passwordless.init(new MongoStore(pathToMongoDb));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'bla bla bla'
}));

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        var host = 'localhost:3000/jahde';
        var smsAddress = '16462038581';
        var smsMessage = 'Hello!\nAccess your video diary here: http://'
        + host + '?token=' + tokenToSend + '&uid='
        + encodeURIComponent(uidToSend);
        twilioClient.sendSms(smsAddress, smsMessage);
});

// Authenticator
// app.use(basicAuth('testUser', 'testPass'));
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};

app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));

app.get('/', auth, function (req, res) {
  // res.send('Hello World Jahde!')
  res.sendFile(path.join(__dirname + '/index.html'))
})

var users = [
    { id: 1, email: 'jahde@example.com' },
    { id: 2, email: 'alice@example.com' }
];

/* POST login details. */
app.post('/sendtoken',
    passwordless.requestToken(
        function(user, delivery, callback) {
            for (var i = users.length - 1; i >= 0; i--) {
                if(users[i].email === user.toLowerCase()) {
                    return callback(null, users[i].id);
                }
            }
            callback(null, null);
        }),
        function(req, res) {
            // success!
        res.render('sent');
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
        // res.redirect('/jahde');
    });
});

// app.post('/sendtoken',
//     passwordless.requestToken(
//         // Turn the email address into an user ID
//         function(user, delivery, callback, req) {
//             // usually you would want something like:
//             User.find({email: user}, callback(ret) {
//                if(ret)
//                   callback(null, ret.id)
//                else
//                   callback(null, null)
//           })
//           // but you could also do the following
//           // if you want to allow anyone:
//           // callback(null, user);
//         }),
//     function(req, res) {
//        // success!
//           res.render('sent');
// });

var testFolder = './uploads/';
var fs = require('fs');
var imagesArr = [];
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    imagesArr.push(file);
    console.log(file);
  });
})

app.get('/images', function (req, res) {
  res.json({ images: imagesArr });
})

app.get('/jahde', function (req, res) {
  res.sendFile(path.join(__dirname + '/video.html'))
})

app.post('/', function (req, res) {
  res.redirect('/jahde');
  // res.send('Got a POST request')
})

app.get('/restart', function (req, res, next) {
  process.exit(1);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
