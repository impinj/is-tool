const order = require('../config/endpoint-config').load;

function loadIsConfig(itemsense, newConfigToLoad, newFacility) {
  try {
    let configToLoad;
    if (!itemsense) throw new Error('itemsense object is null');
    if (!newConfigToLoad) throw new Error('Passed config object is null');
    if (typeof newConfigToLoad === 'string') {
      console.log('Passed config in string format, attempting to convert to JSON object.');
      configToLoad = JSON.parse(newConfigToLoad);
    } else {
      configToLoad = newConfigToLoad;
    }

    const requestPromises = [];

    order.forEach((endpoint) => {
      if (configToLoad[endpoint]) {
        switch (endpoint) {
          case 'facilities':
            console.log(`Loading ${endpoint}`);
            configToLoad.facilities.forEach((configDefinition) => {
              requestPromises.push(itemsense.facilities.update(configDefinition.name));
            });
            break;
          case 'readerDefinitions':
            console.log(`Loading ${endpoint}`);
            configToLoad.readerDefinitions.forEach((configDefinition) => {
              if (newFacility) {
                configDefinition.facility = newFacility;
              }
              requestPromises.push(itemsense.readerDefinitions.update(configDefinition));
            });
            break;
          case 'readerConfigurations':
            console.log(`Loading ${endpoint}`);
            configToLoad.readerConfigurations.forEach((configDefinition) => {
              requestPromises.push(itemsense.readerConfigurations.update(configDefinition));
            });
            break;
          case 'recipes':
            console.log(`Loading ${endpoint}`);
            configToLoad.recipes.forEach((configDefinition) => {
              requestPromises.push(itemsense.recipes.update(configDefinition));
            });
            break;
          case 'zoneMaps':
            console.log(`Loading ${endpoint}`);
            configToLoad.zoneMaps.forEach((configDefinition) => {
              requestPromises.push(itemsense.zoneMaps.update(configDefinition));
            });
            break;
          case 'users':
            console.log(`Loading ${endpoint}`);
            configToLoad.users.forEach((configDefinition) => {
              requestPromises.push(itemsense.users.update(configDefinition));
            });
            break;
          default:
            // no-op, ignore the attribute
            break;
        }
      }
    });
    return Promise.all(requestPromises).then(() => {
      console.log('All configuration loaded.\n');
    })
    .catch(reason => Promise.reject(reason));
  } catch (err) {
    console.log(err.stack);
    return Promise.reject(err);
  }
}

module.exports = loadIsConfig;
