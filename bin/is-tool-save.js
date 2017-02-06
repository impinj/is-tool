const Itemsense = require('itemsense-node');
const saveIsConfig = require('../lib/save');
const program = require('commander');


program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .parse(process.argv)


if (!program.args || program.args.length == 0) {
  console.log(`No file specified to save. generating a filename. `)
  program.args = `is-save-${new Date().toISOString()}.json`;
}

if (!program.ip) {
  console.log("ItemSense IP address not specified.")
  process.exit(1)
}

const itemsenseConfig = {
  "username": (program.user || "admin"),
  "password": (program.pass || "admindefault"),
  "itemsenseUrl": `http://${program.ip}/itemsense`
};

console.log(`Connecting to ItemSense: ${JSON.stringify(itemsenseConfig)}`);
const itemsense = new Itemsense(itemsenseConfig);
if(!itemsense) throw new Error("Couldn't create ItemSense instance object");

saveIsConfig(itemsense, program.args)
.then(
  fileLocation => console.log("Wrote: " + fileLocation),
  reason => {
    console.log("Failure:\n" + reason);
    process.exit(1);
  }
);
