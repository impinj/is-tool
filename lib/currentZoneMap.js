

function get(itemsense, facility) {
  if (!itemsense) return Promise.reject(new TypeError('itemsense object is null'));
  return itemsense.currentZoneMap.get(facility)
    .then(currentZoneMap => currentZoneMap.name);
}

function clear(itemsense, facility) {
  if (!itemsense) return Promise.reject(new TypeError('itemsense object is null'));
  return itemsense.currentZoneMap.clear(facility)
  .catch(() => {
    console.log(`Unable to remove currentZone Map for ${facility}. This might have to be done`,
      ' manually.');
  });
}

module.exports = {
  get,
  clear,
};
