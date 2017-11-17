const globalConf = require('../../config/config');

function allValuesSame(array) {
  return array.every(element => element === array[0]);
}

function uniqueValues(array) {
  return array.reduce((p, c) => {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
}

function doesntContain(array, compare) {
  return array.every(element => element.name !== compare);
}

function getReaderArrangement(arrangement) {
  const arrangementByDoor = {};
  const readers = Object.keys(arrangement);
  readers.forEach((reader) => {
    if (arrangement[reader].side.length === 0 && !allValuesSame(arrangement[reader].door)) {
      // if side isn't defined then the reader is in OVERHEAD position, this means
      // it can only be associated to one door.
      throw new Error('Invalid Config: reader without side specified cannot belong to multiple doors');
    } else if (arrangement[reader].side.length === 0) {
      // if side isn't defined then the reader is in OVERHEAD position
      const door = arrangement[reader].door[0];
      if (!arrangementByDoor[door]) {
        arrangementByDoor[door] = {
          readers: [reader],
          arrangement: 'OVERHEAD'
        };
      } else if (arrangementByDoor[door].arrangement === 'OVERHEAD') {
        // if a reader is already associated to a door and that reader is also
        // in OVERHEAD position then this is ok
        arrangementByDoor[door].readers.push(reader);
      } else {
        // This is when a reader which had a side specified (so not OVERHEAD) is
        // already associated to a door. This is an error.
        throw new Error(
          'Invalid Config: reader without side specifed cannot belong ' +
          'to the same door as a reader with a side specified'
        );
      }
    } else if (allValuesSame(arrangement[reader].side) && allValuesSame(arrangement[reader].door)) {
      // if reader has all sides the same and belongs to a single door, it's in SIDE_BY_SIDE
      // arrangement

      const door = arrangement[reader].door[0];
      if (!arrangementByDoor[door]) {
        arrangementByDoor[door] = {
          readers: [reader],
          arrangement: 'SIDE_BY_SIDE'
        };
      } else if (arrangementByDoor[door].arrangement === 'SIDE_BY_SIDE') {
        // if the existing reader associated to the door is also side by side
        // then we assume this reader is the other side of the same door or even
        // the same side of the door (for when readers are stacked)
        arrangementByDoor[door].readers.push(reader);
      } else if (arrangementByDoor[door].arrangement === 'OVERHEAD_OFFSET') {
        // if the other reader associated to this door is OVERHEAD_OFFSET then
        // we will assume that this reader is at the end of a line of
        // OVERHEAD_OFFSET readers
        arrangementByDoor[door].readers.push(reader);
      }
    } else if (
        !allValuesSame(arrangement[reader].side)
        && !allValuesSame(arrangement[reader].door)
      ) {
      // if a reader has anntennas defined on either side and is part of different doors, we
      // assume it is in OVERHEAD_OFFSET arrangement

      // This reader belongs to multiple doors so we have to set each door independently
      uniqueValues(arrangement[reader].door).forEach((door) => {
        if (!arrangementByDoor[door]) {
          arrangementByDoor[door] = {
            readers: [reader],
            arrangement: 'OVERHEAD_OFFSET'
          };
        } else if (arrangementByDoor[door].arrangement === 'SIDE_BY_SIDE') {
          // if this reader is part of the same door as another reader which we
          // determined to be SIDE_BY_SIDE then we need to change that other reader
          // as it's actually at the end of a line of OVERHEAD_OFFSET
          arrangementByDoor[door].arrangement = 'OVERHEAD_OFFSET';
          arrangementByDoor[door].readers.push(reader);
        }
      });
    } else {
      // if reader belongs to one door but sides ARE specified. This sounds
      // like it could be OVERHEAD but in that case no sides should be specified
      // so is an error

      throw new Error(
        'Invalid Config: reader cannot belong to one door with ' +
        'multiple sides specified'
      );
    }
  });
  return arrangementByDoor;
}

function getAntennaName(antennaConfiguration, side) {
  let name = side;
  const antennaIdName = (suffix, element) => `${suffix}-${element.antennaId}`;
  ['out', 'in'].forEach((orientation) => {
    if (antennaConfiguration[orientation]) {
      name = `${name}-${orientation}${antennaConfiguration[orientation].reduce(antennaIdName, '')}`;
    }
  });
  return name;
}

function createAntennaObjects(configs) {
  const newConfigs = Object.assign({}, configs);
  const configToConvert = newConfigs.configurations;
  if (Object.keys(configToConvert).length === 0) {
    newConfigs.convertedConfigs = {};
    return Promise.resolve(newConfigs);
  }

  newConfigs.convertedConfigs = {
    antennaConfigurations: []
  };
  const newConfig = newConfigs.convertedConfigs;
  newConfigs.readerToAntenna = {};

  Object.keys(configToConvert['reader-manager-config'].readers).forEach((reader) => {
    const newAntenna = {};
    const host = configToConvert['reader-manager-config'].readers[reader].host;
    configToConvert['reader-manager-config'].readers[reader].antennas.forEach((antenna) => {
      const side = antenna.side ? antenna.side : 'center';
      if (!newConfigs.arrangement) newConfigs.arrangement = {};
      if (!newConfigs.arrangement[host]) newConfigs.arrangement[host] = {};
      if (!newConfigs.arrangement[host].door) {
        newConfigs.arrangement[host] = {
          door: [antenna.door],
          side: (side === 'center') ? [] : [side]
        };
      } else {
        newConfigs.arrangement[host].door.push(antenna.door);
        if (side !== 'center') newConfigs.arrangement[host].side.push(side);
      }

      // Create antenna configs while ensuring separation by side of reader the
      // anntenna is on. If this is not done then the configs can overwrite each
      // other.
      if (!newAntenna[side]) newAntenna[side] = {};
      if (antenna.orientation) {
        if (newAntenna[side][antenna.orientation.toLowerCase()]) {
          newAntenna[side][antenna.orientation.toLowerCase()].push({
            antennaId: antenna.antenna
          });
        } else {
          newAntenna[side][antenna.orientation.toLowerCase()] = [{
            antennaId: antenna.antenna
          }];
        }
      }
      if (side !== 'center') newAntenna[side].side = side;
    });
    ['right', 'left', 'center'].forEach((side) => {
      if (newAntenna[side]) {
        const antennaName = getAntennaName(newAntenna[side], side);
        if (!newConfigs.readerToAntenna[host]) newConfigs.readerToAntenna[host] = {};
        newConfigs.readerToAntenna[host][side] = antennaName;
        // Store the new antenna configuration only if we don't already have the same
        // combination of side, orientation and ids.
        if (doesntContain(newConfig.antennaConfigurations, antennaName)) {
          newAntenna[side].name = antennaName;
          newConfig.antennaConfigurations.push(newAntenna[side]);
        }
      }
    });
  });
  newConfigs.arrangementByDoor = getReaderArrangement(newConfigs.arrangement);
  return Promise.resolve(newConfigs);
}

function createThresholdObjects(configs) {
  const newConfigs = Object.assign({}, configs);
  const configToConvert = newConfigs.configurations;
  newConfigs.convertedConfigs.thresholds = [];
  const stagedThresholds = {};
  if (Object.keys(configToConvert).length === 0) {
    return Promise.resolve({});
  }
  try {
    const readers = Object.keys(configToConvert['reader-manager-config'].readers);
    readers.forEach((reader) => {
      configToConvert['reader-manager-config'].readers[reader].antennas.forEach((antenna) => {
        const door = antenna.door;
        const side = antenna.side ? antenna.side : 'center';
        const host = configToConvert['reader-manager-config'].readers[reader].host;
        if (stagedThresholds[door]) {
          if (!stagedThresholds[door].readers[host]) {
            stagedThresholds[door].readers[host] = {};
            stagedThresholds[door].readers[host].antennaConfigurationId = '';
          }
          stagedThresholds[door].readers[host].antennaConfigurationId
            = newConfigs.readerToAntenna[host][side];
        } else {
          stagedThresholds[door] = {};
          stagedThresholds[door].name = door;
          stagedThresholds[door].facility = configs.facility;
          stagedThresholds[door].readerArrangement
            = newConfigs.arrangementByDoor[door].arrangement;
          stagedThresholds[door].readers = {};
          stagedThresholds[door].readers[host] = {};
          stagedThresholds[door].readers[host].antennaConfigurationId
            = newConfigs.readerToAntenna[host][side];
        }
      });
    });

    Object.keys(stagedThresholds).forEach((threshold) => {
      newConfigs.convertedConfigs.thresholds.push(stagedThresholds[threshold]);
    });
  } catch (reason) {
    throw new Error(reason);
  }
  return Promise.resolve(newConfigs.convertedConfigs);
}

function convertAndValidateConfig(inputConfig, facility) {
  try {
    let configurations;
    if (!inputConfig) return Promise.reject('null object passed, cannot convert');
    if ((typeof inputConfig) === 'string') {
      configurations = JSON.parse(inputConfig);
    } else {
      configurations = inputConfig;
    }
    return Promise.resolve({
      configurations,
      facility: facility || 'DEFAULT'
    });
  } catch (reason) {
    if (globalConf.logging === 'loud') console.log(`Caught exception: ${reason.message} \n${reason.stack}`);
    return Promise.reject(reason);
  }
}

function convertThreshold(inputConfig, facility) {
  return convertAndValidateConfig(inputConfig, facility)
    .then(createAntennaObjects)
    .then(createThresholdObjects);
}

module.exports = convertThreshold;
