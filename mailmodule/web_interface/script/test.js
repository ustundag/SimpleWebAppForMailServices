'use strict';

!function(a,b){function g(b,c){this.$element=a(b),this.settings=a.extend({},f,c),this.init()}var e="floatlabel",f={slideInput:!0,labelStartTop:"20px",labelEndTop:"10px",paddingOffset:"10px",transitionDuration:.3,transitionEasing:"ease-in-out",labelClass:"",typeMatches:/text|password|email|number|search|url/};g.prototype={init:function(){var a=this,c=this.settings,d=c.transitionDuration,e=c.transitionEasing,f=this.$element,g={"-webkit-transition":"all "+d+"s "+e,"-moz-transition":"all "+d+"s"+e,"-o-transition":"all "+d+"s "+e,"-ms-transition":"all "+d+"s "+e,transition:"all "+d+"s "+e};if("INPUT"===f.prop("tagName").toUpperCase()&&c.typeMatches.test(f.attr("type"))){var h=f.attr("id");h||(h=Math.floor(100*Math.random())+1,f.attr("id",h));var i=f.attr("placeholder"),j=f.data("label"),k=f.data("class");k||(k=""),i&&""!==i||(i="You forgot to add placeholderattribute!"),j&&""!==j||(j=i),this.inputPaddingTop=parseFloat(f.css("padding-top"))+parseFloat(c.paddingOffset),f.wrap('<div class="floatlabel-wrapper" style="position:relative"></div>'),f.before('<label for="'+h+'" class="label-floatlabel '+c.labelClass+" "+k+'">'+j+"</label>"),this.$label=f.prev("label"),this.$label.css({position:"absolute",top:c.labelStartTop,left:f.css("padding-left"),display:"none","-moz-opacity":"0","-khtml-opacity":"0","-webkit-opacity":"0",opacity:"0"}),c.slideInput||f.css({"padding-top":this.inputPaddingTop}),f.on("keyup blur change",function(b){a.checkValue(b)}),b.setTimeout(function(){a.$label.css(g),a.$element.css(g)},100),this.checkValue()}},checkValue:function(a){if(a){var b=a.keyCode||a.which;if(9===b)return}var c=this.$element,d=c.data("flout");""!==c.val()&&c.data("flout","1"),""===c.val()&&c.data("flout","0"),"1"===c.data("flout")&&"1"!==d&&this.showLabel(),"0"===c.data("flout")&&"0"!==d&&this.hideLabel()},showLabel:function(){var a=this;a.$label.css({display:"block"}),b.setTimeout(function(){a.$label.css({top:a.settings.labelEndTop,"-moz-opacity":"1","-khtml-opacity":"1","-webkit-opacity":"1",opacity:"1"}),a.settings.slideInput&&a.$element.css({"padding-top":a.inputPaddingTop}),a.$element.addClass("active-floatlabel")},50)},hideLabel:function(){var a=this;a.$label.css({top:a.settings.labelStartTop,"-moz-opacity":"0","-khtml-opacity":"0","-webkit-opacity":"0",opacity:"0"}),a.settings.slideInput&&a.$element.css({"padding-top":parseFloat(a.inputPaddingTop)-parseFloat(this.settings.paddingOffset)}),a.$element.removeClass("active-floatlabel"),b.setTimeout(function(){a.$label.css({display:"none"})},1e3*a.settings.transitionDuration)}},a.fn[e]=function(b){return this.each(function(){a.data(this,"plugin_"+e)||a.data(this,"plugin_"+e,new g(this,b))})}}(jQuery,window,document);

// To be used when opening mails
var INBOX = [];
var SENT  = [];
var TRASH = [];
var FILTERED = [];

var CHECKBOX_COUNT_INBOX = 0;
var CHECKBOX_COUNT_SENT  = 0;
var CHECKBOX_COUNT_TRASH = 0;

var PAGE_CATEGORY = '';

var SEARCHED = false;

