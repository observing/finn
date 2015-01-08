'use strict';

var Supply = require('supply')
  , css = require('css');

/**
 * Finn: Helps you explore the dangerous worlds of CSS using pre-processing.
 *
 * @constructor
 * @api public
 */
var Finn = Supply.extend({
  constructor: Supply,

  /**
   * Compile the CSS from a string.
   *
   * @param {String} sheet The CSS style sheet that we need to compile.
   * @param {Object} options Optional configuration for the parse & stringify.
   * @param {Function} fn Completion callback.
   * @api public
   */
  render: function render(css, options, fn) {
    if ('function' === typeof options) {
      fn = options;
      options = {};
    }

    var finn = this
      , ast = finn.parse(css);

    finn.each(ast.stylesheet, finn, function transformed(err) {
      if (err) return fn(err);

      var data = finn.stringify(ast, options);

      if (options.sourcemap) return finn.sourcemap(data, fn);
      else fn(err, data);
    });

    return finn;
  },

  /**
   * Generate a source map from the generated CSS.
   *
   * @param {Object} data The compiled source.
   * @param {Function} fn Completion callback.
   * @api public
   */
  sourcemap: function sourcemap(data, fn) {
    var content = this.transform.fromObject(data.map).toBase64();

    data.code += '\n/*# sourceMappingURL=data:application/json;base64,'+ content +' */';
    fn(undefined, data);
  },

  /**
   * Expose the CSS parsers and source map utilities on the prototype so it can
   * be extended with different parsers easily when needed or re-used when we're
   * extended.
   *
   * @type {Function}
   * @private
   */
  transform: require('convert-source-map'),
  stringify: css.stringify,
  parse: css.parse
});

//
// Expose the compiler.
//
module.exports = Finn;
