const program = require('commander');
const fs = require('fs');
const path = require('path');
const globalConf = require('../config/config');

// if is-tool is used via the CLI, turn logging on.
globalConf.logging = 'loud';

function loadFile(filename) {
  return new Promise((resolve, reject) => {
    console.log(`Reading ${filename}`);
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function writeFile(convertedConf, filename) {
  return new Promise((resolve, reject) => {
    console.log('Writing converted file');
    const parsed = path.parse(filename);
    const newfilename = `${(parsed.dir === '' ? '' : `${parsed.dir}/`)}${parsed.name}-converted${parsed.ext}`;
    fs.writeFile(newfilename, JSON.stringify(convertedConf, null, 2), (err) => {
      if (err) return reject(err);
      return resolve(newfilename);
    });
  });
}

function validateConvertType(val) {
  if ((val.indexOf('to2016r6') === -1)
  && (val.indexOf('threshold') === -1)) {
    console.log("Conversion type must be one of 'to2016r6' or 'threshold'");
    process.exit(1);
  }
  return val;
}

program
  .description('Convert an ItemSense config files. Either convert a configuration \n'
  + 'file from ItemSense 2016r4 to 2016r6 format or convert ItemSense Threshold \n'
  + 'prototype format to 2017r1 threshold format. \n\n'
  + 'The tool writes the converted file to the same directory as the input file\n'
  + "but adds '-converted' to the file name.")
  .option(
    '-t, --converttype <type>',
    "The conversion type, one of 'to2016r6' or 'threshold'.",
    validateConvertType)
  .option(
    '-f, --facility <name>',
    'The name of the facility to which the converted thresholds should belong.'
  )
  .parse(process.argv);

if (!program.converttype) {
  console.log('converttype flag (-t) must be specified');
  process.exit(1);
}

if (!program.args || program.args.length === 0) {
  console.log('No file specified to load.');
  process.exit(1);
}

let converter;
if (program.converttype === 'to2016r6') {
  converter = require('../lib/convert/r4-to-r6');
} else {
  converter = require('../lib/convert/threshold');
}

loadFile(program.args[0]).then(
  config => converter(config, program.facility)
)
.then(
  convertedConfig => writeFile(convertedConfig, program.args[0])
)
.then(
  (newfilename) => {
    console.log(`Wrote ${newfilename}`);
  }
)
.catch(
  (reason) => {
    console.log(`Failure during convertion: \n${reason.stack}\n`);
    process.exit(1);
  }
);
