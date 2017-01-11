var Itemsense = require('itemsense-node');
var saveIsConfig = require('../lib/save');
var program = require('commander');


program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .parse(process.argv)

if( !program.ip){
   console.log("Error: IP Address is mandatory. \nExiting....");
   process.exit(1);
}
if (!program.args || program.args.length == 0) {
  console.log(`No file specified to save. generating a filename. `)
  program.args = `is-save-${new Date().toISOString()}.json`;
}

var itemsenseConfig = {
  "username": (program.user || "admin"),
  "password": (program.pass || "admindefault"),
  "itemsenseUrl": `http://${program.ip}/itemsense`
};

console.log(`Connecting to ItemSense: ${JSON.stringify(itemsenseConfig)}`);
var itemsense = new Itemsense(itemsenseConfig);
if(!itemsense) throw new Error("itemsense object is null");
console.log(Object.getOwnPropertyNames(itemsense));


//console.log(JSON.stringify(program))
saveIsConfig(itemsense, program.args).then(
  fileLocation => console.log("Wrote: " + fileLocation),
  reason => console.log("Failed: " + reason)
);
