const Itemsense = require('itemsense-node');
const loadConfig = require('../lib/load');
const clearConfig = require('../lib/clear');
const program = require('commander');
const fs = require('fs');
const inquirer = require('inquirer');
const defaultConfig = require('../config/impinj-defaults.json')

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
  .option('-a --addpassword', 'Add a password to a user, necessary when adding a new user to the system')
  .option('-f --facility <facility>', 'Name of new facility in which to add readers')
  .option('-c --completeclear', 'Remove everything including Impinj defaults before loading')
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

const question = {
  type: 'confirm',
  name: 'ans',
  default: false,
  message: 'Are you sure you would like to remove all configuration from this ItemSense? (y/N)'
};
const itemsense = new Itemsense(itemsenseConfig);

inquirer.prompt([question])
.then(
  (str) => {
    if (!str.ans) {
      console.log('Exiting.....');
      process.exit(0);
    }

    console.log('Clearing......');
    return clearConfig(itemsense);
  }
)
.then(
  () => {
    if (program.completeclear) {
      console.log('Not reloading Impinj defaults.');
      console.log('Clear request complete.');
      process.exit(0);
    }
    console.log('Loading Impinj defaults.');
    return loadConfig(itemsense, defaultConfig);
  }
)
.then(
  () => loadFile(program.args[0])
)
.then(
  (config) => {
    return loadConfig(itemsense, config, program.facility, program.addpassword);
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
