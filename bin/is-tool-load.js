var Itemsense = require('itemsense-node');
var loadIsConfig = require('../lib/load');
var program = require('commander');
var fs = require('fs');

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-f --facility <facility>', 'ItemSense password')
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
  result => console.log("load request complete."),
  reason => {
    return Promise.reject(
      reason.message ?
      "Loading config failed: " + reason.message + "\n" + JSON.stringify(reason.error) : reason
    );
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
