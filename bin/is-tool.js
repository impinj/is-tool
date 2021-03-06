#! /usr/bin/env node
const program = require('commander');
const pkg = require('../package.json');


program
  .version(pkg.version)
  .usage('<cmd> [options]')
  .command('load <file>', 'load configuration file into ItemSense')
  .command('save [file]', 'save ItemSense configuration to file')
  .command('convert <file>', 'Convert ItemSense configuration from 2016r4 format to 2016r6')
  .command('clear', 'removes all configuration from an ItemSense instance')
  .command('set <file>', 'Removes all config except Impinj defaults and config in a passed file')
  .command('remove <file>', 'removes config specified in a passed file')
  .parse(process.argv);
