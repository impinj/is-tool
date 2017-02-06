const converter = require('../lib/convert-r4-to-r6');

describe('When converting an empty object', () => {
  it('should return an empty object', () => {
      const promise = converter({});
      return expect(promise).to.eventually.eql({});
  });
});

describe('When converting a recipe,', () => {
  it('should change type to INVENTORY when locationReportingEnabled is false', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "locationReportingEnabled": false
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5
        }
      ]
    });
  });

  it('should change type to LOCATION when locationReportingEnabled is true', () => {
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "locationReportingEnabled": true
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "LOCATION",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5
        }
      ]
    });
  });

  it('should add new attributes computeWindow and reportingInterval with '
    + 'defaults of 20 and 5 respectively', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5
        }
      ]
    });
  });

  it('should remove attributes not used anymore ', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "presencePipelineEnabled": true,
        "locationReportingEnabled": false,
        "zoneModel": "GATEWAY",
        "historyWindowSizeInCycles": null,
        "locationAggregationModel": null,
        "agentComputeWindow": null,
        "agentUpdateInterval": null,
        "combineInventoryReads": null,
        "tagAgeInterval": null,
        "minimumMovementInMeters": 1
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5,
        }
      ]
    });
  });

  it('should not remove minimumMovementInMeters in location recipe ', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "locationReportingEnabled": true,
        "minimumMovementInMeters": 1
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "LOCATION",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5,
          "minimumMovementInMeters": 1
        }
      ]
    });
  });

  it('should remove minimumMovementInMeters in inventory recipe ', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "locationReportingEnabled": false,
        "minimumMovementInMeters": 1
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5,
        }
      ]
    });
  });

  it('should give computeWindow and reportingInterval defaults even if null in r4', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "computeWindowTimeInSeconds": null,
        "locationUpdateIntervalInSeconds": null
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 20,
          "name": "xArray-in-Gateway",
          "reportingInterval": 5
        }
      ]
    });
  });

  it('should change computeWindowTimeInSeconds and locationUpdateIntervalInSeconds to '
    + 'computeWindow and reportingInterval maintaining their values', () => {

    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "type": "LLRP",
        "computeWindowTimeInSeconds": 7,
        "locationUpdateIntervalInSeconds": 3
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [
        {
          "type": "INVENTORY",
          "computeWindow": 7,
          "name": "xArray-in-Gateway",
          "reportingInterval": 3
        }
      ]
    });
  });
});

describe('When converting reader configuration,', () => {
  it('should set type to LOCATION when location recipe has conf in readerConfigurationName', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurationName": "IMPINJ_InventoryConfig",
        "type": "LLRP",
        "locationReportingEnabled": true
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {}
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurationName": "IMPINJ_InventoryConfig",
          "type": "LOCATION",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "LOCATION",
        "configuration": {
          "disabledAntennas": []
        }
      }]
    });
  });

  it('should set type to LOCATION when location recipe has conf in readerConfigurations', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": true
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {}
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "LOCATION",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "LOCATION",
        "configuration": {
          "disabledAntennas": []
        }
      }]
    });
  });

  it('should set type to INVENTORY when inventory recipe has conf in readerConfigurationName', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurationName": "IMPINJ_InventoryConfig",
        "type": "LLRP",
        "locationReportingEnabled": false
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {}
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurationName": "IMPINJ_InventoryConfig",
          "type": "INVENTORY",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "INVENTORY",
        "configuration": {}
      }]
    });
  });

  it('should set type to INVENTORY when inventory recipe has conf in readerConfigurations', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": false
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {}
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "INVENTORY",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "INVENTORY",
        "configuration": {}
      }]
    });
  });

  it('should only remove reportConfig if associated recipe is inventory', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": false
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {
          "readerMode": "MODE_1002",
          "searchMode": "SINGLE_TARGET",
          "session": 2,
          "tagPopulationEstimate": 32,
          "antennas": [45,16,35,14,49,36,2,31,18,29,48,19,46,3,33,52,15,50,13,32,1,51,30,17,47,20,34,4],
          "reportConfig": {
            "tidIncluded": false,
            "peakRssiIncluded": false,
            "phaseAngleIncluded": false,
            "dopplerFrequencyIncluded": false,
            "channelIncluded": false
          }
        }
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "INVENTORY",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "INVENTORY",
        "configuration": {
          "readerMode": "MODE_1002",
          "searchMode": "SINGLE_TARGET",
          "session": 2,
          "tagPopulationEstimate": 32,
          "antennas": [45,16,35,14,49,36,2,31,18,29,48,19,46,3,33,52,15,50,13,32,1,51,30,17,47,20,34,4]
        }
      }]
    });
  });

  it('should remove tagPopulationEstimate if associated recipe is location', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": true
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {
          "tagPopulationEstimate": 32,
        }
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "LOCATION",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "LOCATION",
        "configuration": {
          "disabledAntennas": []
        }
      }]
    });
  });

  it('should remove rename antennas to disabledAntennas if associated recipe is location', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": true
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "NORMAL",
        "configuration": {
          "tagPopulationEstimate": 32,
          "antennas": [45,16,35,1,47,20,34,4]
        }
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "LOCATION",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "LOCATION",
        "configuration": {
          "disabledAntennas": []
        }
      }]
    });
  });

  it('should do nothing if associated recipe is DO_NOTHING', ()=>{
    let promise = converter({
      "recipes": [{
        "name": "xArray-in-Gateway",
        "readerConfigurations": {
          "xArray-REC-Inner": "IMPINJ_InventoryConfig"
        },
        "type": "LLRP",
        "locationReportingEnabled": false
      }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "DO_NOTHING"
      }]
    });
    return expect(promise).to.eventually.eql({
      "recipes": [{
          "name": "xArray-in-Gateway",
          "readerConfigurations": {
            "xArray-REC-Inner": "IMPINJ_InventoryConfig"
          },
          "type": "INVENTORY",
          "computeWindow": 20,
          "reportingInterval": 5
        }],
      "readerConfigurations": [{
        "name": "IMPINJ_InventoryConfig",
        "operation": "DO_NOTHING"
      }]
    });
  });
});
