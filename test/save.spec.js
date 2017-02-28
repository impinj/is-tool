const save = require('../lib/save');
const sinon = require('sinon');
const Itemsense = require('itemsense-node');
const fs = require('fs')
const path = require('path')

function getResult(clause, failMessage){
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

function loadFile(filename){
  return new Promise(function(resolve, reject){
    fs.readFile(filename, 'utf8', (err,data)=>{
      if(err) return reject(err)
      resolve(JSON.parse(data));
    });
  });
}

describe('When saving ItemSense configuration, ', () => {
  before(()=>{
    const itemsenseConfig = {
      "username": "admin",
      "password": "admindefault",
      "itemsenseUrl": `http://127.0.0.1/itemsense`
    };
    this.itemsense = new Itemsense(itemsenseConfig);
    this.itemsense.facilities.getAll = sinon.stub(this.itemsense.facilities, "getAll")
    this.itemsense.readerDefinitions.getAll = sinon.stub(this.itemsense.readerDefinitions, "getAll")
    this.itemsense.readerConfigurations.getAll = sinon.stub(this.itemsense.readerConfigurations, "getAll")
    this.itemsense.recipes.getAll = sinon.stub(this.itemsense.recipes, "getAll")
    this.itemsense.zoneMaps.getAll = sinon.stub(this.itemsense.zoneMaps, "getAll")
    this.itemsense.users.getAll = sinon.stub(this.itemsense.users, "getAll")
  });

  after(()=>{
    this.itemsense.facilities.getAll.restore();
    this.itemsense.readerDefinitions.getAll.restore();
    this.itemsense.readerConfigurations.getAll.restore();
    this.itemsense.recipes.getAll.restore();
    this.itemsense.zoneMaps.getAll.restore();
    this.itemsense.users.getAll.restore();
  });
  afterEach(()=>{
    if(fs.existsSync("./testfile.json")) fs.unlinkSync("./testfile.json");
    this.itemsense.facilities.getAll.callCount = 0;
    this.itemsense.recipes.getAll.callCount = 0;
    this.itemsense.readerDefinitions.getAll.callCount = 0;
    this.itemsense.readerConfigurations.getAll.callCount = 0;
    this.itemsense.zoneMaps.getAll.callCount = 0;
    this.itemsense.users.getAll.callCount = 0;
  })

  it('should error if the passed itemsense object is null', ()=>{
    let promise = save(null);
    return expect(promise).to.eventually.be.rejected
      && expect(promise).to.be.rejectedWith('itemsense object is null');
  });

  it('should report error when get request fails', ()=>{
    this.itemsense.facilities.getAll.returns(Promise.resolve({}));
    this.itemsense.recipes.getAll.returns(Promise.reject());
    let stubbedIS = this.itemsense;
    let promise = save(stubbedIS);
    return expect(promise).to.eventually.be.rejected
      && this.itemsense.facilities.getAll.calledOnce
      && this.itemsense.recipes.getAll.calledOnce;
  });


  it('should write file with recipe and facility content when get request succeeds', ()=>{
    const facilites = [{
      "name": "400_floor11"
    }];

    const recipes = [{
      "name": "TestName",
      "type": "LOCATION",
      "readerConfigurationName": null,
      "tagHeartbeatMinutes": 5,
      "readerConfigurations": {
        "xArray-Tillicum": "IMPINJ_LocationConfig_2",
        "xArray-InterviewArea": "IMPINJ_LocationConfig_2",
        "xArray-Mead": "IMPINJ_LocationConfig_2",
        "xArray-Rainier": "IMPINJ_LocationConfig_2"
      },
      "minimumMovementInMeters": 0.2,
      "locationUpdateIntervalInSeconds": 5,
      "computeWindow": 20,
      "reportingInterval": 5
    }];

    const config = {
      facilities: facilites,
      recipes: recipes
    };

    this.itemsense.facilities.getAll.returns(Promise.resolve(facilites));
    this.itemsense.recipes.getAll.returns(Promise.resolve(recipes));
    let stubbedIS = this.itemsense;
    let promise = save(stubbedIS, "./testfile.json");

    return expect(promise).to.eventually.be.fulfilled
    .then(
      () => loadFile(path.resolve(__dirname,"..","testfile.json"))
    )
    .then(
      (contents) => {
        return getResult(
          this.itemsense.facilities.getAll.calledOnce
          && this.itemsense.recipes.getAll.calledOnce
          && expect(path.resolve(__dirname,"..","testfile.json")).to.be.a.file()
          && expect(contents).to.eql(config),
          "functions called incorrect amount of times."
        );
      });
  });


  it('should write file with content when get request succeeds', ()=>{
    const readerConfigurations  = [{
      "name": "SVL_SPEEDWAY_2",
      "configuration": {
        "readerMode": "MODE_1002",
        "session": 2,
        "searchMode": "DUAL_TARGET",
        "tagPopulationEstimate": 32,
        "transmitPowerInDbm": null,
        "polarization": null,
        "antennas": [
          1,
          4
        ],
        "filter": null,
        "channelConfig": null
      },
      "operation": "INVENTORY"
    }];
    const readerDefinitions = [{
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
    }];
    const zoneMaps = [{
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
    }];
    const users = [
      {
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
      }
    ];

    const config = {
      readerConfigurations: readerConfigurations,
      readerDefinitions: readerDefinitions,
      zoneMaps: zoneMaps,
      users: users
    };

    this.itemsense.readerDefinitions.getAll.returns(Promise.resolve(readerDefinitions));
    this.itemsense.readerConfigurations.getAll.returns(Promise.resolve(readerConfigurations));
    this.itemsense.zoneMaps.getAll.returns(Promise.resolve(zoneMaps));
    this.itemsense.users.getAll.returns(Promise.resolve(users));
    this.itemsense.facilities.getAll.returns(Promise.resolve());
    this.itemsense.recipes.getAll.returns(Promise.resolve());
    let stubbedIS = this.itemsense;
    let promise = save(stubbedIS, "./testfile.json");

    return expect(promise).to.eventually.be.fulfilled
    .then(
      () => loadFile(path.resolve(__dirname,"..","testfile.json"))
    )
    .then(
      (contents) => {
        return getResult(
          this.itemsense.readerDefinitions.getAll.calledOnce
          && this.itemsense.readerConfigurations.getAll.calledOnce
          && this.itemsense.zoneMaps.getAll.calledOnce
          && this.itemsense.users.getAll.calledOnce
          && expect(path.resolve(__dirname,"..","testfile.json")).to.be.a.file()
          && expect(contents).to.eql(config),
          "functions called incorrect amount of times or with incorrect content"
        );
      });
  });
});
