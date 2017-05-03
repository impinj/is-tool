const getConfig = require('./getConfig');
const fs = require('fs');

function writeJson(config, fileLocation) {
  fs.writeFile(fileLocation.toString(), JSON.stringify(config, null, 2), (err) => {
    if (err) {
      throw new Error(err);
    }
  });
}

function saveIsConfig(itemsense, fileLocation) {
  if (!itemsense) return Promise.reject(new TypeError('itemsense object is null'));
  return getConfig(itemsense).then(
    (configObject) => {
      writeJson(configObject, fileLocation);
      return fileLocation;
    }
  )
  .catch(reason => Promise.reject(reason));
}

module.exports = saveIsConfig;
