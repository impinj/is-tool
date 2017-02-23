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
  const requests = [];

  requests.push(itemsense.facilities.getAll());
  requests.push(itemsense.readerDefinitions.getAll());
  requests.push(itemsense.readerConfigurations.getAll());
  requests.push(itemsense.zoneMaps.getAll());
  requests.push(itemsense.users.getAll());
  requests.push(itemsense.recipes.getAll());

  return Promise.all(requests).then((configs) => {
    const configObject = {
      facilities: configs[0],
      readerDefinitions: configs[1],
      readerConfigurations: configs[2],
      zoneMaps: configs[3],
      users: configs[4],
      recipes: configs[5],
    };
    writeJson(configObject, fileLocation);
    return fileLocation;
  }).catch(reason => Promise.reject(reason));
}

module.exports = saveIsConfig;
