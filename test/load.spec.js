const load = require('../lib/load');
const sinon = require('sinon');
const Itemsense = require('itemsense-node');

function getResult(clause, failMessage){
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

describe('When loading an object', () => {
  before(()=>{
    const itemsenseConfig = {
      "username": "admin",
      "password": "admindefault",
      "itemsenseUrl": `http://127.0.0.1/itemsense`
    };
    this.itemsense = new Itemsense(itemsenseConfig);
    this.itemsense.facilities.update = sinon.stub(this.itemsense.facilities, "update")
    this.itemsense.readerDefinitions.update = sinon.stub(this.itemsense.readerDefinitions, "update")
    this.itemsense.readerConfigurations.update = sinon.stub(this.itemsense.readerConfigurations, "update")
    this.itemsense.recipes.update = sinon.stub(this.itemsense.recipes, "update")
    this.itemsense.zoneMaps.update = sinon.stub(this.itemsense.zoneMaps, "update")
    this.itemsense.users.update = sinon.stub(this.itemsense.users, "update")

  });

  after(()=>{
    this.itemsense.facilities.update.restore();
    this.itemsense.readerDefinitions.update.restore();
    this.itemsense.readerConfigurations.update.restore();
    this.itemsense.recipes.update.restore();
    this.itemsense.zoneMaps.update.restore();
    this.itemsense.users.update.restore();
  });

  afterEach(()=>{
    this.itemsense.facilities.update.callCount = 0;
    this.itemsense.readerDefinitions.update.callCount = 0;
    this.itemsense.readerConfigurations.update.callCount = 0;
    this.itemsense.recipes.update.callCount = 0;
    this.itemsense.zoneMaps.update.callCount = 0;
    this.itemsense.users.update.callCount = 0;
  })
  it('should not error if the conf object is empty', ()=>{
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, {});
    return expect(promise).to.eventually.be.fulfilled;
  });

  it('should not error if the conf object is a string', ()=>{
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, "{}");
    return expect(promise).to.eventually.be.fulfilled;
  });

  it('should error if the passed itemsense object is null', ()=>{
    let promise = load(null);
    return expect(promise).to.eventually.be.rejected
      && expect(promise).to.be.rejectedWith('itemsense object is null');
  });

  it('should error if the conf object is null', ()=>{
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, null);
    return expect(promise).to.eventually.be.rejected
      && expect(promise).to.be.rejectedWith('Passed config object is null');
  });

  it('should load a facility without error', ()=>{
    this.itemsense.facilities.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, {
      "facilities": [{
        "name": "400_floor11"
      }]
    });
    return expect(promise).to.eventually.be.fulfilled
    .then(
      () => {
        return getResult(
          this.itemsense.facilities.update.calledOnce,
          "Facilites called incorrect number of times."
        );
      }
    )
  });

  it('should load multiple facilities without error.', ()=>{
    this.itemsense.facilities.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let config = {
      "facilities": [{
        "name": "400_floor11"
      },
      {
        "name": "etsiTestFacility"
      },
      {
        "name": "RM-POC-Test"
      },
      {
        "name": "NedapTestStore2"
      }]
    };

    let promise = load(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
      .then(
        () => {
          return getResult(
            this.itemsense.facilities.update.callCount === 4,
            "facilities called incorrect number of times"
          );
        }
      )
  });

  it('should load a readerDefinition without error', ()=>{
    this.itemsense.readerDefinitions.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let data = {
      "name": "xarray-11-55-16",
      "agentIdentifier": null,
      "serialNumber": null,
      "address": "xarray-11-55-16.impinj.com",
      "type": "XARRAY",
      "connectionType": "LLRP",
      "placement": {
        "x": -9.14,
        "y": 5.22,
        "z": 2,
        "yaw": 90,
        "pitch": 0,
        "roll": 0,
        "floor": "1"
      },
      "facility": "IDL",
      "labels": null,
      "readerZone": "xarray115516",
      "antennaZones": null
    };
    let config = {
      "readerDefinitions": [data]
    };
    let promise = load(stubbedIS,config);

    return expect(promise).to.eventually.be.fulfilled
      .then(
        () => {
          return getResult(
            this.itemsense.readerDefinitions.update.calledWith(data)
            && this.itemsense.readerDefinitions.update.calledOnce,
            "readerDefinition called with incorrect args or incorrect number of times."
          );
        }
      );
  });

  it('should load multiple readerDefinitions without error', ()=>{
    this.itemsense.readerDefinitions.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let config = {
        "readerDefinitions": [{
          "name": "xarray-11-55-16",
          "agentIdentifier": null,
          "serialNumber": null,
          "address": "xarray-11-55-16.impinj.com",
          "type": "XARRAY",
          "connectionType": "LLRP",
          "placement": {
            "x": -9.14,
            "y": 5.22,
            "z": 2,
            "yaw": 90,
            "pitch": 0,
            "roll": 0,
            "floor": "1"
          },
          "facility": "IDL",
          "labels": null,
          "readerZone": "xarray115516",
          "antennaZones": null
        },
        {
          "name": "xarray-11-55-16",
          "agentIdentifier": null,
          "serialNumber": null,
          "address": "xarray-11-55-16.impinj.com",
          "type": "XARRAY",
          "connectionType": "LLRP",
          "placement": {
            "x": -9.14,
            "y": 5.22,
            "z": 2,
            "yaw": 90,
            "pitch": 0,
            "roll": 0,
            "floor": "1"
          },
          "facility": "IDL",
          "labels": null,
          "readerZone": "xarray115516",
          "antennaZones": null
        }]
      };
    let promise = load(stubbedIS, config);

    return expect(promise).to.eventually.be.fulfilled
      .then( () => {
        return getResult(this.itemsense.readerDefinitions.update.calledTwice);
      });
  });

  it('should load a readerConfiguration without error', ()=>{
    this.itemsense.readerConfigurations.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, {
      "readerConfigurations": [{
          "name": "Do_Nothing",
          "configuration": {
            "readerMode": "MAX_THROUGHPUT",
            "session": 0
          },
          "operation": "DO_NOTHING"
        }]
    });
    return expect(promise).to.eventually.be.fulfilled
      .then( () => {
        return getResult(this.itemsense.readerConfigurations.update.calledOnce);
      });
  });

  it('should load multiple readerConfigurations without error.', ()=>{
    this.itemsense.readerConfigurations.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    let config = {
      "readerConfigurations": [{
          "name": "Do_Nothing",
          "configuration": {
            "readerMode": "MAX_THROUGHPUT",
            "session": 0
          },
          "operation": "DO_NOTHING"
        },
        {
          "name": "SVL_SPEEDWAY",
          "configuration": {
            "readerMode": "MODE_1002",
            "session": 2,
            "searchMode": "DUAL_TARGET",
            "tagPopulationEstimate": 32,
            "transmitPowerInDbm": null,
            "polarization": null,
            "antennas": [
              1
            ],
            "filter": null,
            "channelConfig": null
          },
          "operation": "INVENTORY"
        },
        {
          "name": "xArrayRoomLevel",
          "configuration": {
            "readerMode": "MAX_MILLER",
            "session": 2,
            "filter": null,
            "disabledAntennas": []
          },
          "operation": "LOCATION"
        }
      ]
    };
    let promise = load(stubbedIS, config);
    
    return expect(promise).to.eventually.be.fulfilled
      .then(() => {
        return getResult(
          this.itemsense.readerConfigurations.update.callCount === 3
        );
      });
  });


    it('should load a recipes without error', ()=>{
      this.itemsense.recipes.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let data = {
        "name": "SVL_SPEEDWAY_ABSENT_TEST",
        "type": "INVENTORY",
        "readerConfigurationName": null,
        "tagHeartbeatMinutes": 5,
        "readerConfigurations": {
          "Speedway-11-41-cc": "SVL_SPEEDWAY_2"
        },
        "computeWindow": null,
        "reportingInterval": 5
      };
      let promise = load(stubbedIS, {
        "recipes": [data]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(
            this.itemsense.recipes.update.calledOnce
            && this.itemsense.recipes.update.calledWith(data)
          );
        });
    });

    it('it should load multiple recipes without error.', ()=>{
      this.itemsense.recipes.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let config = {
        "recipes": [    {
          "name": "SVL_SPEEDWAY_ABSENT_TEST",
          "type": "INVENTORY",
          "readerConfigurationName": null,
          "tagHeartbeatMinutes": 5,
          "readerConfigurations": {
            "Speedway-11-41-cc": "SVL_SPEEDWAY_2"
          },
          "computeWindow": null,
          "reportingInterval": 5
        },
        {
          "name": "IMPINJ_BasicLocation",
          "type": "LOCATION",
          "readerConfigurationName": "IMPINJ_LocationConfig",
          "tagHeartbeatMinutes": 5,
          "readerConfigurations": {},
          "minimumMovementInMeters": null,
          "locationUpdateIntervalInSeconds": null,
          "locationAggregationModel": null,
          "agentComputeWindow": null,
          "agentUpdateInterval": null,
          "combineInventoryReads": null,
          "computeWindow": null,
          "reportingInterval": 5
        }]
      };
      let promise = load(stubbedIS, config);
      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(
            this.itemsense.recipes.update.callCount === 2,
            "recipe update function called incorrect number of times"
          );
        });
    });

    it('should load a zoneMap without error', ()=>{
      this.itemsense.zoneMaps.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let data = {
          "name": "Mead",
          "floor": "12",
          "points": [
            {
              "x": 23.66,
              "y": 9,
              "z": 0
            },
            {
              "x": 29.9,
              "y": 9,
              "z": 0
            },
            {
              "x": 29.9,
              "y": 0.1,
              "z": 0
            },
            {
              "x": 23.64,
              "y": 0.1,
              "z": 0
            },
            {
              "x": 22.78,
              "y": 6.45,
              "z": 0
            }
          ]
        };
      let promise = load(stubbedIS, {
        "zoneMaps": [data]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() =>{
          return getResult(
            this.itemsense.zoneMaps.update.calledOnce,
            this.itemsense.zoneMaps.update.calledWith(data)
          );
        });
    });

    it('it should load multiple zoneMaps without error.', ()=>{
      this.itemsense.zoneMaps.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let config = {
        "zoneMaps": [        {
          "name": "Mead",
          "floor": "12",
          "points": [
            {
              "x": 23.66,
              "y": 9,
              "z": 0
            }
          ]
        },
        {
          "name": "Mead",
          "floor": "12",
          "points": [
            {
              "x": 23.66,
              "y": 9,
              "z": 0
            },
            {
              "x": 29.9,
              "y": 9,
              "z": 0
            },
            {
              "x": 29.9,
              "y": 0.1,
              "z": 0
            },
            {
              "x": 23.64,
              "y": 0.1,
              "z": 0
            },
            {
              "x": 22.78,
              "y": 6.45,
              "z": 0
            }
          ]
        }]
      };
      let promise = load(stubbedIS, config);
      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(this.itemsense.zoneMaps.update.callCount === 2);
        });
    });

    it('should load a user without error', ()=>{
      this.itemsense.users.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let data = {
        "name": "analyst",
        "roles": [
          "DataReader"
        ]
      };
      let promise = load(stubbedIS, {
        "users": [data]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(
            this.itemsense.users.update.calledOnce
            && this.itemsense.users.update.calledWith(data)
          );
        });
    });

    it('it should load multiple users without error.', ()=>{
      this.itemsense.users.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let config = {
        "users": [    {
          "name": "Admin",
          "roles": [
            "Admin"
          ]
        },
        {
          "name": "analyst",
          "roles": [
            "DataReader"
          ]
        }]
      };
      let promise = load(stubbedIS, config);
      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(this.itemsense.users.update.callCount === 2);
        });
    });
});
