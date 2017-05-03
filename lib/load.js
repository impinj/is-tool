const order = require('../config/config').loadOrder;
const logging = require('../config/config').logging;
const extend = require('xtend');

function loadObject(key, opts) {
  if(logging === 'loud') console.log(`Loading ${key}`);
  let configs = opts.config[key] || [];
  return Promise.all(
    configs.map(conf => {
      if(key === 'users' && opts.addPassword) {
        conf = extend({}, conf,{ password: 'default01'});
      } else if (key === 'readerDefinitions' && opts.newFacility) {
        conf = extend({}, conf,{facility: opts.newFacility});
      }
      return conf;
    }).map(conf =>
      opts.itemsense[key].update(key === 'facilities' ? conf.name : conf)
    )
  ).then(() => opts);
}

function validateParameters(itemsense, newConfigToLoad, newFacility, addPassword) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  if (!newConfigToLoad) return Promise.reject('Passed config object is null');
  if (typeof newConfigToLoad === 'string') {
    if(logging === 'loud') console.log('Passed config in string format, attempting to convert to JSON object.');
    newConfigToLoad = JSON.parse(newConfigToLoad);
  }

  return Promise.resolve({
    itemsense: itemsense,
    config: newConfigToLoad,
    newFacility: newFacility,
    addPassword: addPassword
  });
}

function loadIsConfig(itemsense, newConfigToLoad, newFacility, addPassword) {
  return validateParameters(itemsense, newConfigToLoad, newFacility, addPassword).then(
    opts => {
      let orderedLoadActions = order.map(key => loadObject.bind(null, key));
      return orderedLoadActions.reduce((p, action) => p.then(action), Promise.resolve(opts));
    }
  );
}

module.exports = loadIsConfig;
