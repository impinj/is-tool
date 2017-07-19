const order = require('../config/config').loadOrder;

function setDelKey(conf, key) {
  const modConf = Object.assign({}, conf);
  if (key === 'antennaConfigurations' || key === 'thresholds') {
    modConf.delKey = conf.id;
  } else {
    modConf.delKey = conf.name;
  }
  return modConf;
}

function removeObject(key, opts) {
  const is = opts.itemsense;
  const confs = opts.configToRemove;
  if (!confs[key] || confs[key].length === 0) {
    return Promise.resolve(opts);
  }
  return Promise.all(
    confs[key].filter((conf) => {
      if ((key === 'users' && conf.name === 'Admin')
      || (key === 'users' && conf.name === 'ReaderAgent')
      || (key === 'facilities' && conf.name === 'DEFAULT')) {
        return false;
      }
      return true;
    })
    .map(conf => setDelKey(conf, key))
    .map(conf => is[key].delete(conf.delKey))
  )
  .then(() => opts);
}

function validateParameters(itemsense, config) {
  if (!itemsense) return Promise.reject('itemsense object is null');
  if (!config) return Promise.reject('config object is null');
  return Promise.resolve({
    itemsense,
    configToRemove: config,
  });
}

function remove(itemsense, config) {
  return validateParameters(itemsense, config)
  .then((opts) => {
    // Create an array of removeObject functions with the config key name bound
    // to the first argument. The functions are in reverse order to what's
    // specified in configuraion.
    const removeFunctions = order.slice().reverse().map(key => removeObject.bind(null, key));
    return removeFunctions.reduce(
      (p, removeFunction) => p.then(removeFunction),
      Promise.resolve(opts)
    );
  });
}

module.exports = remove;
