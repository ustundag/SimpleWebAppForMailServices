//$ run with "node app.js"

// web server module imports
const express = require('express');
const cors = require('cors');
const app = express();
// Specific Mail archives
var FILE_INBOX    = "mail_archives/inbox.mbox";
var FILE_SENT     = "mail_archives/sent.mbox";
var FILE_DELETED  = "mail_archives/deleted.mbox";

// enable Cross-origin resource sharing with CORS in localhost
app.use(cors());

app.get('/', function (req, res) {
  res.send('Welcome to Mail Server!')
});

app.get('/inbox', function (req, res) {
  getMailArchive(FILE_INBOX, res);
});
app.get('/sent', function (req, res) {
  getMailArchive(FILE_SENT, res);
});
app.get('/deleted', function (req, res) {
  getMailArchive(FILE_DELETED, res);
});

app.listen(3000, function () {
  console.log('Mail Server started listening on port 3000!')
});

// read/write .mbox file module imports
var MailParser  = require('mailparser').MailParser;
var fs					= require('fs');
var Mbox        = require('node-mbox');

var getMailArchive = function(file, response){
  var messages = [];
	var mbox = new Mbox();

	mbox.on('message', function(msg) {
	  // parse message using MailParser
	  var mailparser = new MailParser({ streamAttachments : true });
	  mailparser.on('end', function(mail) {
	  	messages.push(mail);
	  	if (messages.length == messageCount) {
	  		//console.log('Finished parsing inbox');
        //console.log(messages);
        response.send(JSON.stringify(messages));
        console.log(file + ' has been sent!');
	  	}
	  });
	  mailparser.write(msg);
	  mailparser.end();
	});

	mbox.on('end', function(parsedCount) {
		//console.log('Completed Parsing mbox File.');
		messageCount = parsedCount;
	});

	if (fs.existsSync(file)) {
		//console.log('file exist!');
		var handle = fs.createReadStream(file);
		//handle.setEncoding('ascii');
		handle.pipe(mbox);
	}
	else {
		console.log('file not found: ' + file);
	}
};
