'use strict';
var load = require('./lib/load.js');
var save = require('./lib/save.js');
var convert = require('./lib/convert-r4-to-r6.js');

module.exports = {
  load: load,
  save: save,
  convert: convert
};
