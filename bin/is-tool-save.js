var endpoints = require('../config/endpoint-config').save;
var performRequest = require('../lib/http-query');
var program = require('commander');

var fs = require('fs');
var async = require('async');
var itemsenseConfig = {},
  configCollected = false,
  saveFileName = "";

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .parse(process.argv)

//console.log(JSON.stringify(program))
saveConfig(program.args, program.user, program.pass, program.ip)


function saveConfig(saveFile, userName, password, ipAddr){
  if (!saveFile || saveFile.length == 0){
    saveFileName = "./is-save-" + Date.now() + ".json";
  }else {
    saveFileName = saveFile;
  }
  var options = {
    auth: (userName || "admin") + ":" + (password || "admindefault"),
    host: ipAddr || "127.0.0.1",
    port: 80,
    method:'GET'
  };
  console.log("Using values:\n" +
              "   ItemSense IP: " + options.host + "\n" +
              "           Auth: " + options.auth + "\n" +
              "       Savefile: " + saveFileName + "\n");
  gatherConfig(options);
}

function gatherConfig(options){
  async.eachOf(endpoints, function(endpoint, confCategory, callback){
  //  console.log("Requesting: " + confCategory);
    performRequest(confCategory, endpoint, options, "", function(responseJson, confCategory){
      buildJsonConfObject(JSON.parse(responseJson), confCategory);
      callback();
    });
  },
  function(err, result){
    writeJson();
  });

}

function buildJsonConfObject(responseJson, confCategory){
  itemsenseConfig[confCategory] = responseJson;
//  console.log("Adding config: "+ confCategory + ":" + responseJson);
}

function writeJson(){
  //console.log("Writing to " + saveFileName + ": "  + JSON.stringify(itemsenseConfig));

  fs.writeFile(saveFileName.toString(), JSON.stringify(itemsenseConfig, null, 2), (err)=>{
    if (err){
      return console.log(err);
    }
  });
  console.log("Written file: " + saveFileName);
}
