const removeConfig = require('../is-tool-lib').remove;
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
    stubbedIS[category].delete.returns(Promise.resolve());
  });
}

describe('When deleting configuration from itemsense, it', () => {
  before(()=>{
    const itemsenseConfig = {
      "username": "admin",
      "password": "admindefault",
      "itemsenseUrl": `http://127.0.0.1/itemsense`
    };
    this.itemsense = new Itemsense(itemsenseConfig);
    this.itemsense.facilities.delete = sinon.stub(this.itemsense.facilities, "delete");
    this.itemsense.readerDefinitions.delete = sinon.stub(this.itemsense.readerDefinitions, "delete");
    this.itemsense.readerConfigurations.delete = sinon.stub(this.itemsense.readerConfigurations, "delete");
    this.itemsense.recipes.delete = sinon.stub(this.itemsense.recipes, "delete");
    this.itemsense.zoneMaps.delete = sinon.stub(this.itemsense.zoneMaps, "delete");
    this.itemsense.users.delete = sinon.stub(this.itemsense.users, "delete");
  });

  after(()=>{
    this.itemsense.facilities.delete.restore();
    this.itemsense.readerDefinitions.delete.restore();
    this.itemsense.readerConfigurations.delete.restore();
    this.itemsense.recipes.delete.restore();
    this.itemsense.zoneMaps.delete.restore();
    this.itemsense.users.delete.restore();

  });

  afterEach(()=>{
    this.itemsense.facilities.delete.reset();
    this.itemsense.readerDefinitions.delete.reset();
    this.itemsense.readerConfigurations.delete.reset();
    this.itemsense.recipes.delete.reset();
    this.itemsense.zoneMaps.delete.reset();
    this.itemsense.users.delete.reset();
  });

  it('should return a rejected promise when null itemsense connection is passed', () => {
    let promise = removeConfig(null);
    return expect(promise).to.eventually.be.rejectedWith('itemsense object is null');
  });

  it('should return a rejected promise when null config object is passed', () => {
    let promise = removeConfig(this.itemsense, null);
    return expect(promise).to.eventually.be.rejectedWith('config object is null');
  });

  it('should call delete on each config item', ()=>{
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

    let promise = removeConfig(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        stubbedIS.facilities.delete.calledTwice
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
          "name": 'IDL'
        },
        {
          "name": 'Test1'
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

    let promise = removeConfig(stubbedIS, config);
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
    setReturns(config, stubbedIS);
    let promise = removeConfig(stubbedIS, config );
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        !stubbedIS.users.delete.called
        && !stubbedIS.facilities.delete.called
      )
    });
  });



});
