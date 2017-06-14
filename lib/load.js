const order = require('../config/config').loadOrder;
const globalConf = require('../config/config');

function loadObject(key, opts) {
  if (globalConf.logging === 'loud') console.log(`Loading ${key}...`);
  const configs = opts.config[key] || [];
  return Promise.all(
    configs.map((conf) => {
      let modConf = Object.assign({}, conf);
      if (key === 'users' && opts.addPassword) {
        modConf = Object.assign({}, conf, { password: 'default01' });
      } else if (key === 'readerDefinitions' && opts.newFacility) {
        modConf = Object.assign({}, conf, { facility: opts.newFacility });
      }
      return modConf;
    })
    .map(conf =>
      opts.itemsense[key].update(key === 'facilities' ? conf.name : conf)
    )
  ).then(() => opts);
}

function validateParameters(itemsense, newConfigToLoad, newFacility, addPassword) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  if (!newConfigToLoad) return Promise.reject('Passed config object is null');
  let configToLoad = newConfigToLoad;
  if (typeof newConfigToLoad === 'string') {
    configToLoad = JSON.parse(newConfigToLoad);
  }

  return Promise.resolve({
    itemsense,
    config: configToLoad,
    newFacility,
    addPassword
  });
}

function loadIsConfig(itemsense, newConfigToLoad, newFacility, addPassword) {
  return validateParameters(itemsense, newConfigToLoad, newFacility, addPassword).then(
    (opts) => {
      const orderedLoadActions = order.map(key => loadObject.bind(null, key));
      return orderedLoadActions.reduce((p, action) => p.then(action), Promise.resolve(opts));
    }
  );
}

module.exports = loadIsConfig;
