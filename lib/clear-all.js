const getConfig = require('./getConfig');
const removeConfig = require('./remove');
const currentZoneMap = require('./currentZoneMap');

function removeCurrentZoneMaps(config, itemsense) {
  const clearRequests = [];
  config.facilities.forEach((facility) => {
    clearRequests.push(currentZoneMap.clear(itemsense, facility));
  });
  return Promise.all(clearRequests)
    .then(() => config);
}

function validateParameters(itemsense) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  return Promise.resolve(itemsense);
}

function clearAllConfig(itemsense) {
  return validateParameters(itemsense)
  .then(getConfig)
  .then(config => removeCurrentZoneMaps(config, itemsense))
  .then(configToremove => removeConfig(itemsense, configToremove));
}

module.exports = clearAllConfig;
