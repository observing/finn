'use strict';

var destroy = require('demolish')
  , Supply = require('supply')
  , css = require('css');

/**
 * Finn: Helps you explore the dangerous worlds of CSS using pre-processing.
 *
 * @constructor
 * @api public
 */
var Finn = Supply.extend({
  constructor: function constr(context, options) {
    if (!this) return new Finn(context, options);

    //
    // Initialize supply.
    //
    Supply.prototype.constructor.apply(this, arguments);
  },

  /**
   * Initialize the Supply instance and add extra before and after hooks which
   * will:
   *
   * - pre: Before we pass the string in to the parser.
   * - post: After we've received a new string.
   *
   * @api private
   */
  initialize: function initialize() {
    this.post = new Supply(this);
    this.pre = new Supply(this);
  },

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

    var data = { css: css }
      , finn = this
      , ast;

    finn.pre.each(data, finn, function pre(err) {
      if (err) return fn(err);

      ast = finn.parse(data.css);

      finn.each(ast.stylesheet, finn, function transformed(err) {
        if (err) return fn(err);

        var result = finn.stringify(ast, options);
        data = {};

        if ('string' !== typeof result) {
          data.css = result.code;
          data.map = result.map;
        } else {
          data.css = result;
        }

        /**
         * Run the `after` hooks when everything is done.
         *
         * @param {Error} err Optional error.
         * @param {Object} data Data to process.
         * @api private
         */
        function after(err, data) {
          finn.post.each(data, finn, function afterall(err) {
            fn(err, data);
          });
        }

        if (options.sourcemap) return finn.sourcemap(data, after);
        else after(err, data);
      });
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

    data.css += '\n/*# sourceMappingURL=data:application/json;base64,'+ content +' */';
    fn(undefined, data);
  },

  /**
   * Completely destroy the Finn instance and release all references.
   *
   * @type {Function}
   * @returns {Boolean}
   * @api public
   */
  destroy: destroy('layers, providers, pre, post'),

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
