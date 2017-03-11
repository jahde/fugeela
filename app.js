var express = require('express')
var app = express()
var path = require('path');

// Authenticator
app.use(express.basicAuth('testUser', 'testPass'));

app.get('/', function (req, res) {
  // res.send('Hello World Jahde!')
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/jahde', function (req, res) {
  // res.send('Hello World Jahde!')
  res.sendFile(path.join(__dirname + '/video.html'))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
