'use strict';
const load = require('./lib/load.js');
const save = require('./lib/save.js');
const convert = require('./lib/convert-r4-to-r6.js');
const clear = require('./lib/clear.js');

module.exports = {
  load,
  save,
  convert,
  clear
};
