var order = require('../config/endpoint-config').load;


function writeJson(config, fileLocation){
  console.log("Writing to " + fileLocation + ": "  + JSON.stringify(config));

  fs.writeFile(fileLocation.toString(), JSON.stringify(config, null, 2), (err)=>{
    if (err){
      throw new Error(err);
    }
  });
}

function createLoadPromises(requestPromises,configArray,endpoint,newfacility){
  configArray.forEach(function(configDefinition)){
    if(newFacility) readerDefinition['facility'] = newFacility
    requestPromises.push(itemsense.readerDefinitions.update());
  }
  return requestPromises;
}

function loadIsConfig(itemsense, configToLoad, newFacility){
  if(!itemsense) throw new Error("itemsense object is null");
  if(!configToLoad) throw new Error("Configurat object to load is null");
  let requestPromises = [];

  order.forEach(function(endpoint){
    if(configToLoad[endpoint]){
      switch(endpoint){}
        case "facilities":
          requests.push(itemsense.facilities.update());
          break;
        case "readerDefinitions":

          break;
        case "readerConfigurations":  requests.push(itemsense.readerConfigurations.update()); break;
        case "recipes":  requests.push(itemsense.recipes.update()); break;
        case "zoneMaps":  requests.push(itemsense.zoneMaps.update()); break;
        case "users":  requests.push(itemsense.users.update()); break;
      }
    }
  });

  return Promise.all(requests).then(configs => {
     let configObject = {
       facilities: configs[0],
       readerDefinitions: configs[1],
       readerConfigurations: configs[2],
       zoneMaps: configs[3],
       user: configs[4],
       recipes: configs[5]
     }
     writeJson(configObject, fileLocation);
     return fileLocation;
  }).catch(reason => {
    return Promise.reject(reason);
  });

}




module.exports = saveIsConfig;
