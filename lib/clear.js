const order = require('../config/config').loadOrder;
const getConfig = require('./getConfig');

function deleteObject(key, opts) {
  const is = opts.itemsense;
  const confs = opts.configToRemove;
  return Promise.all(confs[key].map(conf => is[key].delete(conf.name)));
}

function validateParameters(itemsense){
  if (!itemsense)  return Promise.reject('itemsense object is null');

  return Promise.resolve({
    itemsense: itemsense
  })
}

function fowlerClearConfig(itemsense) {
  return validateParameters(itemsense)
  .then((opts) => {
    return getConfig(opts.itemsense)
    .then( config => {
        opts.configToRemove = config;
        const deleteFunctions = order.slice().reverse().map(key => deleteObject.bind(null, key));
        return deleteFunctions.reduce(
          (p, deleteFunction) => p.then(deleteFunction),
          Promise.resolve(opts)
        );
      }
    );
  });
}

function clearConfig(itemsense) {
  if (!itemsense) {
    return Promise.reject('itemsense object is null');
  }
  const reverseOrder = order.slice().reverse(); // slice creates a new array
  return getConfig(itemsense).then(
    (configToRemove) => {
      const requestPromises = [];
      let resultPromise = Promise.resolve();
      reverseOrder.forEach((endpoint) => {
        if (configToRemove[endpoint]) {
          switch (endpoint) {
            case 'facilities':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.facilities.forEach((facility) => {
                    if (facility.name !== 'DEFAULT') {
                      requestPromises.push(itemsense.facilities.delete(facility.name));
                    }
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            case 'readerDefinitions':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.readerDefinitions.forEach((readerDefinition) => {
                    requestPromises.push(itemsense.readerDefinitions.delete(readerDefinition.name));
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            case 'readerConfigurations':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.readerConfigurations.forEach((readerConfiguration) => {
                    requestPromises.push(
                      itemsense.readerConfigurations.delete(
                        readerConfiguration.name
                      )
                    );
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            case 'recipes':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.recipes.forEach((recipe) => {
                    requestPromises.push(itemsense.recipes.delete(recipe.name));
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            case 'zoneMaps':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.zoneMaps.forEach((zoneMap) => {
                    requestPromises.push(itemsense.zoneMaps.delete(zoneMap.name));
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            case 'users':
              resultPromise = resultPromise.then(
                () => {
                  console.log(`Deleting ${endpoint}`);
                  configToRemove.users.forEach((user) => {
                    if (user.name !== 'Admin') {
                      requestPromises.push(itemsense.users.delete(user.name));
                    }
                  });
                  return Promise.all(requestPromises);
                }
              );
              break;
            default:
              // no-op, ignore the attribute
              break;
          }
        }
      });
      return resultPromise;
    }
  )
  .catch((err) => {
    console.log('Encountered Error:');
    console.log(err.stack);
    console.log('returning reject')
    return Promise.reject(err);
  });

}

module.exports = fowlerClearConfig;
