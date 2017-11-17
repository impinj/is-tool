
function exists(value) {
  return !!value;
}

function isArray(value) {
  return Array.isArray(value);
}

function hasElements(value) {
  return value.length > 0;
}

function isInt(value) {
  return !isNaN(value);
}

function isValidArray(value) {
  return (exists(value) && isArray(value) && hasElements(value));
}

// This function takes an array of objects with must have two properties
// "id" and "name", It returns a object with the IDs as the keys and the
// names as the value.
function createIdToNameMap(configs) {
  if (configs) {
    return configs.reduce((acc, config) => {
      if (config.id && config.name) acc[config.id] = config.name;
      return acc;
    }, {});
  }
  throw new Error('id to name cannot be create as necessary config not present');
}

module.exports = {
  exists,
  isArray,
  hasElements,
  isInt,
  isValidArray,
  createIdToNameMap
};
