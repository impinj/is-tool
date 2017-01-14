var Itemsense = require('itemsense-node');
var loadIsConfig = require('../lib/load');
var program = require('commander');
var fs = require('fs');

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-f --facility <facility>', 'Name of new facility in which to add readers')
  .option('-c --convert', "Convert recipe and reader configs to 2016r6 format.")
  .parse(process.argv)

if (!program.args || program.args.length == 0) {
  console.log("No file specified to load.")
  process.exit(1)
}

var itemsenseConfig = {
  "username": (program.user || "admin"),
  "password": (program.pass || "admindefault"),
  "itemsenseUrl": `http://${program.ip}/itemsense`
};
var itemsense = new Itemsense(itemsenseConfig);
loadFile(program.args[0])
.then(
  config => { return loadIsConfig(itemsense, config, program.facility) },
  reason => { return Promise.reject("Couldn't read file: " + reason) }
)
.then(
  result => console.log("Load request complete."),
  reason => {
    let errorMsg ="";
    if(reason.message){
      errorMsg = "Loading config failed: " + reason.message;
      if(reason.error) errorMsg += "\n" + JSON.stringify(reason.error);
    }else{
      errorMsg = reason;
    }
    return Promise.reject(errorMsg);
  }
)
.catch(
  reason => console.log("Failure: \n  " + reason)
);


function loadFile(filename){
  return new Promise(function(resolve, reject){
    console.log('Reading ' + filename);
    fs.readFile(filename, 'utf8', (err,data)=>{
      if(err) reject(err)
      else resolve(JSON.parse(data));
    });
  });
}
