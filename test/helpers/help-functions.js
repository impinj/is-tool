const sinon = require('sinon');

function setupISStubs(itemsense, keys, method) {
  /* eslint-disable no-param-reassign */
  keys.forEach((key) => {
    itemsense[key][method] = sinon.stub(itemsense[key], method);
  });
  return itemsense;
}

function restoreISStubs(itemsense, keys, method) {
  keys.forEach(key => itemsense[key][method].restore());
  return itemsense;
}

function resetISStubs(itemsense, keys, method) {
  keys.forEach(key => itemsense[key][method].reset());
  return itemsense;
}

function setReturns(itemsense, keys, method, returnValue) {
  keys.forEach(key => itemsense[key][method].returns(Promise.resolve(returnValue)));
  return itemsense;
}


module.exports = {
  setupISStubs,
  restoreISStubs,
  resetISStubs,
  setReturns
};