$(function() {
   $('.form-control').floatlabel({
      labelClass: 'float-label',
      labelEndTop: 5
   });
   REST_request_inbox();

   // Enable enter key for search bar
   $('.mail-search').on('keypress', function (e) {
      if(e.which === 13){
         //Disable textbox to prevent multiple submit
         $(this).attr("disabled", "disabled");
         if($(this).val().trim() != ''){
            SEARCHED = true;
            REST_search_mail($(this).attr('id'), $(this).val().trim());
         }
         else {
           SEARCHED = false;
           REST_request_inbox();
           REST_request_sent();
           REST_request_deleted();
         }
         //Enable the textbox again if needed.
         $(this).removeAttr("disabled");
      }
   });

   // listeners for showing delete button
   $(document).on("change", ".tab-content #inbox input[type=checkbox]", function () {
      var $this = $(this);
      // $this will contain a reference to the checkbox
      if ($this.is(':checked')) {
         // the checkbox was checked
         $('#btn_delete').show();
         CHECKBOX_COUNT_INBOX++;
      } else {
         // the checkbox was unchecked
         CHECKBOX_COUNT_INBOX--;
         // === -> equal value and equal type
         if(CHECKBOX_COUNT_INBOX===0){
            $('#btn_delete').hide();
         }
      }
   });
   $(document).on("change", ".tab-content #sent-mail input[type=checkbox]", function () {
      var $this = $(this);
      // $this will contain a reference to the checkbox
      if ($this.is(':checked')) {
         // the checkbox was checked
         $('#btn_delete').show();
         CHECKBOX_COUNT_SENT++;
      } else {
         // the checkbox was unchecked
         CHECKBOX_COUNT_SENT--;
         // === -> equal value and equal type
         if(CHECKBOX_COUNT_SENT===0){
            $('#btn_delete').hide();
         }
      }
   });
   $(document).on("change", ".tab-content #trash input[type=checkbox]", function () {
      var $this = $(this);
      // $this will contain a reference to the checkbox
      if ($this.is(':checked')) {
         // the checkbox was checked
         $('#btn_delete').show();
         CHECKBOX_COUNT_TRASH++;
      } else {
         // the checkbox was unchecked
         CHECKBOX_COUNT_TRASH--;
         // === -> equal value and equal type
         if(CHECKBOX_COUNT_TRASH===0){
            $('#btn_delete').hide();
         }
      }
   });

   console.log("Mail client is ready!");
});

var REST_request_inbox = function(){
   SEARCHED = false;
   PAGE_CATEGORY = "inbox";
   $('#inbox input:checkbox').each(function() {
      $(this).prop('checked', false);
   });
   $('#btn_delete').hide();
   //clear search field
   $('.mail-search').val('');
   $('.mail-search').blur();
   $.ajax({
      url: "http://127.0.0.1:3000/inbox",
      type: 'get',
      success: function (inbox) {
         if (inbox!='') {
           INBOX = JSON.parse(inbox);
           load_mails(".tab-content #inbox tbody", inbox);
           backToTabContent();
         }
      },
      error: function (error) {
         console.log("[REST_request_inbox] error...");
         console.log(error);
      }
   });
};

var REST_request_sent = function(){
   SEARCHED = false;
   PAGE_CATEGORY = "sent";
   $('#sent-mail input:checkbox').each(function() {
      $(this).prop('checked', false);
   });
   $('#btn_delete').hide();
   //clear search field
   $('.mail-search').val('');
   $('.mail-search').blur();
   $.ajax({
      url: "http://127.0.0.1:3000/sent",
      type: 'get',
      success: function (sent) {
         if (sent!='') {
           SENT = JSON.parse(sent);
           load_mails(".tab-content #sent-mail tbody", sent);
           backToTabContent();
         }
      },
      error: function (error) {
         console.log("[REST_request_sent] error...");
         console.log(error);
      }
   });
};

