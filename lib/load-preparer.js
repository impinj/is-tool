function readerDefinitions(conf, opts) {
  const modConf = Object.assign({}, conf);
  if (opts.newFacility) modConf.facility = opts.newFacility;
  if (!conf.agentIdentifier) modConf.agentIdentifier = modConf.name;
  return modConf;
}

function readerConfigurations(conf) {
  const modConf = Object.assign({}, conf);
  const has = Object.prototype.hasOwnProperty;
  if (has.call(conf.configuration, 'reportConfig')) delete modConf.configuration.reportConfig;
  if ((has.call(conf.configuration, 'channelConfig'))
    && (conf.configuration.channelConfig)
    && (has.call(conf.configuration.channelConfig, 'channelIndex'))
    && (has.call(conf.configuration.channelConfig, 'txFrequenciesInMhz'))) {
    delete modConf.configuration.channelConfig.channelIndex;
  }
  return modConf;
}

function users(conf, opts) {
  if (opts.addPassword) {
    if (!opts.existingConf.users.some(e => e.name === conf.name)) {
      return Object.assign({}, conf, { password: 'default01' });
    }
  }
  return conf;
}

function thresholds(conf, opts) {
  const modConf = Object.assign({}, conf);
  if (opts.antennaConfNameToId) {
    Object.keys(modConf.readers).forEach((reader) => {
      if (opts.antennaConfNameToId[modConf.readers[reader].antennaConfigurationId]) {
        // if the antenna configuration name is in the reader to antenna
        // map then replace it with the ID
        const modReader = Object.assign({}, modConf.readers[reader]);
        modReader.antennaConfigurationId
          = opts.antennaConfNameToId[modConf.readers[reader].antennaConfigurationId];
        modConf.readers[reader] = modReader;
      }
    });
  }
  return modConf;
}

function facilities(conf) {
  return conf;
}

function antennaConfigurations(conf) {
  return conf;
}

function recipes(conf) {
  return conf;
}
function zoneMaps(conf) {
  return conf;
}

module.exports = {
  readerDefinitions,
  readerConfigurations,
  users,
  thresholds,
  facilities,
  antennaConfigurations,
  recipes,
  zoneMaps
};