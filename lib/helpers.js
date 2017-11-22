const { isArray } = Array;

function exists(value) {
  return typeof value !== 'undefined';
}

function isNotEmpty(value) {
  return value.length > 0;
}

function isInt(value) {
  return Number.isInteger(value);
}

function isNonEmptyArray(value) {
  return (exists(value) && isArray(value) && isNotEmpty(value));
}

// This function takes an array of objects that must have two properties
// "id" and "name". It returns an object with the IDs as the keys and the
// names as the values.
function createIdToNameMap(configs) {
  if (exists(configs)) {
    return configs.reduce((acc, config) => {
      if (config.id && config.name) acc[config.id] = config.name;
      return acc;
    }, {});
  }
  throw new Error('id to name map cannot be created as object does not contain both "name" and "id" properties');
}

module.exports = {
  exists,
  isArray,
  isNotEmpty,
  isInt,
  isNonEmptyArray,
  createIdToNameMap
};
