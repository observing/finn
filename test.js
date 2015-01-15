/* istanbul ignore next */
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
    assume(finn.render).is.a('function');
  });

  describe('#render', function () {
    var css = '.foo { display: none }'
      , finn;

    beforeEach(function () {
      finn = new Finn();
    });

    afterEach(function () {
      finn.destroy();
    });

    it('renders the css output', function (next) {
      finn.render(css, function (err, data) {
        if (err) return next(err);

        assume(data).is.a('object');
        assume(data.css).is.a('string');

        next();
      });
    });

    it('includes a sourcemap', function (next) {
      finn.render(css, {
        source: 'finn.css',
        sourcemap: true
      }, function rendered(err, data) {
        if (err) return next(err);

        assume(data).is.a('object');
        assume(data.css).is.a('string');
        assume(data.css).includes('sourceMappingURL');
        assume(data.map).is.a('object');

        next();
      });
    });

    it('receives errors from the middleware', function (next) {
      finn.use(function (ast) {
        assume(ast).is.a('object');

        throw new Error('I should fail');
      });

      finn.render(css, function (err, data) {
        assume(data).is.undefined();
        assume(err.message).equals('I should fail');

        next();
      });
    });

    it('can add pre-processing', function (next) {
      next = assume.plan(5, next);

      finn
      .pre.use(function (data) {
        assume(data.css).equals('bar');
        data.css = 'foo';
      })
      .pre.use(function (data) {
        assume(data.css).equals('foo');
        data.css = css;
      });

      finn.render('bar', function (err, data) {
        if (err) return next(err);

        assume(data).is.a('object');
        assume(data.css).is.a('string');
        assume(data.css).contains('.foo');

        next();
      });
    });

    it('can add pos-processing', function (next) {
      next = assume.plan(4, next);

      finn
      .post.use(function (data) {
        assume(data.css).contains('.foo');
        data.css = 'foo';
        data.bar = 'bar';
      });

      finn.render(css, function (err, data) {
        if (err) return next(err);

        assume(data).is.a('object');
        assume(data.css).equals('foo');
        assume(data.bar).equals('bar');

        next();
      });
    });
  });
});
