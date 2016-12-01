#! /usr/bin/env node
'use strict';
var program = require('commander');
var path = require('path');


program
  .usage('<cmd> [options]')
  .command('load <file>', 'load configuration file into ItemSense')
  .command('save [file]', 'save configuration file into ItemSense')
  .command('readermv <reader_name> <new_facility>', 'Move a reader from one facility to another')
  .parse(process.argv);
