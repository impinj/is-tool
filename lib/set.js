const clear = require('./clear-all');
const load = require('./load');
const defaultConfig = require('../config/impinj-defaults.json');

function setConfig(itemsense, config) {
  return clear(itemsense)
  .then(
    () => load(itemsense, config.configToLoad, config.facility, config.addPassword)
  )
  .then(
    () => {
      if (config.completeClear) {
        return Promise.resolve();
      }
      return load(itemsense, defaultConfig);
    }
  );
}

module.exports = setConfig;
