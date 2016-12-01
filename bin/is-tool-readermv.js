var endpointsSave = require('../config/endpoint-config').save;
var endpointsLoad = require('../config/endpoint-config').load;
var performRequest = require('../lib/http-query');
var program = require('commander');

var fs = require('fs');
var async = require('async');

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .parse(process.argv)

//console.log(JSON.stringify(program))
readerMv(program.args[0], program.args[1], program.user, program.pass, program.ip )


function readerMv(readerName, newFacility, userName, password, ipAddr, facility){
  if (!readerName || readerName.length == 0 || !newFacility || newFacility.length == 0 ){
    console.log("Error: Reader name and new facility name must be specified.")
    process.exit(1)
  }

  var options = {
    auth: (userName || "admin") + ":" + (password || "admindefault"),
    host: ipAddr || "127.0.0.1",
    port: 80,
    method: 'GET',
    readerName: readerName,
    newFacility: newFacility
  };

  console.log("Using values:\n" +
              "   ItemSense IP: " + options.host + "\n" +
              "           Auth: " + options.auth + "\n" +
              "   New Facility: " + newFacility + "\n" +
              "    Reader Name: " + readerName + "\n");

  fetchReaderDefinition(options, readerName);
}

function fetchReaderDefinition(options){
  var endpoint = endpointsSave['readerDefinitions'] + "/" + options['readerName'];
  performRequest("readerMv-get", endpoint, options, "", loadNewFacility);
}

function loadNewFacility(readerDefinitionString, confCategory, options){
  var readerDefinition = JSON.parse(readerDefinitionString);
  console.log("Moving reader from " + readerDefinition['facility'] + " to " + options['newFacility'])
  readerDefinition['facility'] = options['newFacility'];
  options['method'] = 'PUT'
  performRequest("readerMv-put", endpointsLoad['readerDefinitions'], options, readerDefinition, success);
}

function success(responseString, confCategory, options){
  console.log("Successfully moved reader to facility: " + options['newFacility'])
}
