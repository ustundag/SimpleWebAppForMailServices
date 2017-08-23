'use strict';

!function(a,b){function g(b,c){this.$element=a(b),this.settings=a.extend({},f,c),this.init()}var e="floatlabel",f={slideInput:!0,labelStartTop:"20px",labelEndTop:"10px",paddingOffset:"10px",transitionDuration:.3,transitionEasing:"ease-in-out",labelClass:"",typeMatches:/text|password|email|number|search|url/};g.prototype={init:function(){var a=this,c=this.settings,d=c.transitionDuration,e=c.transitionEasing,f=this.$element,g={"-webkit-transition":"all "+d+"s "+e,"-moz-transition":"all "+d+"s"+e,"-o-transition":"all "+d+"s "+e,"-ms-transition":"all "+d+"s "+e,transition:"all "+d+"s "+e};if("INPUT"===f.prop("tagName").toUpperCase()&&c.typeMatches.test(f.attr("type"))){var h=f.attr("id");h||(h=Math.floor(100*Math.random())+1,f.attr("id",h));var i=f.attr("placeholder"),j=f.data("label"),k=f.data("class");k||(k=""),i&&""!==i||(i="You forgot to add placeholderattribute!"),j&&""!==j||(j=i),this.inputPaddingTop=parseFloat(f.css("padding-top"))+parseFloat(c.paddingOffset),f.wrap('<div class="floatlabel-wrapper" style="position:relative"></div>'),f.before('<label for="'+h+'" class="label-floatlabel '+c.labelClass+" "+k+'">'+j+"</label>"),this.$label=f.prev("label"),this.$label.css({position:"absolute",top:c.labelStartTop,left:f.css("padding-left"),display:"none","-moz-opacity":"0","-khtml-opacity":"0","-webkit-opacity":"0",opacity:"0"}),c.slideInput||f.css({"padding-top":this.inputPaddingTop}),f.on("keyup blur change",function(b){a.checkValue(b)}),b.setTimeout(function(){a.$label.css(g),a.$element.css(g)},100),this.checkValue()}},checkValue:function(a){if(a){var b=a.keyCode||a.which;if(9===b)return}var c=this.$element,d=c.data("flout");""!==c.val()&&c.data("flout","1"),""===c.val()&&c.data("flout","0"),"1"===c.data("flout")&&"1"!==d&&this.showLabel(),"0"===c.data("flout")&&"0"!==d&&this.hideLabel()},showLabel:function(){var a=this;a.$label.css({display:"block"}),b.setTimeout(function(){a.$label.css({top:a.settings.labelEndTop,"-moz-opacity":"1","-khtml-opacity":"1","-webkit-opacity":"1",opacity:"1"}),a.settings.slideInput&&a.$element.css({"padding-top":a.inputPaddingTop}),a.$element.addClass("active-floatlabel")},50)},hideLabel:function(){var a=this;a.$label.css({top:a.settings.labelStartTop,"-moz-opacity":"0","-khtml-opacity":"0","-webkit-opacity":"0",opacity:"0"}),a.settings.slideInput&&a.$element.css({"padding-top":parseFloat(a.inputPaddingTop)-parseFloat(this.settings.paddingOffset)}),a.$element.removeClass("active-floatlabel"),b.setTimeout(function(){a.$label.css({display:"none"})},1e3*a.settings.transitionDuration)}},a.fn[e]=function(b){return this.each(function(){a.data(this,"plugin_"+e)||a.data(this,"plugin_"+e,new g(this,b))})}}(jQuery,window,document);

var REMOVE = [];
REMOVE.push(1);
REMOVE.push('asd');
REMOVE.push(5);
console.log("REMOVE:"+REMOVE);

$(function() {
  $('.form-control').floatlabel({
        labelClass: 'float-label',
        labelEndTop: 5
  });
  console.log("ready!");
  REST_request_inbox();
  // Enable enter key for search bar
  $('.mail-search').on('keypress', function (e) {
        if(e.which === 13){
           //Disable textbox to prevent multiple submit
           $(this).attr("disabled", "disabled");
           //console.log("$(this).attr('id'): " + $(this).attr('id'));
           REST_search_mail($(this).attr('id'), $(this).val());
           //Enable the textbox again if needed.
           $(this).removeAttr("disabled");
        }
  });

  var file_type = "test file";
  var delete_JSON = {
                    "file": file_type,
                    "index": REMOVE
                  };

  REST_remove_mail(JSON.stringify(delete_JSON));

});
// TODO: open popup when clicking an email
// TODO: add ability of delete
// TODO: compose mail: append new mail at the beginning, not at the end

var REST_request_inbox = function(){
  //clear search field
  $('.mail-search').val('');
  $('.mail-search').blur();
  $.ajax({
    url: "http://127.0.0.1:3000/inbox",
    type: 'get',
    success: function (inbox) {
      load_mails(".tab-content #inbox tbody", inbox);
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
    success: function (sent) {
      load_mails(".tab-content #sent-mail tbody", sent);
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
    success: function (deleted) {
      load_mails(".tab-content #trash tbody", deleted);
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
      //console.log(success);
    },
    error: function (error) {
      console.log("[REST_send_mail] error...");
      console.log(error);
    }
  });
};

var REST_search_mail = function(category, keyword){
  $.ajax({
    url: "http://127.0.0.1:3000/search",
    type: 'get',
    data: {
      file: category,
      keywords: keyword
    },
    success: function (success) {
      switch (category) {
        case "search_inbox":
          load_mails(".tab-content #inbox tbody", success);
          break;
        case "search_sent":
          load_mails(".tab-content #sent-mail tbody", success);
          break;
        case "search_deleted":
          load_mails(".tab-content #trash tbody", success);
          break;
        default:
          console.log("Sorry, Invalid category!");
      }
    },
    error: function (error) {
      console.log("[REST_search_mail] error...");
      console.log(error);
    }
  });
};

var REST_remove_mail = function(delete_JSON){
  $.ajax({
    url: "http://127.0.0.1:3000/remove",
    type: 'post',
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    data: delete_JSON,
    success: function (success) {
      //console.log(success);
    },
    error: function (error) {
      console.log("[REST_remove_mail] error...");
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
                    "firstLine": "From " + "Anil Ustundag" + (' '+new Date()).substr(0,24),
                    "From": "anilu@rwth-aachen.com",
                    "To": to,
                    "Cc": cc,
                    "Bcc": bcc,
                    "Subject": subject,
                    "Message": message
                  };

  //console.log(JSON.stringify(mail_JSON));
  REST_send_mail(JSON.stringify(mail_JSON));
};

var load_mails = function(path, mail_list){
  $(path + ' tr').remove();
  var mails = JSON.parse(mail_list);
  var mail;
  var mail_from = "";
  var sender = "";
  for(var i in mails) {
    mail = mails[i];
    mail_from = mail["from"][0];
    sender = mail_from["name"] +" "+ mail_from["address"];
  	$(path)
  	.append($('<tr id='+i+'>')
  		.append($('<td>')
  			.append($('<input type="checkbox">')))
  		.append($('<td class="mailbox-name">')
  			.append($('<a style="color:#0033cc;">').html(sender.substr(0,20)+"...")))
  		.append($('<td class="mailbox-subject">')
  			.html("<b>"+(mail["subject"]).substr(0,20)+'...</b>  -  "' + mail["text"].substr(0,70)+'..."'))
  		.append($('<td class="mailbox-date">').html("Time"))
  	);

  }
};
