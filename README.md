# tart-vm

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/tart-vm.png)](http://npmjs.org/package/tart-vm)

[Tiny Actor Run-Time in JavaScript](https://github.com/organix/tartjs) behavior sandbox.

## Overview

Tart behavior sandbox.

  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
  * [Sources](#sources)

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var fs = require('fs');
var path = require('path');
var tart = require('tart');
var vm = require('../index.js');

var sponsor = tart.minimal();

var ok = sponsor(function okBeh(behavior) {
    var foo = this.sponsor(behavior);
    foo(this.self);
    this.behavior = function printMsg(message) {
        console.log('got message:', message);
    };
});
var ok2 = sponsor(function okBeh(behaviors) {
    var bar = this.sponsor(behaviors.barBeh);
    var baz = this.sponsor(behaviors.bazBeh);
    bar(this.self);
    baz(this.self);
    this.behavior = function printMsg(message) {
        console.log('got message:', message);
    };
});

var moduleString = fs.readFileSync(
        path.normalize(path.join(__dirname, 'module.js')));
var module2String = fs.readFileSync(
        path.normalize(path.join(__dirname, 'module2.js')));

var sandbox = sponsor(vm.sandboxBeh);

sandbox({ok: ok, module: moduleString});
sandbox({ok: ok2, module: module2String});

```

## Tests

    npm test

## Documentation

**Public API**

  * [vm.sandboxBeh](#vmsandboxbeh)

### vm.sandboxBeh

Actor behavior that will sandbox behaviors in the `module` and return them to `ok` actor.

Message format:

  * `fail`: _Actor_ `function (error) {}` Optional actor to receive any errors.
  * `module`: _String_ Module that exports behaviors using `module.exports` or `exports`.
  * `ok`: _Actor_ `function (response) {}` Actor to receive created sandboxed behaviors.

Module is a Node.js-like module, except that the only thing available in the global environment is `module` or `exports`. Any behavior should be attached to either `module.exports` or `exports`. If a single behavior (a function) is exported, that behavior will be sent to `ok` actor. If `module.exports` or `exports` is an object, each key of that object will be treated as a behavior name and the value of that key will be assumed to be a behavior.

For example, given following module:

```javascript
module.exports = function fooBeh(customer) {
    customer("foo");
};
```

`vm.sandboxBeh` will return `fooBeh` to `ok` actor.

Given following module:

```javascript
var behaviors = module.exports = {};
behaviors.foo = function fooBeh(customer) {
    customer("foo");
};
behaviors.bar = function barBeh(customer) {
    customer("bar");
};
```

`vm.sandboxBeh` will return an object to `ok` actor that is structured like:

```javascript
{
    foo: fooBeh,
    bar: barBeh
}
```

## Sources

  * [Tiny Actor Run-Time (JavaScript)](https://github.com/organix/tartjs)
