var querystring = require('querystring');
var http = require('http');


var apiKey = '*****';

function performRequest(confCategory, endpoint, options, queryData, success) {
  //console.log(arguments)
  var dataString = JSON.stringify(queryData);
  var headers = {};

  if (options.method == 'GET') {
    endpoint += '?' + querystring.stringify(queryData);
  //  console.log("Endpoint: " + endpoint)
  }
  else {
    //console.log(queryData);
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length

    };
  }
  options.headers = headers;
  options.path = endpoint;

  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {

      if(res.statusCode.toString().match(/2\d\d/)){
        success(responseString, confCategory, options);
      }
      else {
        console.log("Result Code: " + res.statusCode);
        console.log("Failed:" + confCategory + ": " + queryData['name'])
        console.log("          URL: " + endpoint)
        console.log("         Data: " + dataString)

        console.log("result: " + responseString);
      }
    });
  });
  req.on('error', (e) => {
    console.log(`Request Error: ${e.message}`);
  });

//  console.log("Loading "+confCategory + ": " + queryData);
  req.write(dataString);
  req.end();
}

module.exports = performRequest
