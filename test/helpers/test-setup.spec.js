// test-setup.spec.js
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaifs = require('chai-fs');

chai.use(chaifs);
chai.use(chaiAsPromised);
chai.config.includeStack = true;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.cah = chai.assert;
