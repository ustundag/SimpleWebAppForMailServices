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

// Mail archive names
var FILE_INBOX   = "mail_archives/inbox.mbox";
var FILE_SENT    = "mail_archives/sent.mbox";
var FILE_DELETED = "mail_archives/deleted.mbox";

// Libraries to manipulate .mbox archives
var MailParser  = require('mailparser').MailParser;
var Mbox        = require('node-mbox');
// read/write .mbox file module imports
var fs = require('fs');
// add data at the beginning
var prependFile = require('prepend-file');

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
                  'Date: ' + req.body.Date + '\n' +
                  'Subject: ' + req.body.Subject + '\n' +
                  '\n' + req.body.Message + '\n';
   prependMail(FILE_SENT, mail_str, res);
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
         console.log("[GET /search] Sorry, Invalid search request!");
   }
});
app.post('/remove', function (req, res) {
   switch (req.body.file) {
      case "inbox":
         removeFromArchive(FILE_INBOX, req.body.index_list, res);
         break;
      case "sent":
         removeFromArchive(FILE_SENT, req.body.index_list, res);
         break;
      case "trash":
         removeFromArchive(FILE_DELETED, req.body.index_list, res);
         break;
      default:
         console.log("[POST /remove] Unexpected file type: " + req.body.file);
   }
});
app.listen(3000, function () {
  console.log('Mail Server started listening on port 3000!')
});

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
            response.send(JSON.stringify(messages));
            console.log("[GET getMailArchive] "+file+ ' has been sent!');
         }
      });
      mailparser.write(msg);
      mailparser.end();
   });

   mbox.on('end', function(parsedCount) {
      //console.log('Completed Parsing mbox File.');
      if (parsedCount === 0) {
         response.send([]);
         console.log("[GET getMailArchive] "+file+ ' No mails found!');
      }
      else {
         messageCount = parsedCount;
      }
   });

   if (fs.existsSync(file)) {
      //console.log('file exist!');
      var handle = fs.createReadStream(file);
      //handle.setEncoding('ascii');
      handle.pipe(mbox);
   }
   else {
      console.log('[GET getMailArchive] File not found: '+file);
   }
};
var prependMail = function(file, mail, response){
   prependFile(FILE_SENT, mail + "\n", function (err) {
      if (err) {
         console.log("[POST /compose prependMail] Error: "+err);
      }
      response.send('[POST /compose] Mail has been sent!');
      console.log('[POST /compose] Mail has been sent!');
   });
}
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
            console.log('[GET /search searchInArchive] Filtered mail list has been sent for '+file);
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
      console.log('[GET /search searchInArchive] File not found: ' + file);
   }
};
var removeFromArchive = function(file, arr, response){
   var messages = []; // rewrite on same file
   var removed  = []; // write on delete file
   var mbox  = new Mbox();
   var index = 0;
   var found = 0;

   mbox.on('message', function(msg) {
      // parse message using MailParser
      var mailparser = new MailParser({ streamAttachments : true });
      mailparser.on('end', function(mail) {
         if(arr.includes(index)){
            found++;
            //console.log("Found! : index"+index);
            removed.push(mail);
         }
         else {
            //console.log("Not found!");
            messages.push(mail);
         }
         index++;
         if (messages.length + found == messageCount) {
            updateDeletedMails(file, messages, removed, response);
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
      console.log('[POST /remove removeFromArchive] File not found: ' + file);
   }
};
var updateDeletedMails = function(file, messages, removed, response){
   fs.truncate(file, 0, function(){
      console.log("[POST /remove removeFromArchive] "+file+' truncated!');
   });
   messages.forEach(function(msg) {
      appendMail(file, toString(msg));
   });
   if(file != FILE_DELETED){
      removed.forEach(function(msg) {
         appendMail(FILE_DELETED, toString(msg));
      });
   }
   console.log('[POST /remove removeFromArchive updateDeletedMails] Mails have been deleted!');
   response.send('[POST /remove removeFromArchive updateDeletedMails] Mails have been deleted!');
}
var appendMail = function(file, mail){
   //call the write option where you need to append new data
   var logFile = fs.createWriteStream(file, {
      flags: "a",
      encoding: "UTF-8"
   });
   // Check first line
   fs.readFile(file, function(err, f){
      var array = f.toString().split('\n');
      if (array[0]) {
         //console.log("[appendMail()] First line of " +file+ " not null");
         logFile.write("\n");
      }
      logFile.write(mail);
   });
}
var toString = function(obj){
   var headers = obj.headers;
   var mail_str = "";
   mail_str =  'From ' + headers.from + headers.date.substr(0,24) + '\n' +
               'From: ' + headers.from + '\n' +
               'To: '   + headers.to + '\n';
   mail_str = (headers.cc  ? mail_str + 'Cc: '  + headers.cc  + '\n' : mail_str);
   mail_str = (headers.bcc ? mail_str + 'Bcc: ' + headers.bcc + '\n' : mail_str);
   mail_str =  mail_str +
               'Date: '    + headers.date + '\n' +
               'Subject: ' + headers.subject + '\n' +
               '\n' + obj.text + '\n';
   return mail_str;
}
