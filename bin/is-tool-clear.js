const Itemsense = require('itemsense-node');
const clearConfig = require('../lib/clear');
const program = require('commander');
const inquirer = require('inquirer');
const loadConfig = require('../lib/load');
const defaultConfig = require('../config/impinj-defaults.json');


program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense password')
  .option('-c --completeclear', 'Remove everything including Impinj default confs')
  .parse(process.argv);

if (!program.ip) {
  console.log('ItemSense IP address not specified.');
  process.exit(1);
}

const itemsenseConfig = {
  username: (program.user || 'admin'),
  password: (program.pass || 'admindefault'),
  itemsenseUrl: `http://${program.ip}/itemsense`
};
const itemsense = new Itemsense(itemsenseConfig);
const question = {
  type: 'confirm',
  name: 'ans',
  default: false,
  message: 'Are you sure you would like to remove all configuration from this ItemSense? (y/N)'
};

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
  () => console.log('Clear request complete.')
)
.catch((reason) => {
  let errorMsg = '';

  if (reason.message) {
    errorMsg = `Clearing config failed: ${reason.message}`;
    console.log(reason.error);
    if (reason.error) errorMsg += `\n ${JSON.stringify(reason.error)}`;
  } else {
    errorMsg = reason;
  }
  console.log(`Failure: \n  ${errorMsg}`);
  process.exit(1);
});
