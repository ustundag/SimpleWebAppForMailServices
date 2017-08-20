#!/usr/bin/env node

var MailParser  = require('mailparser').MailParser;
var fs					= require('fs');
var Mbox        = require('node-mbox');

var FILE_INBOX = "simple2.mbox";

function main() {
	var messages = [];
	var total = Infinity;
	var mbox = new Mbox();
	mbox.on('message', function(msg) {
	  // parse message using MailParser
	  var mailparser = new MailParser({ streamAttachments : true });
	  mailparser.on('end', function(mail) {
	  	messages.push(mail);
	  	if (messages.length == messageCount) {
	  		console.log('Finished parsing messages');
  			console.log(messages);
	  	}
	  });
	  mailparser.write(msg);
	  mailparser.end();
	});

	mbox.on('end', function(parsedCount) {
		console.log('Completed Parsing mbox File.');
		messageCount = parsedCount;
	});

	if (fs.existsSync(FILE_INBOX)) {
		console.log('file exist!');
		var handle = fs.createReadStream(FILE_INBOX);
		//handle.setEncoding('ascii');
		handle.pipe(mbox);
	}
	else {
		console.log('file not found!');
	}
};

main();
