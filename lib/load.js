var order = require('../config/endpoint-config').load;

function loadIsConfig(itemsense, configToLoad, newFacility){
  try{
    if(!itemsense) throw new Error("itemsense object is null");
    if(!configToLoad) throw new Error("Configuration object to load is null");
    let requestPromises = [];

    order.forEach(function(endpoint){
      console.log("Loading " + endpoint);
      if(configToLoad[endpoint]){
        switch(endpoint){
          case "facilities":
            configToLoad.facilities.forEach(function(configDefinition){
              requestPromises.push(itemsense.facilities.update(configDefinition.name));
            });
            break;
          case "readerDefinitions":
            if(newFacility)
              configToLoad.readerDefinitions.forEach((def) => configDefinition['facility'] = newFacility);
              configToLoad.readerDefinitions.forEach(function(configDefinition){
                requestPromises.push(itemsense.readerDefinitions.update(configDefinition));
              });
            break;
          case "readerConfigurations":
            configToLoad.readerConfigurations.forEach(function(configDefinition){
              requestPromises.push(itemsense.readerConfigurations.update(configDefinition));
            });
            break;
          case "recipes":
            configToLoad.recipes.forEach(function(configDefinition){
              requestPromises.push(itemsense.recipes.update(configDefinition));
            });
            break;
          case "zoneMaps":
            configToLoad.zoneMaps.forEach(function(configDefinition){
              requestPromises.push(itemsense.zoneMaps.update(configDefinition));
            });
            break;
          case "users":
            configToLoad.users.forEach(function(configDefinition){
              requestPromises.push(itemsense.users.update(configDefinition));
            });
            break;
        }
      }
    });
    return Promise.all(requestPromises).then(results => {
      console.log("All configuration loaded.\n");
      Promise.resolve();
    }).catch(reason => {
      return Promise.reject(reason);
    });
  }
  catch(err){
    console.log(err.stack);
    return Promise.reject(err);
  }
}

module.exports = loadIsConfig;
