#!/usr/bin/env node

var fs = require("fs");

var logFile = fs.createWriteStream('simple2.mbox', {
  flags: "a",
  encoding: "UTF-8"
});

var mail = "\n\nFrom username Sat Aug 19 2017 15:04:32\nFrom: <mail_address_from>\nTo: muhammed@gmail.com\nCc: velasco@fraunhofer.com\nBcc: bcc@gmail.com\nSubject: compose test mail\n\nHi there! Let's create a mail to append .mbox file.";

//call the write option where you need to append new data
logFile.write(mail);
