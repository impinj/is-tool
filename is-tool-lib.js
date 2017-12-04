'use strict';

const load = require('./lib/load');
const save = require('./lib/save.js');
const convert = require('./lib/convert/r4-to-r6');
const convertThreshold = require('./lib/convert/threshold');
const clear = require('./lib/clear-all');
const currentZoneMap = require('./lib/currentZoneMap');
const remove = require('./lib/remove');
const set = require('./lib/set');
const get = require('./lib/getConfig');

module.exports = {
  load,
  save,
  convert,
  convertThreshold,
  clear,
  currentZoneMap,
  remove,
  get,
  set,
};
