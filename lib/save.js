var fs = require('fs');

function writeJson(config, fileLocation){
  console.log("Writing to " + fileLocation + ": "  + JSON.stringify(config));

  fs.writeFile(fileLocation.toString(), JSON.stringify(config, null, 2), (err)=>{
    if (err){
      throw new Error(err);
    }
  });
}

function saveIsConfig(itemsense, fileLocation){
  if(!itemsense) throw new Error("itemsense object is null");
  let requests = [];

  requests.push(itemsense.facilities.getAll());
  requests.push(itemsense.readerDefinitions.getAll());
  requests.push(itemsense.readerConfigurations.getAll());
  requests.push(itemsense.zoneMaps.getAll());
  requests.push(itemsense.users.getAll());
  requests.push(itemsense.recipes.getAll());
  console.log(requests.length);
  console.log("about to run promise.all" + requests + "is an array");
  return Promise.all(requests).then(configs => {
     console.log("all requests returned!")
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
