'use strict';

var Client = require('node-rest-client').Client;
var client = new Client();

// direct way
client.get("http://127.0.0.1:3000/inbox", function (data, response) {
    // data = parsed response body as js object
    if(Buffer.isBuffer(data)){
      data = data.toString('utf8');
    }
    console.log(data);
    // raw response
    //console.log(response);
});

/*
// registering remote methods
client.registerMethod("jsonMethod", "http://remote.site/rest/json/method", "GET");

client.methods.jsonMethod(function (data, response) {
    // parsed response body as js object
    console.log(data);
    // raw response
    console.log(response);
});
*/
