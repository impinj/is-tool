const clear = require('../is-tool-lib').clear;
const Itemsense = require('itemsense-node');
const helpers = require('./helpers/help-functions');

function getResult(clause, failMessage){
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

function setReturns(config, stubbedIS, keys) {
  keys.forEach((key) => {
    stubbedIS[key].getAll.returns(Promise.resolve(config[key]));
    stubbedIS[key].delete.returns(Promise.resolve());
  });
}

describe('When clearing configuration from itemsense, it', () => {
  before(() => {
    const itemsenseConfig = {
      username: 'admin',
      password: 'admindefault',
      itemsenseUrl: 'http://127.0.0.1:8000/itemsense',
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
    this.itemsense = helpers.setupISStubs(this.itemsense, this.keys, 'delete');
  });

  after(() => {
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'getAll');
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'delete');
  });

  afterEach(() => {
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'getAll');
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'delete');
  });

  it('should return a rejected promise when null itemsense connection is passed', () => {
    let promise = clear(null);
    return expect(promise).to.eventually.be.rejectedWith('itemsense object is null');
  });

  it('should call no delete functions when get function returns no config data', () => {
    const stubbedIS = this.itemsense;
    const config = {
      facilities: [],
      zoneMaps: [],
      readerDefinitions: [],
      antennaConfigurations: [],
      thresholds: [],
      readerConfigurations: [],
      users: [],
      recipes: [],
    };
    setReturns(config, stubbedIS, this.keys);
    let promise = clear(stubbedIS);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        stubbedIS.facilities.getAll.calledOnce
        && stubbedIS.recipes.getAll.calledOnce
        && stubbedIS.readerDefinitions.getAll.calledOnce
        && stubbedIS.readerConfigurations.getAll.calledOnce
        && stubbedIS.zoneMaps.getAll.calledOnce
        && stubbedIS.users.getAll.calledOnce
        && !stubbedIS.facilities.delete.called
        && !stubbedIS.readerDefinitions.delete.called
        && !stubbedIS.readerConfigurations.delete.called
        && !stubbedIS.zoneMaps.delete.called
        && !stubbedIS.users.delete.called
        && !stubbedIS.recipes.delete.called
      )
    });
  });

  it('should call delete on each config item returned', ()=>{
    const stubbedIS = this.itemsense;
    const config = {
      facilities: [
        {
          name: 'IDL'
        },
        {
          name: 'Test1'
        }
      ],
      zoneMaps: [],
      readerDefinitions: [],
      readerConfigurations: [{
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
      }],
      users: [],
      recipes: []
    };
    setReturns(config, stubbedIS, this.keys);

    let promise = clear(stubbedIS);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        stubbedIS.facilities.getAll.calledOnce
        && stubbedIS.recipes.getAll.calledOnce
        && stubbedIS.readerDefinitions.getAll.calledOnce
        && stubbedIS.readerConfigurations.getAll.calledOnce
        && stubbedIS.zoneMaps.getAll.calledOnce
        && stubbedIS.users.getAll.calledOnce
        && stubbedIS.facilities.delete.calledTwice
        && !stubbedIS.readerDefinitions.delete.called
        && stubbedIS.readerConfigurations.delete.calledOnce
        && !stubbedIS.zoneMaps.delete.called
        && !stubbedIS.users.delete.called
        && !stubbedIS.recipes.delete.called

      )
    });
  });

  it('should return a failed promise when the call to itemsense returns an error', ()=>{
    const stubbedIS = this.itemsense;
    const config = {
      facilities: [
        {
          name: 'IDL'
        },
        {
          name: 'Test1'
        }
      ],
      zoneMaps: [],
      readerDefinitions: [],
      readerConfigurations: [{
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
      }],
      users: [],
      recipes: []
    };
    setReturns(config, stubbedIS, this.keys);
    stubbedIS.readerConfigurations.delete.returns(Promise.reject('test rejection'));

    let promise = clear(stubbedIS);
    return expect(promise).to.eventually.be.rejected
    && expect(promise).to.eventually.be.rejectedWith('test rejection');s
  });

  it('should not remove Admin nor ReaderAgent user nor DEFAULT facility', () =>{
    const stubbedIS = this.itemsense;
    const config =  {
      users: [
        {
          "name": "Admin",
          "roles": [
            "Admin"
          ]
        },
        {
          "name": "ReaderAgent",
          "roles": [
            "ReaderAgent"
          ]
        }
      ],
      facilities: [
        { "name" : "DEFAULT"}
      ]
    };
    setReturns(config, stubbedIS, this.keys);
    let promise = clear(stubbedIS);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        !stubbedIS.users.delete.called &&
        !stubbedIS.facilities.delete.called
      )
    });
  });
});
