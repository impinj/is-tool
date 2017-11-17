const helpers = require('./helpers');
const order = require('../config/config').loadOrder;
const globalConf = require('../config/config');
const getConfig = require('./getConfig');
const { Updater } = require('./load/updater');
const prepareConfig = require('./load/load-preparer');

const { isValidArray, isInt, createIdToNameMap } = helpers;

function mapIdToName(map, responseObj) {
  const tempObj = {};
  tempObj[responseObj.name] = responseObj.id;
  return Object.assign({}, map, tempObj);
}

function createNameToIdMap(response) {
  return response.reduce(mapIdToName, {});
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
      newOpts.antennaConfNameToId = createNameToIdMap(response);
      return newOpts;
    }
    if (key === 'thresholds') {
      const newOpts = Object.assign({}, opts);
      newOpts.thresholdNameToNewId = createNameToIdMap(response);
      return newOpts;
    }
    return opts;
  });
}

function loadEachConfigCategory(opts) {
  const orderedLoadActions = order.map(key => loadObject.bind(null, key));
  return orderedLoadActions.reduce((p, action) => p.then(action), Promise.resolve(opts));
}


function replaceAntennaConfIdsWithName(opts) {
  if (isValidArray(opts.config.thresholds)
    && isValidArray(opts.config.antennaConfigurations)) {
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


// This function loops through all recipes and replaces their thresholdIds
// with the equivalent threshold name.
function replaceThresholdIdWithNameInRecipes(opts) {
  if (isValidArray(opts.config.thresholds)) {
    const localOpts = Object.assign({}, opts);
    if (opts.config.thresholds) {
      const idToName = createIdToNameMap(opts.config.thresholds);
      if (localOpts.config.recipes) {
        localOpts.config.recipes = localOpts.config.recipes.map((recipe) => {
          const newRecipe = Object.assign({}, recipe);
          newRecipe.thresholdIds = recipe.thresholdIds
            // remove ids which don't have corresponding thresholds
            .filter(thresholdId => idToName[thresholdId])
            // convert the remaining ids to the threshold name
            .map(thresholdId => idToName[thresholdId]);
          return newRecipe;
        });
        return localOpts;
      }
    }
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
    getConfig(itemsense) // Grab existing conf from ItemSense
    .then((existingConf) => {
      // Create an options object and an updater object which
      // include the current config from ItemSense.
      const optsWithCurrent = Object.assign({}, opts, { existingConf });
      optsWithCurrent.updater = new Updater(itemsense, existingConf);
      return optsWithCurrent;
    })
  ))
  .then(replaceAntennaConfIdsWithName)
  .then(replaceThresholdIdWithNameInRecipes)
  .then(loadEachConfigCategory);
}

module.exports = loadIsConfig;
