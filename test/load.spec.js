const load = require('../is-tool-lib').load;
const Itemsense = require('itemsense-node');

const helpers = require('./helpers/help-functions');

function getResult(clause, failMessage) {
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

describe('When loading an object, it', () => {
  before(() => {
    const itemsenseConfig = {
      username: 'admin',
      password: 'admindefault',
      itemsenseUrl: 'http://127.0.0.1/itemsense',
    };
    this.keys = [
      'facilities',
      'readerDefinitions',
      'readerConfigurations',
      'antennaConfigurations',
      'thresholds',
      'recipes',
      'zoneMaps',
      'users',
    ];
    this.itemsense = new Itemsense(itemsenseConfig);
    this.itemsense = helpers.setupISStubs(this.itemsense, this.keys, 'getAll');
    this.itemsense = helpers.setupISStubs(this.itemsense, this.keys, 'update');
    this.itemsense = helpers.setupISStubs(this.itemsense, this.keys, 'create');
    this.itemsense = helpers.setReturns(this.itemsense, this.keys, 'getAll', []);
  });

  after(() => {
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'getAll');
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'update');
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'create');
  });

  afterEach(() => {
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'getAll');
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'update');
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'create');
    this.itemsense = helpers.setReturns(this.itemsense, this.keys, 'getAll', []);
    this.itemsense = helpers.setReturns(this.itemsense, this.keys, 'create', []);
  });

  it('should not error if the conf object is empty', () => {
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, {});
    return expect(promise).to.eventually.be.fulfilled;
  });

  it('should not error if the conf object is a string', () => {
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, "{}");
    return expect(promise).to.eventually.be.fulfilled;
  });

  it('should error if the passed itemsense object is null', ()=>{
    let promise = load(null);
    return expect(promise).to.eventually.be.rejected
      && expect(promise).to.be.rejectedWith('itemsense object is null');
  });

  it('should error if the conf object is null', () => {
    let stubbedIS = this.itemsense;
    let promise = load(stubbedIS, null);
    return expect(promise).to.eventually.be.rejected
      && expect(promise).to.be.rejectedWith('Passed config object is null');
  });

  it('should create a facility without error', ()=>{
    this.itemsense.facilities.update.returns(Promise.resolve({}));
    let stubbedIS = this.itemsense;
    const data = {
      "facilities": [{
        "name": "400_floor11"
      }]
    };
    const promise = load(stubbedIS, {
      "facilities": [data]
    });
    return promise.then(
      () => {
        expect(this.itemsense.facilities.create.callCount).to.equal(1);
        expect(this.itemsense.facilities.create.getCall(0).args).to.deep.equal([data.name]);
      }
    );
  });

  it('should update a facility without error', () => {
    const config = {
      facilities: [{
        name: '400_floor11'
      }]
    };
    this.itemsense.facilities.getAll.returns(Promise.resolve(config.facilities));
    this.itemsense.facilities.update.returns(Promise.resolve({}));
    const promise = load(this.itemsense, config);
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

  it('should create multiple facilities without error.', ()=>{
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
        "name": "POC-Test"
      },
      {
        "name": "TestStore2"
      }]
    };

    let promise = load(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
      .then(
        () => {    
            expect(this.itemsense.facilities.create.callCount).to.equal(4);
        }
      )
  });

  it('should create a readerDefinition without error', () => {
    const data = {
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
      "facility": "test",
      "labels": null,
      "readerZone": "xarray115516",
      "antennaZones": null
    };
    const config = {
      "readerDefinitions": [data]
    };

    this.itemsense.readerDefinitions.update.returns(Promise.resolve({}));
    const promise = load(this.itemsense, config);

    return expect(promise).to.eventually.be.fulfilled
      .then(
        () => {
          data.agentIdentifier = data.name;
          expect(this.itemsense.readerDefinitions.create.args[0]).to.deep.equal([data]);
          expect(this.itemsense.readerDefinitions.create.callCount).to.equal(1);
        }
      );
  });

  it('should update a readerDefinition without error', () => {
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
      "facility": "test",
      "labels": null,
      "readerZone": "xarray115516",
      "antennaZones": null
    };
    let config = {
      "readerDefinitions": [data]
    };

    this.itemsense.readerDefinitions.update.returns(Promise.resolve({}));
    this.itemsense.readerDefinitions.getAll.returns(Promise.resolve([data]));

    const promise = load(stubbedIS, config);

    return expect(promise).to.eventually.be.fulfilled
      .then(
        () => {
          data.agentIdentifier = data.name;
          expect(this.itemsense.readerDefinitions.update.args[0]).to.deep.equal([data]);
          expect(this.itemsense.readerDefinitions.update.callCount).to.equal(1);
        }
      );
  });


  it('should create multiple readerDefinitions without error', ()=>{
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
        return getResult(this.itemsense.readerDefinitions.create.calledTwice);
      });
  });

  it('should create a readerConfiguration without error', ()=>{
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
        return getResult(this.itemsense.readerConfigurations.create.calledOnce);
      });
  });

  it('should update a readerConfiguration without error', ()=>{
    let stubbedIS = this.itemsense;
    const config = {
      "readerConfigurations": [{
          "name": "Do_Nothing",
          "configuration": {
            "readerMode": "MAX_THROUGHPUT",
            "session": 0
          },
          "operation": "DO_NOTHING"
        }]
    };
    let promise = load(stubbedIS, config);
    this.itemsense.readerConfigurations.update.returns(Promise.resolve({}));
    this.itemsense.readerConfigurations.getAll.returns(Promise.resolve(config.readerConfigurations));

    return expect(promise).to.eventually.be.fulfilled
      .then( () => {
        return getResult(this.itemsense.readerConfigurations.update.calledOnce,
        'update called incorrect number of times');
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
            "channelConfig": {
              channelIndex: 1,
              txFrequenciesInMhz: 123
            },
            "reportConfig": {}
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

    return promise
      .then(() => {
        expect(this.itemsense.readerConfigurations.create.callCount).to.equal(3);
        expect(this.itemsense.readerConfigurations.create.args[1]).deep.equal([config.readerConfigurations[1]])
        expect(
          this.itemsense.readerConfigurations.create.args[1][0]
        ).to.not.include({configuration: {reportConfig: {}}});
        expect(
          this.itemsense.readerConfigurations.create.args[1][0]
        ).to.not.include({configuration: {channelConfig: {channelIndex: 1}}});
      });
  });


    it('should create a recipe without error', ()=>{
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
            this.itemsense.recipes.create.calledOnce
            && this.itemsense.recipes.create.calledWith(data)
          );
        });
    });

    it('should update a recipe without error', () => {
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
      this.itemsense.recipes.update.returns(Promise.resolve({}));
      this.itemsense.recipes.getAll.returns(Promise.resolve([data]));

      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(
            this.itemsense.recipes.update.calledOnce
            && this.itemsense.recipes.update.calledWith(data)
          );
        });
    });

    it('should load multiple recipes without error.', ()=>{
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
            this.itemsense.recipes.create.callCount === 2,
            "recipe update function called incorrect number of times"
          );
        });
    });

    it('should create a zoneMap without error', ()=>{
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
          }
        ]
      };
      let zoneMap = {
          "name": "test",
          "facility": "DEFAULT",
          "zones": [data],
      }
      let promise = load(stubbedIS, {
        "zoneMaps": [zoneMap]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() =>{
          return getResult(
            this.itemsense.zoneMaps.create.calledOnce
            && this.itemsense.zoneMaps.create.calledWith(zoneMap)
          );
        });
    });

    it('should update a zoneMap without error', ()=>{
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
            }
          ]
        };
      let zoneMap = {
          "name": "test",
          "facility": "DEFAULT",
          "zones": [data],
      }
      let promise = load(stubbedIS, {
        "zoneMaps": [zoneMap]
      });
      this.itemsense.zoneMaps.update.returns(Promise.resolve({}));
      this.itemsense.zoneMaps.getAll.returns(Promise.resolve([zoneMap]));

      return expect(promise).to.eventually.be.fulfilled
        .then(() =>{
          return getResult(
            this.itemsense.zoneMaps.update.calledOnce
            && this.itemsense.zoneMaps.update.calledWith(zoneMap)
          );
        });
    });

    it('should create a zoneMap without error when z is null', ()=>{
      let stubbedIS = this.itemsense;
      const newPoints = [
        {
          "x": 23.66,
          "y": 9
        },
        {
          "x": 29.9,
          "y": 9
        }
      ];
      let data = {
          "name": "Mead",
          "floor": "12",
          "points": [
            {
              "x": 23.66,
              "y": 9,
              "z": null
            },
            {
              "x": 29.9,
              "y": 9,
              "z": null
            }
          ]
        };
      let zoneMap = {
          "name": "test",
          "facility": "DEFAULT",
          "zones": [data],
      }
      let promise = load(stubbedIS, {
        "zoneMaps": [ zoneMap ]
      });
      this.itemsense.zoneMaps.create.returns(Promise.resolve({}));
      this.itemsense.zoneMaps.getAll.returns(Promise.resolve([zoneMap]));
      zoneMap.zones[0].points = newPoints;
      return promise
      .then(() =>{
        expect(this.itemsense.zoneMaps.update.calledOnce).to.be.true;
        expect(this.itemsense.zoneMaps.update.getCall(0).args).to.deep.equal([zoneMap])            
      });

    });

    it('should update multiple zoneMaps without error.', ()=>{
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
            }
          ]
        };
      let zoneMap = {
          "name": "test",
          "facility": "DEFAULT",
          "zones": [data],
      }
      const config = {
        "zoneMaps": [ zoneMap, zoneMap ]
      };
      this.itemsense.zoneMaps.update.returns(Promise.resolve({}));
      this.itemsense.zoneMaps.getAll.returns(Promise.resolve(config.zoneMaps));

      let promise = load(stubbedIS, config);
      return promise
      .then(() => {
        expect(this.itemsense.zoneMaps.update.callCount).to.equal(2);
        expect(this.itemsense.zoneMaps.update.getCall(1).args).to.deep.equal([config.zoneMaps[1]]);
        expect(this.itemsense.zoneMaps.update.getCall(0).args).to.deep.equal([config.zoneMaps[0]]);
      });
    });

    it('should update multiple zoneMaps and remove z value on each.', ()=>{
      let stubbedIS = this.itemsense;
      const newPoints = [
        {
          "x": 23.66,
          "y": 9,
        },
        {
          "x": 29.9,
          "y": 9,
        }
      ];
      let data = {
          "name": "Mead",
          "floor": "12",
          "points": [
            {
              "x": 23.66,
              "y": 9,
              "z": null
            },
            {
              "x": 29.9,
              "y": 9,
              "z": null
            }
          ]
        };
      let zoneMap = {
          "name": "test",
          "facility": "DEFAULT",
          "zones": [data],
      }
      let zoneMap2 = {
        "name": "test1",
        "facility": "DEFAULT",
        "zones": [data],
      }
      const config = {
        "zoneMaps": [ zoneMap, zoneMap2 ]
      };
      this.itemsense.zoneMaps.update.returns(Promise.resolve({}));
      this.itemsense.zoneMaps.getAll.returns(Promise.resolve(config.zoneMaps));

      let promise = load(stubbedIS, config);
      config.zoneMaps[0].zones.points = newPoints;
      config.zoneMaps[1].zones.points = newPoints;
      return promise
      .then(() => {
        expect(this.itemsense.zoneMaps.update.callCount).to.equal(2);
        expect(this.itemsense.zoneMaps.update.getCall(1).args).to.deep.equal([config.zoneMaps[1]])                    
        expect(this.itemsense.zoneMaps.update.getCall(0).args).to.deep.equal([config.zoneMaps[0]])                    
      });
    });

    it('should create a user without error', ()=>{
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
            this.itemsense.users.create.calledOnce
            && this.itemsense.users.create.calledWith(data)
          );
        });
    });

    it('should update a user without error', ()=>{
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
      this.itemsense.users.update.returns(Promise.resolve({}));
      this.itemsense.users.getAll.returns(Promise.resolve([data]));

      return expect(promise).to.eventually.be.fulfilled
        .then(() => {
          return getResult(
            this.itemsense.users.update.calledOnce
            && this.itemsense.users.update.calledWith(data)
          );
        });
    });

    it('should create multiple users without error.', ()=>{
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
          return getResult(this.itemsense.users.create.callCount === 2);
        });
    });

    it('should create users with a default password', ()=>{
      this.itemsense.users.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let config = {
        "users": [    {
          "name": "Admin1",
          "roles": [
            "Admin"
          ]
        },
        {
          "name": "analyst1",
          "roles": [
            "DataReader"
          ]
        }]
      };
      let firstCallConfig =
        {
          "name": "Admin1",
          "roles": [
            "Admin"
          ],
          'password': 'default01'
        };
      let secondCallConfig =
        {
          name: 'analyst1',
          roles: [ 'DataReader' ],
          password: 'default01'
        };
      let promise = load(stubbedIS, config, null, true);
      return expect(promise).to.eventually.be.fulfilled
      .then(() => {
        expect(this.itemsense.users.create.getCall(1).args).to.deep.equal([secondCallConfig])
        expect(this.itemsense.users.create.callCount).to.equal(2);
      });
    });

    it('should not create users with a default password if user already exists', ()=>{
      this.itemsense.users.update.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let config = {
        "users": [    {
          "name": "Admin1",
          "roles": [
            "Admin"
          ]
        },
        {
          "name": "analyst1",
          "roles": [
            "DataReader"
          ]
        }]
      };
      let firstCallConfig =
        {
          "name": "Admin1",
          "roles": [
            "Admin"
          ],
        };
      let secondCallConfig =
        {
          name: 'analyst1',
          roles: [ 'DataReader' ],
        };
      this.itemsense.users.getAll.returns(Promise.resolve(config.users));
      let promise = load(stubbedIS, config, null, true);
      return expect(promise).to.eventually.be.fulfilled
      .then(() => {
        expect(this.itemsense.users.update.getCall(1).args).to.deep.equal([secondCallConfig])
        expect(this.itemsense.users.update.callCount).to.equal(2);
      });
    });

    it('should create a new AntennaConf without error', ()=>{
      this.itemsense.antennaConfigurations.create.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let data = {
        "name": "right-out-8-in-6",
        "side": "right",
        "out": [
          {
            "antennaId": 8
          }
        ],
        "in": [
          {
            "antennaId": 6
          }
        ]
      };
      let promise = load(stubbedIS, {
        "antennaConfigurations": [data]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() =>{
          return getResult(
            this.itemsense.antennaConfigurations.create.calledOnce
            && this.itemsense.antennaConfigurations.create.calledWith(data)
          );
        });
    });
    it('should update an AntennaConf without error', () => {
      let stubbedIS = this.itemsense;
      let data = {
        id: 1,
        name: "right-out-8-in-6",
        side: "right",
        out: [
          {
            antennaId: 8
          }
        ],
        in: [
          {
            "antennaId": 6
          }
        ]
      };
      const config = {
        "antennaConfigurations": [data]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.antennaConfigurations.update.returns(Promise.resolve({}));
      this.itemsense.antennaConfigurations.getAll.returns(Promise.resolve(config.antennaConfigurations));
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        expect(this.itemsense.antennaConfigurations.update.callCount).to.equal(1);
        expect(this.itemsense.antennaConfigurations.update.getCall(0).args).to.deep.equal([data.id, data]);
      });
    });

    it('should create a new threshold, converting antenna conf name to id', ()=>{
      let stubbedIS = this.itemsense;
      let config = {
        "antennaConfigurations": [{
          id: 1,
          name: "right-out-7-in-6",
          side: "right",
          out: [{ antennaId: 8 }],
          in: [{ antennaId: 6 }]
        },
        {
          id: 2,
          name: "left-out-8-in-6",
          side: "left",
          out: [{ antennaId: 8 }],
          in: [{ antennaId: 6 }]
        }],
        "thresholds": [{
          name: 'side by side 1',
          facility: "hello",
          readerArrangement: "SIDE_BY_SIDE",
          readers: {
            'xSpan-11-F0-0A': { antennaConfigurationId: "left-out-8-in-6" },
            'xSpan-11-F0-30': { antennaConfigurationId: "right-out-7-in-6" },
            'xSpan-11-EF-BB': { antennaConfigurationId: "left-out-8-in-6" },
            'xSpan-11-F0-1F': { antennaConfigurationId: "right-out-7-in-6" }
          }
        }]
      }
      const responses = [{
        id: 1,
        name: "right-out-7-in-6",
        side: "right",
        out: [{ antennaId: 8 }],
        in: [{ antennaId: 6 }]
      },
      {
        id: 2,
        name: "left-out-8-in-6",
        side: "left",
        out: [{ antennaId: 8 }],
        in: [{ antennaId: 6 }]
      }];


      this.itemsense.antennaConfigurations.create.onCall(0).returns(Promise.resolve(responses[0]));
      this.itemsense.antennaConfigurations.create.onCall(1).returns(Promise.resolve(responses[1]));
      this.itemsense.thresholds.create.returns(Promise.resolve({}));
      let promise = load(stubbedIS, config);
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        const readers = this.itemsense.thresholds.create.getCall(0).args[0].readers;
        expect(this.itemsense.thresholds.create.callCount).to.equal(1);
        expect(readers['xSpan-11-F0-0A']).to.deep.equal({antennaConfigurationId: 2});
        expect(readers['xSpan-11-F0-30']).to.deep.equal({antennaConfigurationId: 1});

      });
    });

    it('should update a threshold without error', () => {
      let stubbedIS = this.itemsense;
      let data = {
        id: 3,
        name: 'side by side 1',
        facility: "hello",
        readerArrangement: "SIDE_BY_SIDE",
        readers: {
          'xSpan-11-F0-0A': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-30': {
            antennaConfigurationId: "2"
          },
          'xSpan-11-EF-BB': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-1F': {
            antennaConfigurationId: "2"
          }
        }
      };
      const config = {
        thresholds: [data]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.thresholds.update.returns(Promise.resolve({}));
      this.itemsense.thresholds.getAll.returns(Promise.resolve(config.thresholds));
      return promise.then(() => {
        expect(this.itemsense.thresholds.update.callCount).to.equal(1);
        expect(this.itemsense.thresholds.update.getCall(0).args).to.deep.equal([data.id, data]);
      });
    });

    it('should update a threshold and add a new antenna conf', () => {
      let stubbedIS = this.itemsense;
      const config = {
        antennaConfigurations: [{
          name: "right-out-7-in-6",
          side: "right",
          out: [{ antennaId: 8 }],
          in: [{ antennaId: 6 }]
        }],
        thresholds: [{
          id: 3,
          name: 'side by side 1',
          facility: "hello",
          readerArrangement: "SIDE_BY_SIDE",
          readers: {
            'xSpan-11-F0-0A': {
              antennaConfigurationId: "1"
            },
            'xSpan-11-F0-30': {
              antennaConfigurationId: "2"
            },
            'xSpan-11-EF-BB': {
              antennaConfigurationId: "1"
            },
            'xSpan-11-F0-1F': {
              antennaConfigurationId: "2"
            }
          }
        }]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.thresholds.update.returns(Promise.resolve({}));
      this.itemsense.antennaConfigurations.create.returns(Promise.resolve({}));
      this.itemsense.thresholds.getAll.returns(Promise.resolve(config.thresholds));
      return promise
      .then(() =>{
        expect(this.itemsense.thresholds.update.callCount).to.equal(1);
        expect(this.itemsense.antennaConfigurations.create.callCount).to.equal(1);
        expect(
          this.itemsense.thresholds.update.getCall(0).args
        ).to.deep.equal([config.thresholds[0].id, config.thresholds[0]]);
      });
    });

    it ('should create new AntennaConf when not already present when config has id field', ()=>{
      this.itemsense.antennaConfigurations.create.returns(Promise.resolve({}));
      let stubbedIS = this.itemsense;
      let data = {
        id: 1,
        "name": "right-out-8-in-6",
        "side": "right",
        "out": [
          {
            "antennaId": 8
          }
        ],
        "in": [
          {
            "antennaId": 6
          }
        ]
      };
      let promise = load(stubbedIS, {
        "antennaConfigurations": [data]
      });
      return expect(promise).to.eventually.be.fulfilled
        .then(() =>{
          expect(this.itemsense.antennaConfigurations.create.callCount).to.equal(1);
          delete data.id
          expect(this.itemsense.antennaConfigurations.create.getCall(0).args).to.deep.equal([data]);
        });
    });

    it ('should create new AntennaConf when not already present and config has id field', ()=>{
      let stubbedIS = this.itemsense;
      let data = {
        id: 1,
        name: "right-out-8-in-6",
        side: "right",
        out: [{ "antennaId": 8 }],
        in: [{"antennaId": 6}]
      };
      let existingRecord = {
        id: 2,
        name: "right-out-8-in-6",
        side: "right"
      }
      this.itemsense.antennaConfigurations.getAll.returns(Promise.resolve([existingRecord]));      
      let promise = load(stubbedIS, {
        "antennaConfigurations": [data]
      });
      this.itemsense.antennaConfigurations.create.returns(Promise.resolve({}));
       return expect(promise).to.eventually.be.fulfilled
       .then(() =>{
          expect(this.itemsense.antennaConfigurations.update.callCount).to.equal(1);
          data.id = 2;
          expect(this.itemsense.antennaConfigurations.update.getCall(0).args).to.deep.equal([ 2, data]);
        })

    });

    it('should create new threshold when same name exists but not id', () => {
      let stubbedIS = this.itemsense;
      let data = {
        id: 3,
        name: 'side by side 1',
        facility: "hello",
        readerArrangement: "SIDE_BY_SIDE",
        readers: {
          'xSpan-11-F0-0A': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-30': {
            antennaConfigurationId: "2"
          },
          'xSpan-11-EF-BB': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-1F': {
            antennaConfigurationId: "2"
          }
        }
      };
      let existingRecord = {
        id: 4,
        name: 'side by side 1',
      };
      const config = {
        thresholds: [data]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.thresholds.update.returns(Promise.resolve({}));
      this.itemsense.thresholds.getAll.returns(Promise.resolve([existingRecord]));
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        expect(this.itemsense.thresholds.update.callCount).to.equal(1);
        data.id = 4;
        expect(this.itemsense.thresholds.update.getCall(0).args).to.deep.equal([4, data]);
      });
    });
    
    it('should update new threshold when loaded conf does not have ID, same name exists but not id', () => {
      let stubbedIS = this.itemsense;
      let data = {
        name: 'side by side 1',
        facility: "hello",
        readerArrangement: "SIDE_BY_SIDE",
        readers: {
          'xSpan-11-F0-0A': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-30': {
            antennaConfigurationId: "2"
          },
          'xSpan-11-EF-BB': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-1F': {
            antennaConfigurationId: "2"
          }
        }
      };
      let existingRecord = [{
        id: 4,
        name: 'side by side 1',
      }];
      const config = {
        thresholds: [data]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.thresholds.update.returns(Promise.resolve({}));
      this.itemsense.thresholds.getAll.returns(Promise.resolve(existingRecord));
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        expect(this.itemsense.thresholds.update.callCount).to.equal(1);
        data.id = 4;
        expect(this.itemsense.thresholds.update.getCall(0).args).to.deep.equal([ 4, data]);
      });
    });  

    it('should create a new threshold, converting antennaConfigurationId to anntennConf name', ()=>{
      let stubbedIS = this.itemsense;
      let config = {
        "antennaConfigurations": [{
          id: 1,
          name: "right-out-7-in-6",
          side: "right",
          out: [{ antennaId: 8 }],
          in: [{ antennaId: 6 }]
        },
        {
          id: 2,
          name: "left-out-8-in-6",
          side: "left",
          out: [{ antennaId: 8 }],
          in: [{ antennaId: 6 }]
        }],
        "thresholds": [{
          name: 'side by side 1',
          facility: "hello",
          readerArrangement: "SIDE_BY_SIDE",
          readers: {
            'xSpan-11-F0-0A': { antennaConfigurationId: "2" },
            'xSpan-11-F0-30': { antennaConfigurationId: "1" },
            'xSpan-11-EF-BB': { antennaConfigurationId: "2" },
            'xSpan-11-F0-1F': { antennaConfigurationId: "1" }
          }
        }]
      }

      const responses = [{
        id: 1,
        name: "right-out-7-in-6",
        side: "right",
        out: [{ antennaId: 8 }],
        in: [{ antennaId: 6 }]
      },
      {
        id: 2,
        name: "left-out-8-in-6",
        side: "left",
        out: [{ antennaId: 8 }],
        in: [{ antennaId: 6 }]
      }];
      this.itemsense.antennaConfigurations.create.onCall(0).returns(Promise.resolve(responses[0]));
      this.itemsense.antennaConfigurations.create.onCall(1).returns(Promise.resolve(responses[1]));
      this.itemsense.thresholds.create.returns(Promise.resolve({}));
      let promise = load(stubbedIS, config);
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        const readers = this.itemsense.thresholds.create.getCall(0).args[0].readers;
        expect(this.itemsense.thresholds.create.callCount).to.equal(1);
        expect(readers['xSpan-11-F0-0A']).to.deep.equal({antennaConfigurationId: 2});
        expect(readers['xSpan-11-F0-30']).to.deep.equal({antennaConfigurationId: 1});

      });
    });
    it('should create new threshold when loaded conf has ID, same id exists but different name', () => {
      let stubbedIS = this.itemsense;
      let data = {
        id: 4,
        name: 'side by side 1',
        facility: "hello",
        readerArrangement: "SIDE_BY_SIDE",
        readers: {
          'xSpan-11-F0-0A': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-30': {
            antennaConfigurationId: "2"
          },
          'xSpan-11-EF-BB': {
            antennaConfigurationId: "1"
          },
          'xSpan-11-F0-1F': {
            antennaConfigurationId: "2"
          }
        }
      };
      let existingRecord = [{
        id: 4,
        name: 'side by side 2',
      }];
      const config = {
        thresholds: [data]
      };
      let promise = load(stubbedIS, config);
      this.itemsense.thresholds.create.returns(Promise.resolve({}));
      this.itemsense.thresholds.getAll.returns(Promise.resolve(existingRecord));
      return expect(promise).to.eventually.be.fulfilled
      .then(() =>{
        expect(this.itemsense.thresholds.create.callCount).to.equal(1);
        delete data.id;
        expect(this.itemsense.thresholds.create.getCall(0).args).to.deep.equal([data]);
      });
    });
});
