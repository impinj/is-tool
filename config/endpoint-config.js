module.exports = {
  save: {
    facilities: '/itemsense/configuration/v1/facilities/show',
    readerDefinitions: '/itemsense/configuration/v1/readerDefinitions/show',
    readerConfigurations: '/itemsense/configuration/v1/readerConfigurations/show',
    recipes: '/itemsense/configuration/v1/recipes/show',
    zoneMaps: '/itemsense/configuration/v1/zoneMaps/show',
    users: '/itemsense/configuration/v1/users/show'
  },
  load: {
    facilities: '/itemsense/configuration/v1/facilities/createOrReplace',
    readerDefinitions: '/itemsense/configuration/v1/readerDefinitions/createOrReplace',
    readerConfigurations: '/itemsense/configuration/v1/readerConfigurations/createOrReplace',
    recipes: '/itemsense/configuration/v1/recipes/createOrReplace',
    zoneMaps: '/itemsense/configuration/v1/zoneMaps/createOrReplace',
    users: '/itemsense/configuration/v1/users/createOrReplace'
  }
}
