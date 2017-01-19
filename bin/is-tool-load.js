var Itemsense = require('itemsense-node');
var loadIsConfig = require('../lib/load');
var converter = require('../lib/convert-r4-to-r6')
var program = require('commander');
var fs = require('fs');

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-f --facility <facility>', 'Name of new facility in which to add readers')
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

loadFile(program.args[0])
.then(
  config => {
    var itemsense = new Itemsense(itemsenseConfig);
    return loadIsConfig(itemsense, config, program.facility);
  }
)
.then(
  () => console.log("Load request complete.")
)
.catch((reason) => {

  let errorMsg = "";

  if(reason.message){
    errorMsg = "Loading config failed: " + reason.message;
    if(reason.error) errorMsg += "\n" + JSON.stringify(reason.error);
  } else {
    errorMsg = reason;
  }
  console.log("Failure: \n  " + errorMsg)

});



function loadFile(filename){
  return new Promise(function(resolve, reject){
    console.log('Reading ' + filename);
    fs.readFile(filename, 'utf8', (err,data)=>{
      if(err) reject(err)
      else resolve(JSON.parse(data));
    });
  });
}
