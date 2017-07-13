const order = require('../config/config').loadOrder;
const globalConf = require('../config/config');
const getConfig = require('./getConfig');
const { Updater } = require('./updater');
const prepareConfig = require('./load-preparer');

function createAntennaNameToIdMap(antennaConfNameToId, antennaConf) {
  const tempObj = {};
  tempObj[antennaConf.name] = antennaConf.id;
  return Object.assign({}, antennaConfNameToId, tempObj);
}

function loadObject(key, opts) {
  if (globalConf.logging === 'loud') console.log(`Loading ${key}...`);
  const configs = opts.config[key] || [];

  return Promise.all(
    configs.map(conf => prepareConfig[key](conf, opts))
    .map(conf => opts.updater.send(conf, key))
  ).then((response) => {
    if (key === 'antennaConfigurations') {
      const newOpts = Object.assign({}, opts);
      newOpts.antennaConfNameToId = response.reduce(createAntennaNameToIdMap, {});
      return newOpts;
    }
    return opts;
  });
}

function existsAndIsArrayAndHasElements(value) {
  return (value
    && Array.isArray(value)
    && value.length > 0);
}

function createIdToNameMap(configs) {
  return configs.reduce((acc, config) => {
    if (config.id && config.name) acc[config.id] = config.name;
    return acc;
  }, {});
}

function isInt(value) {
  return !isNaN(value);
}

function replaceAntennaConfIdsWithName(opts) {
  if (existsAndIsArrayAndHasElements(opts.config.thresholds)
    && existsAndIsArrayAndHasElements(opts.config.antennaConfigurations)) {
    const localOpts = Object.assign({}, opts);
    const idToName = createIdToNameMap(opts.config.antennaConfigurations);
    localOpts.config.thresholds.forEach((threshold) => {
      const localThreshold = Object.assign({}, threshold);
      Object.keys(threshold.readers).forEach((reader) => {
        const readerAntennaConfId = threshold.readers[reader].antennaConfigurationId;
        if (isInt(readerAntennaConfId)) {
          if (idToName[readerAntennaConfId]) {
            localThreshold.readers[reader].antennaConfigurationId = idToName[readerAntennaConfId];
          }
        }
      });
    });
    return localOpts;
  }
  return opts;
}

function validateParameters(itemsense, newConfigToLoad, newFacility, addPassword) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  if (!newConfigToLoad) return Promise.reject('Passed config object is null');
  let configToLoad = newConfigToLoad;
  if (typeof newConfigToLoad === 'string') {
    configToLoad = JSON.parse(newConfigToLoad);
  }

  return Promise.resolve({
    config: configToLoad,
    newFacility,
    addPassword
  });
}

function loadIsConfig(itemsense, newConfigToLoad, newFacility, addPassword) {
  return validateParameters(itemsense, newConfigToLoad, newFacility, addPassword)
  .then(opts => (
    getConfig(itemsense)
    .then((currentConf) => {
      const optsWithCurrent = Object.assign({}, opts);
      optsWithCurrent.updater = new Updater(itemsense, currentConf);
      return optsWithCurrent;
    })
  ))
  .then(replaceAntennaConfIdsWithName)
  .then(
    (opts) => {
      const orderedLoadActions = order.map(key => loadObject.bind(null, key));
      return orderedLoadActions.reduce((p, action) => p.then(action), Promise.resolve(opts));
    }
  );
}

module.exports = loadIsConfig;
