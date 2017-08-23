//$ run with "node app.js"

// web server module imports
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
// enable Cross-origin resource sharing with CORS in localhost
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Specific Mail archives
var FILE_INBOX    = "mail_archives/inbox.mbox";
var FILE_SENT     = "mail_archives/sent.mbox";
var FILE_DELETED  = "mail_archives/deleted.mbox";
// read/write .mbox file module imports
var fs					= require('fs');
var MailParser  = require('mailparser').MailParser;
var Mbox        = require('node-mbox');

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
app.post('/compose', function (req, res) {
  var mail_str = req.body.firstLine + '\n' +
                 'From: '+ req.body.From + '\n' +
                 'To: '  + req.body.To + '\n' +
                 'Cc: '  + req.body.Cc + '\n' +
                 'Bcc: ' + req.body.Bcc + '\n' +
                 'Subject: ' + req.body.Subject + '\n' +
                 '\n' + req.body.Message + '\n';

  sendMail(mail_str);
  console.log('Mail has been sent!');
  res.send('Mail has been sent!');
});
app.get('/search', function (req, res) {
  switch (req.query.file) {
    case "search_inbox":
      searchInArchive(FILE_INBOX, req.query.keywords, res);
      break;
    case "search_sent":
      searchInArchive(FILE_SENT, req.query.keywords, res);
      break;
    case "search_deleted":
      searchInArchive(FILE_DELETED, req.query.keywords, res);
      break;
    default:
      console.log("Sorry, Invalid search request!");
  }
});
app.post('/remove', function (req, res) {
  var file = req.body.file;
  var indexList = req.body.index;
  indexList.forEach(function(index) {
      console.log(index);
  });
  res.send('Mails has been deleted!');
});
app.listen(3000, function () {
  console.log('Mail Server started listening on port 3000!')
});

var removeFromArchive = function(file, index){
  var messages = [];
  var mail_str = '';
	var mbox = new Mbox();
  var missed = 0;
	mbox.on('message', function(msg) {
	  // parse message using MailParser
	  var mailparser = new MailParser({ streamAttachments : true });
	  mailparser.on('end', function(mail) {
      mail_str = JSON.stringify(mail);
      mail_str = mail_str.toLowerCase();
      if(mail_str.indexOf(keywords.toLowerCase()) >= 0) {
  	     messages.push(mail);
      }
      else{
        missed++;
      }
      if (messages.length + missed == messageCount) {
	  		//console.log('Finished parsing inbox');
        //console.log(messages);
        response.send(JSON.stringify(messages)+'');
        console.log('Filtered mail list has been sent for ' + file);
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

var searchInArchive = function(file, keywords, response){
  var messages = [];
  var mail_str = '';
	var mbox = new Mbox();
  var missed = 0;
	mbox.on('message', function(msg) {
	  // parse message using MailParser
	  var mailparser = new MailParser({ streamAttachments : true });
	  mailparser.on('end', function(mail) {
      mail_str = JSON.stringify(mail);
      mail_str = mail_str.toLowerCase();
      if(mail_str.indexOf(keywords.toLowerCase()) >= 0) {
  	     messages.push(mail);
      }
      else{
        missed++;
      }
      if (messages.length + missed == messageCount) {
	  		//console.log('Finished parsing inbox');
        //console.log(messages);
        response.send(JSON.stringify(messages)+'');
        console.log('Filtered mail list has been sent for ' + file);
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

var sendMail = function(mail){
  var logFile = fs.createWriteStream(FILE_SENT, {
    flags: "a",
    encoding: "UTF-8"
  });
  //call the write option where you need to append new data
  logFile.write(mail+"\n");
}

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
