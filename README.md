# Finn

<p align="left">
  <img
  src="https://raw.githubusercontent.com/observing/finn/master/human.png"
  alt="Finn knows that writing CSS is hard."/>
</p>

[![Version npm][version]](http://browsenpm.org/package/finn)[![Build Status][build]](https://travis-ci.org/observing/finn)[![Dependencies][david]](https://david-dm.org/observing/finn)[![Coverage Status][cover]](https://coveralls.io/r/observing/finn?branch=master)

[version]: http://img.shields.io/npm/v/finn.svg?style=flat-square
[build]: http://img.shields.io/travis/observing/finn/master.svg?style=flat-square
[david]: https://img.shields.io/david/observing/finn.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/observing/finn/master.svg?style=flat-square

Finn is the CSS pre-process that [rework] should have been. It provides an
alternate and extendible interface for processing CSS and allows you to to add
plugins which apply to all files instead of one.

## Installation

The package is released in the public npm registry and can be installed using:

```
npm install --save finn
```

## Usage

In all examples we assume that you've already required and initialized your
`finn` instance:

```js
var Finn = require('finn')
  , finn = new Finn();

// or

var finn = require('finn')();
```

### finn.use

Add a new plugin/middleware/processor. This method accepts 3 arguments:

1. `name`, Name of the middleware layer so we can easily remove it again if
   needed. If no name is provided we attempt to extract it from the supplied
   function. So if you have `function foobar() {}` as middleware we will use
   `foobar` as name.
2. `fn`, Function which should be executed every. 
3. `opts`, Optional object which allows you to further configure the middleware
   handling. The following options are currently supported:
   - **at** Specify the index or name where this layer should be added at. If a
   name is supplied we will resolve it back to the it's current index.

When you add a new middleware layer it will always be added as last item unless
you've specified the `at` option.

```js
finn.use('foo', function (ast, finn) {
  console.log('arg', ast, 'foo');
}).use('bar', function (ast, finn, next) {
  console.log('arg', arg, 'bar');
  next();
});
```

In the example above you can see that we support async and sync execution of the
middleware. Your async middleware layer needs 3 arguments where the last argument is the callback function.

The supplied middleware layers are also able to stop the execution of the rest
of the middleware layers. In async mode you can supply the truthy value as second
argument to the callback:

```js
finn.use(function example(ast, finn, next) {
  next(undefined, true);
});
```

If you have a sync function you can just return true:

```js
supply.use(function example(ast) {
  return true;
});
```

Error handling also build in. The async middleware layers can just call the
supplied callback with an error as first argument while the sync layers can just
throw errors as they are wrapped in a `try {} catch (e) {}` statement.

### finn.remove

Remove a middleware layer from the stack based on the name. The method will
return a boolean as indication if the layer was found and removed successfully.

```js
finn.use('variables', require('rework-variables'));
finn.remove('variables');
```

### finn.before

Same as the `use` method, but it automatically sets the `at` option to `0` so it
will be inserted at the beginning of the stack instead of the end. It also
accepts all the same arguments, except for the `at` option as that will
forcefully be overridden.

```js
finn.before('xxx', function yyy() {});
```

### finn.render

### finn.sourcemap

This method is used internally to append the sourcemap to the compiled CSS code.
But it can be overridden with your own implementation once you
[extend](#extending) finn. The method accepts 2 arguments:

1. The data object which contains the `map` and `code`.
2. Completion callback which follows an error first callback pattern.

```js
finn.sourcemap(function (data) {
    fs.writeFile('/path/name.map', finn.transform.fromObject(data.map, function (err) {
      data.code += '\n/*# sourceMappingURL=/path/on/server/name.map */'
      fn(err, data);
    });
});
```

### finn.destroy

Destroy the finn instance and release / clear all of it's middleware layers. The
method will return a boolean as indication of successful clean up.

```js
finn.destroy();
```

### finn.transform

This is a reference to the `convert-source-map` module that we use internally.
You can use this when you're implementing your own sourcemap module as seen in
the [extending](#extending) section below.

### finn.stringify

Reference to the `css.stringify` method. This can easily be swapped out by
different parsers as long as they follow the same AST internals so you don't
lose interop with existing `rework` modules. 

### finn.parse

Same as above, but then the `parse` method.

## Extending

The `Finn` contructor exposes a `.extend` method which allows you to create a
new class which is based upon finn and override it's prototype methods. This can
be useful if you wish to use your own custom source mapping functionality. 

```js
var fs = require('fs');

var jake = Finn.extend({
  constructor: Finn,
  sourcemap: function map(data, fn) {
    fs.writeFile('/path/name.map', this.transform.fromObject(data.map, function (err) {
      data.code += '\n/*# sourceMappingURL=/path/on/server/name.map */'
      fn(err, data);
    });
  }
});

// jake().use(require('rework-npm')).render(css);
```

## License

MIT

[rework]: https://github.com/reworkcss/rework
