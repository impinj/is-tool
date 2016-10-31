#! /usr/bin/env node
'use strict';
var program = require('commander');
var path = require('path');


program
  .usage('<load|save> <file> [options]')
  .command('load <file>', 'load configuration file into ItemSense')
  .command('save [file]', 'save configuration file into ItemSense')
  //.command('readermv [file1]', 'save configuration file into ItemSense')
  .parse(process.argv);
