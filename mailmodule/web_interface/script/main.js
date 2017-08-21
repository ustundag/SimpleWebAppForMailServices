'use strict';

$(function() {
  console.log( "ready!" );
});

var REST_request_inbox = function(){
  $.ajax({
    url: "http://127.0.0.1:3000/inbox",
    type: 'get',
    dataType: 'text',
    success: function (inbox) {
      console.log(inbox);
    },
    error: function (error) {
      console.log("[REST_request_inbox] error...");
      console.log(error);
    }
  });
};

var REST_request_sent = function(){
  $.ajax({
    url: "http://127.0.0.1:3000/sent",
    type: 'get',
    dataType: 'text',
    success: function (sent) {
      console.log(sent);
    },
    error: function (error) {
      console.log("[REST_request_sent] error...");
      console.log(error);
    }
  });
};

var REST_request_deleted = function(){
  $.ajax({
    url: "http://127.0.0.1:3000/deleted",
    type: 'get',
    dataType: 'text',
    success: function (deleted) {
      console.log(deleted);
    },
    error: function (error) {
      console.log("[REST_request_deleted] error...");
      console.log(error);
    }
  });
};

var REST_send_mail = function(mail){
  $.ajax({
    url: "http://127.0.0.1:3000/compose",
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: mail,
    success: function (success) {
      console.log(success);
    },
    error: function (error) {
      console.log("[REST_send_mail] error...");
      console.log(error);
    }
  });
};

var REST_search_mail = function(keyword){
  $.ajax({
    url: "http://127.0.0.1:3000/search",
    type: 'get',
    data: {
      keywords: keyword
    },
    success: function (success) {
      console.log(success);
    },
    error: function (error) {
      console.log("[REST_search_mail] error...");
      console.log(error);
    }
  });
};

var composeMail = function(){
	var to = $('#to').val();
	// cc and bcc should be checked with respect to ',' comma character
	var cc = $('#cc').val();
	var bcc = $('#bcc').val();
	var subject = $('#subject').val();
	var message = $('#message').val();

  //date must consist exactly 24 character
  var mail_JSON = {
                    "firstLine": "From username " + (new Date()),
                    "From": "<mail_address_from>",
                    "To": to,
                    "Cc": cc,
                    "Bcc": bcc,
                    "Subject": subject,
                    "Message": message
                  };

  console.log(JSON.stringify(mail_JSON));
  REST_send_mail(JSON.stringify(mail_JSON));
};
