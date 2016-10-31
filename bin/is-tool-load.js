var endpoints = require('../config/endpoint-config').load;
var performRequest = require('../lib/http-query');
var program = require('commander');

var fs = require('fs');
var async = require('async');

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-f --facility <facility>', 'ItemSense password')
  .parse(process.argv)

//console.log(JSON.stringify(program))
loadConfig(program.args, program.user, program.pass, program.ip, program.facility)


function loadConfig(loadFile, userName, password, ipAddr, facility){
  if (!loadFile || loadFile.length == 0){
    console.log("No file specified to load.")
    process.exit(1)
  }

  var options = {
    auth: (userName || "admin") + ":" + (password || "admindefault"),
    host: ipAddr || "127.0.0.1",
    port: 80,
    facility: facility
  };
  console.log("Using values:\n" +
              "   ItemSense IP: " + options.host + "\n" +
              "           Auth: " + options.auth + "\n" +
              "       loadFile: " + loadFile + "\n");

  gatherConfig(options, readJson(loadFile));
}

function gatherConfig(options,conf){
  options.method = 'PUT';
  async.eachOf(endpoints, function(endpointURL, confCategory, callback){
    console.log("Loading: " + confCategory );
   var categoryData = JSON.parse(conf[confCategory]);
    if(options['facility']){
     categoryData['facility'] = options['facility'];
    }
    async.each(categoryData, function(data, callback){
      performRequest(confCategory, endpointURL, options, data, function(responseJson, confCategory){
        console.log("    Loaded " + confCategory + ": " + data['name']);
        callback();
      });
    },
    function(err, result){
      console.log("All " + confCategory + " loaded.")
    });
  },
  function(err, result){
    console.log("Load complete.")
  });
}

function readJson(loadFile){
  return JSON.parse(fs.readFileSync(loadFile.toString(), 'utf8'));
}
