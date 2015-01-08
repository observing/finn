describe('Finn', function () {
  'use strict';

  var Finn = require('./')
    , assume = require('assume');

  it('is exported as a function', function () {
    assume(Finn).is.a('function');
  });
});
