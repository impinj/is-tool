function allTypesSame(recipes) {
  return recipes.every((recipe) => recipe.type === recipes[0].type);
}

function recipeAleadyListed(checkName, recipesList){
  return recipesList.some((recipe) => recipe.name === checkName);
}

function renameJsonElement(dictObj, fromName, toName, defaultValue) {
  if (fromName === toName) return;

  dictObj[toName] = defaultValue;
  if (fromName in dictObj)
  {
    dictObj[toName] = dictObj[fromName];
    delete dictObj[fromName];
  }
}

function isDictEmpty(obj){
  return !(Object.keys(obj).length > 0);
}

function buildErrorString(reader){
  let errString = `\nReader configuration \'${reader.readerConf.name}\' used by recipes:\n`;
  reader.recipes.forEach((recipe) => {
    errString += `\t \'${recipe.name}\' of type: ${recipe.type}\n`;
  });
  return errString;
}

function convertRecipes(readerConfToRecipe, configurations){
  const recipesConfigId = "recipes";
  const add2map = (readerConfNameFromRecipe, recipe) => {
    const  readerConfNameFromRecipeLowerCase = readerConfNameFromRecipe.toLowerCase();
    if(readerConfNameFromRecipeLowerCase in readerConfToRecipe){
      if(!recipeAleadyListed(recipe.name,readerConfToRecipe[readerConfNameFromRecipeLowerCase].recipes)){
        readerConfToRecipe[readerConfNameFromRecipeLowerCase].recipes.push(recipe);
      }
    } else {
      readerConfToRecipe[readerConfNameFromRecipeLowerCase] = { recipes: [recipe],
        consistent: false, type: "", readerConf: {} };
    }
  };

  console.log("Converting recipes....");
  if (recipesConfigId in configurations) {
    configurations[recipesConfigId].forEach((rJsonInput) => {
      const lreName = "locationReportingEnabled";
      let isLocationReportingEnabled = lreName in rJsonInput && rJsonInput[lreName];
      let rName = rJsonInput.name;
      if (rJsonInput["type"] !== "LOCATION" && !isLocationReportingEnabled) {
        rJsonInput["type"] = "INVENTORY";
        delete rJsonInput["minimumMovementInMeters"];
      } else {
        rJsonInput["type"] = "LOCATION";
      }
      delete rJsonInput["locationReportingEnabled"];
      delete rJsonInput["presencePipelineEnabled"];
      delete rJsonInput["zoneModel"];
      delete rJsonInput["historyWindowSizeInCycles"];
      delete rJsonInput["computeWindowSizeInCycles"];
      renameJsonElement(rJsonInput, "computeWindowTimeInSeconds",
        "computeWindow", 20);
      renameJsonElement(rJsonInput, "locationUpdateIntervalSeconds",
       "reportingInterval", 5);
      if ("tagAgeInterval" in rJsonInput) {
        delete rJsonInput["tagAgeInterval"];
      }
      if(rJsonInput.readerConfigurationName !== null)
        add2map(rJsonInput.readerConfigurationName, rJsonInput);
      if(!isDictEmpty(rJsonInput.readerConfigurations)){
        for(let i in rJsonInput.readerConfigurations){
          add2map(rJsonInput.readerConfigurations[i],rJsonInput);
        }
      }
    });
  }
}

//Check if each of the reader configs are associated to the same recipe type.
// If they are, mark that reader conf to recipe association as consistent.
function analyzeReaderConfToRecipesMap(readerConfToRecipe, configurations){
  if ("readerConfigurations" in configurations && "recipes" in configurations) {
    console.log("Converting readerConfigurations....");
    configurations["readerConfigurations"].forEach((rcJsonInput) => {
      let readerConfMap = readerConfToRecipe[rcJsonInput.name.toLowerCase()];
      if(readerConfMap){
        if (rcJsonInput.operation !== 'DO_NOTHING'){
          if(allTypesSame(readerConfMap.recipes)){
            readerConfMap.consistent = true;
            readerConfMap.type = readerConfMap["recipes"][0].type;
            readerConfMap.readerConf = rcJsonInput;
          } else {
            readerConfMap.consistent = false;
            readerConfMap.readerConf = rcJsonInput;
          }
        } else {
          //remove reader configurations of DO_NOTHING type from consideration
          delete readerConfToRecipe[rcJsonInput.name.toLowerCase()]
        }
      } else {
        console.warn(`Warning: Reader Configuration ${rcJsonInput.name} not `
        + `used in recipe so can't be converted to 2016r6 format.`);
      }
    });
  }
}

function convertReaderConfigurations(readerConfToRecipe, configurations){
  let errorList = [];
  for(let readerName in readerConfToRecipe){
    let currentReader = readerConfToRecipe[readerName];
    if(currentReader.consistent == true){
      let readerConf = currentReader.readerConf;
      if (currentReader.type === "INVENTORY") {
        readerConf["operation"] = "INVENTORY";
      }
      if (currentReader.type === "LOCATION") {
        readerConf["operation"] = "LOCATION";
        delete readerConf.configuration["searchMode"];
        delete readerConf.configuration["tagPopulationEstimate"];
        delete readerConf.configuration["transmitPowerInDbm"];
        delete readerConf.configuration["polarization"];
        delete readerConf.configuration["antennas"];
        delete readerConf.configuration["channelConfig"];
      }
      if (readerConf["operation"] === "LOCATION" || readerConf["operation"]
        === "INVENTORY") {
        delete readerConf.configuration["reportConfig"];
      }
      if ("filter" in readerConf.configuration
        && readerConf.configuration["filter"] !== null
        && "memoryBank" in readerConf.configuration["filter"]
        && readerConf.configuration["filter"]["memoryBank"] === 0) {
        readerConf.configuration["filter"]["memoryBank"] = 1;
      }
    } else {
      errorList.push(buildErrorString(currentReader, readerName));
    }

  }
  return errorList;
}

function convertR4ToR6(configurations) {
  if(!configurations) throw new Error("Passed configuration object is null");

  const readerConfToRecipe = {};
  try {
    console.log("Converting configuration according to ")
    convertRecipes(readerConfToRecipe, configurations);
    analyzeReaderConfToRecipesMap(readerConfToRecipe, configurations);
    let errorList = convertReaderConfigurations(readerConfToRecipe);

    if(errorList.length !== 0){
      let errStr = "\n\nReader configurations can't be associated to different "
      + "recipe types.\nThe following inconsistent reader configurations were "
      + "found:\n " + errorList.join('\n')
      + "\n Please correct these inconsistencies before converting.";

      return Promise.reject(new Error(errStr));
    }
    return Promise.resolve(configurations);
  }
  catch (reason){
    return Promise.reject(reason);
  }
}

module.exports = convertR4ToR6;
