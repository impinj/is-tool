function allTypesSame(recipes) {
  return recipes.every(recipe => recipe.type === recipes[0].type);
}

function recipeAleadyListed(checkName, recipesList) {
  return recipesList.some(recipe => recipe.name === checkName);
}

function renameJsonElement(dictObj, fromName, toName, defaultValue) {
  if (fromName === toName) return;
  if (fromName in dictObj) {
    dictObj[toName] = dictObj[fromName];
    delete dictObj[fromName];
  }
  if ((defaultValue) && (dictObj[toName] === null || dictObj[toName] === undefined)) {
    dictObj[toName] = defaultValue;
  }
}

function isDictEmpty(obj) {
  return !(Object.keys(obj).length > 0);
}

function buildErrorString(reader) {
  let errString = `\nReader configuration '${reader.readerConf.name}' used by recipes:\n`;
  reader.recipes.forEach((recipe) => {
    errString += `\t'${recipe.name}' of type: ${recipe.type}\n`;
  });
  return errString;
}

function convertRecipes(readerConfToRecipe, configurations) {
  const recipesConfigId = 'recipes';
  const add2map = (readerConfNameFromRecipe, recipe) => {
    const readerConfNameFromRecipeLowerCase = readerConfNameFromRecipe.toLowerCase();
    if (readerConfNameFromRecipeLowerCase in readerConfToRecipe) {
      if (!recipeAleadyListed(
            recipe.name,
            readerConfToRecipe[readerConfNameFromRecipeLowerCase].recipes
          )
        ) {
        readerConfToRecipe[readerConfNameFromRecipeLowerCase].recipes.push(recipe);
      }
    } else {
      readerConfToRecipe[readerConfNameFromRecipeLowerCase] = {
        recipes: [recipe],
        consistent: false,
        type: '',
        readerConf: {}
      };
    }
  };

  console.log('Converting recipes....');
  if (recipesConfigId in configurations) {
    configurations[recipesConfigId].forEach((rJsonInput) => {
      const lreName = 'locationReportingEnabled';
      const isLocationReportingEnabled = lreName in rJsonInput && rJsonInput[lreName];
      if (rJsonInput.type !== 'LOCATION' && !isLocationReportingEnabled) {
        rJsonInput.type = 'INVENTORY';
        delete rJsonInput.minimumMovementInMeters;
      } else {
        rJsonInput.type = 'LOCATION';
      }
      delete rJsonInput.locationReportingEnabled;
      delete rJsonInput.presencePipelineEnabled;
      delete rJsonInput.zoneModel;
      delete rJsonInput.historyWindowSizeInCycles;
      delete rJsonInput.computeWindowSizeInCycles;
      delete rJsonInput.agentComputeWindow;
      delete rJsonInput.agentUpdateInterval;
      delete rJsonInput.combineInventoryReads;
      delete rJsonInput.locationAggregationModel;
      renameJsonElement(rJsonInput, 'computeWindowTimeInSeconds',
        'computeWindow', 20);
      renameJsonElement(rJsonInput, 'locationUpdateIntervalInSeconds',
       'reportingInterval', 5);
      if ('tagAgeInterval' in rJsonInput) {
        delete rJsonInput.tagAgeInterval;
      }
      if (rJsonInput.readerConfigurationName && rJsonInput.readerConfigurationName !== null) {
        add2map(rJsonInput.readerConfigurationName, rJsonInput);
      }
      if (rJsonInput.readerConfigurations && !isDictEmpty(rJsonInput.readerConfigurations)) {
        for (const i in rJsonInput.readerConfigurations) {
          if (Object.hasOwnProperty.call(rJsonInput.readerConfigurations, i)) {
            add2map(rJsonInput.readerConfigurations[i], rJsonInput);
          }
        }
      }
    });
  }
}

// Check if each of the reader configs are associated to the same recipe type.
// If they are, mark that reader conf to recipe association as consistent.
function analyzeReaderConfToRecipesMap(readerConfToRecipe, configurations) {
  if ('readerConfigurations' in configurations && 'recipes' in configurations) {
    console.log('Analyzing readerConfigurations....');
    for (const rcJsonInput in configurations.readerConfigurations) {
      if (Object.hasOwnProperty.call(configurations.readerConfigurations, rcJsonInput)) {
        const currentReaderConf = configurations.readerConfigurations[rcJsonInput];
        const readerConfMap =
          readerConfToRecipe[currentReaderConf.name.toLowerCase()];
        if (readerConfMap) {
          if (currentReaderConf.operation !== 'DO_NOTHING') {
            if (allTypesSame(readerConfMap.recipes)) {
              readerConfMap.consistent = true;
              readerConfMap.type = readerConfMap.recipes[0].type;
              readerConfMap.readerConf = currentReaderConf;
            } else {
              readerConfMap.consistent = false;
              readerConfMap.readerConf = currentReaderConf;
            }
          } else {
            // remove reader configurations of DO_NOTHING type from consideration
            delete readerConfToRecipe[currentReaderConf.name.toLowerCase()];
          }
        } else {
          console.warn(`Warning: Reader Configuration ${currentReaderConf.name} `
            + "not used in recipe so can't be converted to 2016r6 format.");
        }
      }
    }
  }
}

function convertReaderConfigurations(readerConfToRecipe) {
  const errorList = [];
  for (const recipe in readerConfToRecipe) {
    if (Object.hasOwnProperty.call(readerConfToRecipe, recipe)) {
      const currentReader = readerConfToRecipe[recipe];
      if (currentReader.consistent === true) {
        const readerConf = currentReader.readerConf;
        if (currentReader.type === 'INVENTORY') {
          readerConf.operation = 'INVENTORY';
        }
        if (currentReader.type === 'LOCATION') {
          readerConf.operation = 'LOCATION';
          delete readerConf.configuration.searchMode;
          delete readerConf.configuration.tagPopulationEstimate;
          delete readerConf.configuration.transmitPowerInDbm;
          delete readerConf.configuration.polarization;
          delete readerConf.configuration.channelConfig;
          readerConf.configuration.disabledAntennas = [];
          delete readerConf.configuration.antennas;
        }
        if (readerConf.operation === 'LOCATION'
          || readerConf.operation === 'INVENTORY') {
          delete readerConf.configuration.reportConfig;
        }
      } else {
        errorList.push(buildErrorString(currentReader, currentReader.readerConf.name));
      }
    }
  }

  return errorList;
}

function convertR4ToR6(configurations) {
  if (!configurations) throw new Error('Passed configuration object is null');

  const readerConfToRecipe = {};
  try {
    convertRecipes(readerConfToRecipe, configurations);
    analyzeReaderConfToRecipesMap(readerConfToRecipe, configurations);
    const errorList = convertReaderConfigurations(readerConfToRecipe);

    if (errorList.length !== 0) {
      const errStr = "\n\nReader configurations can't be associated to different "
      + 'recipe types.\nThe following inconsistent reader configurations were '
      + `found:\n${errorList.join('\n')}`
      + '\nPlease correct these inconsistencies before converting.';

      return Promise.reject(new Error(errStr));
    }
    console.log(
      "\nNote: This scipt didn't add any antenna numbers to the new disabledAntennas"
      + '\nfield. If necessary, please update this parameter to suit your '
      + 'requirements');
    return Promise.resolve(configurations);
  } catch (reason) {
    console.log(`Caught exception: ${reason.message} \n${reason.stack}`);
    return Promise.reject(reason);
  }
}

module.exports = convertR4ToR6;
