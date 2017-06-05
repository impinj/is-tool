const getConfig = require('./getConfig');
const removeConfig = require('./remove');

function validateParameters(itemsense) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  return Promise.resolve(itemsense);
}

function clearAllConfig(itemsense) {
  return validateParameters(itemsense)
  .then(getConfig)
  .then(configToremove => removeConfig(itemsense, configToremove));
}

module.exports = clearAllConfig;
