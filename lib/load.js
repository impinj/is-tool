const order = require('../config/endpoint-config').load;


function loadObject(key, opts) {
  console.log(`Loading ${key}`);
  const configs = opts.config[key] || [];
  return Promise.all(
    configs.map((conf) => {
      let newconf = conf;
      if (key === 'users' && opts.addPassword) {
        newconf = Object.assign({}, conf, { password: 'default01' });
      } else if (key === 'readerDefinitions' && opts.newFacility) {
        newconf = Object.assign({}, conf, { facility: opts.newFacility });
      }
      return newconf;
    }).map(conf =>
      opts.itemsense[key].update(key === 'facilities' ? conf.name : conf)
    )
  ).then(() => opts);
}

function validateParameters(itemsense, newConfig, newFacility, addPassword) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  if (!newConfig) return Promise.reject('Passed config object is null');

  let newConfigToLoad;
  if (typeof newConfigToLoad === 'string') {
    console.log('Passed config in string format, attempting to convert to JSON object.');
    newConfigToLoad = JSON.parse(newConfigToLoad);
  } else {
    newConfigToLoad = newConfig;
  }

  return Promise.resolve({
    itemsense,
    config: newConfigToLoad,
    newFacility,
    addPassword
  });
}

function loadIsConfig(itemsense, newConfigToLoad, newFacility, addPassword) {
  return validateParameters(itemsense, newConfigToLoad, newFacility, addPassword)
    .then(
      (opts) => {
        const orderedLoadActions = order.map(key => loadObject.bind(null, key));
        return orderedLoadActions.reduce((p, action) => p.then(action), Promise.resolve(opts));
      }
   );
}

module.exports = loadIsConfig;
