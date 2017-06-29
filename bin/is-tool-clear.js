const Itemsense = require('itemsense-node');
const clearAllConfig = require('../lib/clear-all');
const program = require('commander');
const inquirer = require('inquirer');
const loadConfig = require('../lib/load');
const defaultConfig = require('../config/impinj-defaults.json');


program
  .option('-i --ip <ipaddr>', 'ItemSense IP address')
  .option('-u --user <user>', 'ItemSense Username')
  .option('-p --pass <pass>', 'ItemSense Password')
  .option('-c --completeclear', 'Remove everything including Impinj default configs')
  .option('-y --yes', 'Pass yes to the clear confirmation question')
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

const inquiryPromise = program.yes ? Promise.resolve({ ans: true }) : inquirer.prompt([question]);

inquiryPromise
.then(
  (str) => {
    if (!str.ans) {
      console.log('Exiting.....');
      process.exit(0);
    }
    console.log('Clearing......');
    return clearAllConfig(itemsense);
  }
)
.then(
  () => {
    if (program.completeclear) {
      console.log('Not reloading Impinj defaults.');
      console.log('Clear request complete.');
      process.exit(0);
    }
    return loadConfig(itemsense, defaultConfig);
  }
)
.then(
  () => console.log('Clear request complete.')
)
.catch((reason) => {
  let errorMsg = '';

  if (reason.message) {
    errorMsg = `Clearing all config failed: ${reason.message}`;
    console.log(reason.error);
    if (reason.error) errorMsg += `\n ${JSON.stringify(reason.error)}`;
  } else {
    errorMsg = reason;
  }
  console.log(`Failure: \n  ${errorMsg}`);
  process.exit(1);
});
