const Itemsense = require('itemsense-node');
const loadIsConfig = require('../lib/load');
const program = require('commander');
const fs = require('fs');

function loadFile(filename) {
  return new Promise((resolve, reject) => {
    console.log(`Reading ${filename}`);
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(JSON.parse(data));
    });
  });
}

program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-f --facility <facility>', 'Name of new facility in which to add readers')
  .parse(process.argv);

if (!program.args || program.args.length === 0) {
  console.log('No file specified to load.');
  process.exit(1);
}

if (!program.ip) {
  console.log('ItemSense IP address not specified.');
  process.exit(1);
}

const itemsenseConfig = {
  username: (program.user || 'admin'),
  password: (program.pass || 'admindefault'),
  itemsenseUrl: `http://${program.ip}/itemsense`
};

loadFile(program.args[0])
.then(
  (config) => {
    const itemsense = new Itemsense(itemsenseConfig);
    return loadIsConfig(itemsense, config, program.facility);
  }
)
.then(
  () => console.log('Load request complete.')
)
.catch((reason) => {
  let errorMsg = '';

  if (reason.message) {
    errorMsg = `Loading config failed: ${reason.message}`;
    if (reason.error) errorMsg += `\n ${JSON.stringify(reason.error)}`;
  } else {
    errorMsg = reason;
  }
  console.log(`Failure: \n  ${errorMsg}`);
  process.exit(1);
});