var REST_request_deleted = function(){
   SEARCHED = false;
   PAGE_CATEGORY = "trash";
   $('#trash input:checkbox').each(function() {
      $(this).prop('checked', false);
   });
   $('#btn_delete').hide();
   //clear search field
   $('.mail-search').val('');
   $('.mail-search').blur();
   $.ajax({
      url: "http://127.0.0.1:3000/deleted",
      type: 'get',
      success: function (deleted) {
         if (deleted!='') {
           TRASH = JSON.parse(deleted);
           load_mails(".tab-content #trash tbody", deleted);
           backToTabContent();
         }
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
      data: mail,
      success: function (success) {
         $('#sent-mail').addClass('active');
         $('#compose').removeClass('active');
         REST_request_sent();
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
      FILTERED = JSON.parse(success);
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
            console.log("[REST_search_mail] Sorry, Invalid category: "+category);
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
   // Cc and Bcc should be checked with respect to ',' comma character
   var cc  = $('#cc').val();
   var bcc = $('#bcc').val();
   var subject = $('#subject').val();
   var message = $('#message').val();

   var mail_JSON = {
      "firstLine": "From " + "Anil Ustundag" + (" "+new Date()).substr(0,24),
      "From": "anilu@fraunhofer.com",
      "To": to,
      "Cc": cc,
      "Bcc": bcc,
      "Date": (""+new Date()).substr(4,20)+" +0200", // Date must consist exactly 24 character
      "Subject": subject,
      "Message": message
   };
   REST_send_mail(JSON.stringify(mail_JSON));
};

var load_mails = function(path, mail_list){
   $(path + ' tr').remove();
   var mails = JSON.parse(mail_list);
   var mail;
   var date = "";
   var time = "";
   var text = "";
   var subject = "";
   var mail_from = "";
   var sender = "";
   for(var i in mails) {
      mail = mails[i];
      date = (mail["date"].split('T'))[1];
      time = (parseInt((date.split(':'))[0])+2) +":"+ (date.split(':'))[1]
      text = (mail["text"].length<50 ? mail["text"] : mail["text"].substr(0,50)+"...");
      subject = (mail["subject"] ? mail["subject"] : "(No subject)");
      subject = (subject.length<20 ? subject : subject.substr(0,20)+"...");
      mail_from = mail["from"][0];
      sender = (mail_from["name"] ? mail_from["name"] +" "+ mail_from["address"] : mail_from["address"]);
      $(path)
      .append($('<tr id='+i+'>')
         .append($('<td>')
            .append($('<input type="checkbox">')))
         .append($('<td onclick="displayMail(this)" class="mailbox-name">')
            .append($('<a style="color:#0033cc;">').html(sender.substr(0,20)+"...")))
         .append($('<td onclick="displayMail(this)" class="mailbox-subject">')
            .html("<b>"+subject+'</b>  -  [' + text +']'))
         .append($('<td onclick="displayMail(this)" class="mailbox-date">').html(time))
      );
   }
   };

var toString = function(obj){
   var headers  = obj.headers;
   var mail_str = "";
   mail_str =  'From '  + headers.from + headers.date.substr(0,24) + '\n' +
               'From: ' + headers.from + '\n' +
               'To: '   + headers.to   + '\n';
   mail_str = (headers.cc  ? mail_str + 'Cc: '  + headers.cc  + '\n' : mail_str);
   mail_str = (headers.bcc ? mail_str + 'Bcc: ' + headers.bcc + '\n' : mail_str);
   mail_str =  mail_str +
               'Date: '    + headers.date    + '\n' +
               'Subject: ' + headers.subject + '\n' +
               '\n' + obj.text + '\n';
   return mail_str;
}

var backToTabContent = function(){
   $('.tab-content').show();
   $('.mail_details').hide();
}

var replyMail = function(){
   alert("not available right now!");
}

var deleteSelected = function(){
   // TODO: After searching, delete function works wrong.
   var toBeRemoved = [];
   var checkbox_path = "";
   switch (PAGE_CATEGORY) {
      case "inbox":
         checkbox_path = "#inbox ";
         break;
      case "sent":
         checkbox_path = "#sent-mail ";
         break;
      case "trash":
         checkbox_path = "#trash ";
         break;
      default:
         console.log("[deleteSelected] Unexpected category: " + PAGE_CATEGORY);
   }
   $(checkbox_path + 'input:checkbox').each(function() {
      if ($(this).is(":checked")) {
         toBeRemoved.push(parseInt($(this).parent().parent().attr("id")));
         $(this).parent().parent().remove();
      }
   });
   var delete_JSON = {
      "file" : PAGE_CATEGORY,
      "index_list": toBeRemoved
   };
   REST_remove_mail(JSON.stringify(delete_JSON));
   $('#btn_delete').hide();
}

var displayMail = function(element){
   var index = $(element).parent().attr('id');
   var file_type = $(element).parent().parent().parent().parent().parent().siblings('h3').text();
   var mail;
   switch (file_type) {
      case "Inbox":
         mail = INBOX[index];
         break;
      case "Sent":
         mail = SENT[index];
         break;
      case "Trash":
         mail = TRASH[index];
         break;
      default:
         console.log("[displayMail] Sorry, Invalid file type!");
   }

   if(SEARCHED){
      mail = FILTERED[index];
   }

   $('.mail_details #subject').text(mail.headers.subject);
   var from_name  = (mail.from[0].name  ? mail.from[0].name : 'Unknown Person');
   var cc  = (mail.headers.cc  ? mail.headers.cc  + '\n' : '');
   var bcc = (mail.headers.bcc ? mail.headers.bcc + '\n' : '');
   if(cc)  $('.mail_details #cc').show();
   if(bcc) $('.mail_details #cc').show();

   $('.mail_details #from_name').text(from_name);
   $('.mail_details #from_address').text('<'+mail.from[0].address+'>');
   $('.mail_details #date').text(mail.headers.date);
   $('.mail_details #to_address').text(mail.headers.to);
   $('.mail_details #cc_address').text(mail.headers.cc);
   $('.mail_details #bcc_address').text(mail.headers.bcc);
   $('.mail_details #text').text(mail.text);

   $('.tab-content').hide();
   $('.mail_details').show();
}
