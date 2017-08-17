//$ run with "node app.js"
const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send('Welcome to Mail Server!')
});

app.get('/hello', function (req, res) {
  res.send('hello world!')
});

app.listen(3000, function () {
  console.log('Mail Server listening on port 3000!')
});
