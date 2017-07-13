const removeConfig = require('../is-tool-lib').remove;
const sinon = require('sinon');
const Itemsense = require('itemsense-node');

const helpers = require('./helpers/help-functions');

function getResult(clause, failMessage){
  return (clause ? Promise.resolve() : Promise.reject(new Error(failMessage)));
}

describe('When deleting configuration from itemsense, it', () => {
  before(() => {
    const itemsenseConfig = {
      username: 'admin',
      password: 'admindefault',
      itemsenseUrl: 'http://127.0.0.1/itemsense',
    };

    this.itemsense = new Itemsense(itemsenseConfig);
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
    this.itemsense = helpers.setupISStubs(this.itemsense, this.keys, 'delete');
  });

  after(() => {
    this.itemsense = helpers.restoreISStubs(this.itemsense, this.keys, 'delete');
  });

  afterEach(() => {
    this.itemsense = helpers.resetISStubs(this.itemsense, this.keys, 'delete');
  });

  it('should return a rejected promise when null itemsense connection is passed', () => {
    const promise = removeConfig(null);
    return expect(promise).to.eventually.be.rejectedWith('itemsense object is null');
  });

  it('should return a rejected promise when null config object is passed', () => {
    const promise = removeConfig(this.itemsense, null);
    return expect(promise).to.eventually.be.rejectedWith('config object is null');
  });

  it('should call delete on each config item', () => {
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
        name: 'SVL_SPEEDWAY_2',
        configuration: {
          readerMode: 'MODE_1002',
          session: 2,
          searchMode: 'DUAL_TARGET',
          tagPopulationEstimate: 32,
          transmitPowerInDbm: null,
          polarization: null,
          antennas: [
            1,
            4
          ],
          filter: null,
          channelConfig: null
        },
        operation: 'INVENTORY'
      }],
      users: [],
      recipes: []
    };

    let promise = removeConfig(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      expect(stubbedIS.readerConfigurations.delete.calledWith('SVL_SPEEDWAY_2')).to.be.true;
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

  it('should use the id as the delete key for threshold and antennConfigurations', ()=>{
    const stubbedIS = this.itemsense;
    const config = {
      antennaConfigurations: [
        {
          id: 58,
          name: '11-F0-0A-center',
          side: null,
          in: [
            {
              antennaId: 6
            },
            {
              antennaId: 8
            }
          ],
          out: [
            {
              antennaId: 7
            }
          ]
        }
      ],
      thresholds: [
        {
          id: 12,
          name: 2,
          facility: 'DEFAULT',
          readerArrangement: 'OVERHEAD',
          readers: {
            'xSpan-11-F0-0A': {
              antennaConfigurationId: 58
            }
          }
        }
      ]
    };

    const promise = removeConfig(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      expect(stubbedIS.antennaConfigurations.delete.callCount).to.equal(1);
      expect(stubbedIS.antennaConfigurations.delete.args[0]).to.deep.equal([58]);
      expect(stubbedIS.thresholds.delete.callCount).to.equal(1);
      return expect(stubbedIS.thresholds.delete.args[0]).to.deep.equal([12]);
    });
  });

  it('should return a failed promise when the call to itemsense returns an error', () => {
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
        name: 'SVL_SPEEDWAY_2',
        configuration: {
          readerMode: 'MODE_1002',
          session: 2,
          searchMode: 'DUAL_TARGET',
          tagPopulationEstimate: 32,
          transmitPowerInDbm: null,
          polarization: null,
          antennas: [1, 4],
          filter: null,
          channelConfig: null
        },
        operation: 'INVENTORY'
      }],
      users: [],
      recipes: []
    };

    stubbedIS.readerConfigurations.delete.returns(Promise.reject('test rejection'));

    let promise = removeConfig(stubbedIS, config);
    return expect(promise).to.eventually.be.rejected
    && expect(promise).to.eventually.be.rejectedWith('test rejection');
  });

  it('should not remove Admin nor ReaderAgent user nor DEFAULT facility', () =>{
    const stubbedIS = this.itemsense;
    const config =  {
      users: [
        {
          name: 'Admin',
          roles: [
            'Admin'
          ]
        },
        {
          name: 'ReaderAgent',
          roles: [
            'ReaderAgent'
          ]
        }
      ],
      facilities: [
        { name : 'DEFAULT'}
      ]
    };

    let promise = removeConfig(stubbedIS, config);
    return expect(promise).to.eventually.be.fulfilled
    .then(() => {
      return getResult(
        !stubbedIS.users.delete.called
        && !stubbedIS.facilities.delete.called
      )
    });
  });

});
