const Itemsense = require('itemsense-node');
const removeConfig = require('../lib/remove');
const program = require('commander');
const fs = require('fs');

function readFile(filename) {
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

readFile(program.args[0])
.then(
  (config) => {
    const itemsense = new Itemsense(itemsenseConfig);
    return removeConfig(itemsense, config);
  }
)
.then(
  () => console.log('Remove request complete.')
)
.catch((reason) => {
  let errorMsg = '';

  if (reason.message) {
    errorMsg = `Deleting config failed: ${reason.message}`;
    if (reason.error) errorMsg += `\n ${JSON.stringify(reason.error)}`;
  } else {
    errorMsg = reason;
  }
  console.log(`Failure: \n  ${errorMsg}`);
  process.exit(1);
});
