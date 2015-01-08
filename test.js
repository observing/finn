describe('Finn', function () {
  'use strict';

  var Finn = require('./')
    , assume = require('assume');

  it('is exported as a function', function () {
    assume(Finn).is.a('function');
  });

  it('can be constructed without new', function () {
    var finn = Finn();

    assume(finn).is.instanceOf(Finn);
    assume(finn.css).is.a('function');
  });
});
