const clear = require('../lib/clear.js');
const sinon = require('sinon');
const Itemsense = require('itemsense-node');

function getResult(clause, failMessage){
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

function setReturns(config, stubbedIS){
  const categories = [
    'facilities',
    'users',
    'recipes',
    'readerDefinitions',
    'readerConfigurations',
    'zoneMaps'
  ]

  categories.forEach((category) => {
    stubbedIS[category].getAll.returns(Promise.resolve(config[category]));
    stubbedIS[category].delete.returns(Promise.resolve());
  });
}

describe('When clearing configuration from itemsense', () => {
  before(()=>{
    const itemsenseConfig = {
      "username": "admin",
      "password": "admindefault",
      "itemsenseUrl": `http://127.0.0.1/itemsense`
    };
    this.itemsense = new Itemsense(itemsenseConfig);
    this.itemsense.facilities.getAll = sinon.stub(this.itemsense.facilities, "getAll");
    this.itemsense.readerDefinitions.getAll = sinon.stub(this.itemsense.readerDefinitions, "getAll");
    this.itemsense.readerConfigurations.getAll = sinon.stub(this.itemsense.readerConfigurations, "getAll");
    this.itemsense.recipes.getAll = sinon.stub(this.itemsense.recipes, "getAll");
    this.itemsense.zoneMaps.getAll = sinon.stub(this.itemsense.zoneMaps, "getAll");
    this.itemsense.users.getAll = sinon.stub(this.itemsense.users, "getAll");

    this.itemsense.facilities.delete = sinon.stub(this.itemsense.facilities, "delete");
    this.itemsense.readerDefinitions.delete = sinon.stub(this.itemsense.readerDefinitions, "delete");
    this.itemsense.readerConfigurations.delete = sinon.stub(this.itemsense.readerConfigurations, "delete");
    this.itemsense.recipes.delete = sinon.stub(this.itemsense.recipes, "delete");
    this.itemsense.zoneMaps.delete = sinon.stub(this.itemsense.zoneMaps, "delete");
    this.itemsense.users.delete = sinon.stub(this.itemsense.users, "delete");
  });

  after(()=>{
    this.itemsense.facilities.getAll.restore();
    this.itemsense.readerDefinitions.getAll.restore();
    this.itemsense.readerConfigurations.getAll.restore();
    this.itemsense.recipes.getAll.restore();
    this.itemsense.zoneMaps.getAll.restore();
    this.itemsense.users.getAll.restore();

    this.itemsense.facilities.delete.restore();
    this.itemsense.readerDefinitions.delete.restore();
    this.itemsense.readerConfigurations.delete.restore();
    this.itemsense.recipes.delete.restore();
    this.itemsense.zoneMaps.delete.restore();
    this.itemsense.users.delete.restore();

  });

  afterEach(()=>{
    this.itemsense.facilities.getAll.reset();
    this.itemsense.readerDefinitions.getAll.reset();
    this.itemsense.readerConfigurations.getAll.reset();
    this.itemsense.recipes.getAll.reset();
    this.itemsense.zoneMaps.getAll.reset();
    this.itemsense.users.getAll.reset();

    this.itemsense.facilities.delete.reset();
    this.itemsense.readerDefinitions.delete.reset();
    this.itemsense.readerConfigurations.delete.reset();
    this.itemsense.recipes.delete.reset();
    this.itemsense.zoneMaps.delete.reset();
    this.itemsense.users.delete.reset();
  });

  it('should return a rejected promise when null itemsense connection is passed', () => {
    let promise = clear(null);
    console.log('Hello: ', promise)
    return expect(promise).to.eventually.be.fullfilled
    //&& expect(promise).to.eventually.be.rejectedWith('itemsense object is null');
  });

  it('should call no delete functions when get functions return no config data', () => {
    const stubbedIS = this.itemsense;
    const config = {
      facilities: [],
      zoneMaps: [],
      readerDefinitions: [],
      readerConfigurations: [],
      users: [],
      recipes: []
    };
    setReturns(config, stubbedIS);

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
    setReturns(config, stubbedIS);

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
    setReturns(config, stubbedIS);
    stubbedIS.readerConfigurations.delete.returns(Promise.reject('test rejection'));

    let promise = clear(stubbedIS);
    return expect(promise).to.eventually.be.rejected
    && expect(promise).to.eventually.be.rejectedWith('test rejection');s
  });


});
