#! /usr/bin/env node
'use strict';
const program = require('commander');
const path = require('path');


program
  .usage('<cmd> [options]')
  .command('load <file>', 'load configuration file into ItemSense')
  .command('save [file]', 'save configuration file into ItemSense')
  .command('convert <file>', 'Convert ItemSense configuration from 2016r4 format to 2016r6')
  .parse(process.argv);
