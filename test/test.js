/*

test.js - vm sandbox test

The MIT License (MIT)

Copyright (c) 2014 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var vm = require('../index.js');
var tart = require('tart-stepping');

var test = module.exports = {};

test['sandboxBeh should do nothing if no message'] = function (test) {
    test.expect(1);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox();
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should send "Missing \'module\'." error to \'fail\' if no message.module'] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var fail = sponsor(function failBeh(error) {
        test.ok(error instanceof Error);
        test.equal(error.message, "Missing 'module'.");
    });
    var ok = sponsor(function okBeh() {});
    sandbox({ok: ok, fail: fail});
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should send "Missing \'ok\'." error to \'fail\' if no message.ok'] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var fail = sponsor(function failBeh(error) {
        test.ok(error instanceof Error);
        test.equal(error.message, "Missing 'ok'.");
    });
    sandbox({fail: fail, module: ''});
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should respond with behavior if module.exports is a behavior'] = function (test) {
    test.expect(2);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var ok = sponsor(function okBeh(behavior) {
        var fooBeh = this.sponsor(behavior);
        fooBeh(behTest);
    });
    var behTest = sponsor(function behTestBeh(foo) {
        test.equal(foo, 'foo');
    });
    var moduleString = [
      'module.exports = function fooBeh(customer) {',
      '    customer("foo");',
      '};'
    ].join('\n');
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should respond with name-behavior map if module.exports is an object'] = function (test) {
    test.expect(5);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var ok = sponsor(function okBeh(behaviors) {
        test.ok(behaviors.fooBeh);
        test.ok(behaviors.barBeh);
        var fooBeh = this.sponsor(behaviors.fooBeh);
        var barBeh = this.sponsor(behaviors.barBeh);
        fooBeh(fooBehTest);
        barBeh(barBehTest);
    });
    var fooBehTest = sponsor(function fooBehTestBeh(foo) {
        test.equal(foo, 'foo');
    });
    var barBehTest = sponsor(function barBehTestBeh(bar) {
        test.equal(bar, 'bar');
    });
    var moduleString = [
      'var behaviors = module.exports = {};',
      'behaviors.fooBeh = function fooBeh(customer) {',
      '    customer("foo");',
      '};',
      'behaviors.barBeh = function barBeh(customer) {',
      '    customer("bar");',
      '};'
    ].join('\n');
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should respond with behavior if exports is a behavior'] = function (test) {
    test.expect(2);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var ok = sponsor(function okBeh(behavior) {
        var fooBeh = this.sponsor(behavior);
        fooBeh(behTest);
    });
    var behTest = sponsor(function behTestBeh(foo) {
        test.equal(foo, 'foo');
    });
    var moduleString = [
      'exports = function fooBeh(customer) {',
      '    customer("foo");',
      '};'
    ].join('\n');
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop());
    test.done();
};

test['sandboxBeh should respond with name-behavior map if exports is an object'] = function (test) {
    test.expect(5);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var sandbox = sponsor(vm.sandboxBeh);
    var ok = sponsor(function okBeh(behaviors) {
        test.ok(behaviors.fooBeh);
        test.ok(behaviors.barBeh);
        var fooBeh = this.sponsor(behaviors.fooBeh);
        var barBeh = this.sponsor(behaviors.barBeh);
        fooBeh(fooBehTest);
        barBeh(barBehTest);
    });
    var fooBehTest = sponsor(function fooBehTestBeh(foo) {
        test.equal(foo, 'foo');
    });
    var barBehTest = sponsor(function barBehTestBeh(bar) {
        test.equal(bar, 'bar');
    });
    var moduleString = [
      'var behaviors = exports = {};',
      'behaviors.fooBeh = function fooBeh(customer) {',
      '    customer("foo");',
      '};',
      'behaviors.barBeh = function barBeh(customer) {',
      '    customer("bar");',
      '};'
    ].join('\n');
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop());
    test.done();
};

test["sandboxBeh can't use __dirname"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'var foo = __dirname;',
      'module.exports = function fooBeh(customer) {',
      '  customer(foo);',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, '__dirname is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use __filename"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'var foo = __filename;',
      'module.exports = function fooBeh(customer) {',
      '  customer(foo);',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, '__filename is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use clearInterval()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'clearInterval();',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'clearInterval is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use clearTimeout()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'clearTimeout();',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'clearTimeout is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use console"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'console.log("foo");',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'console is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use process"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'process.nextTick(function () {});',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'process is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use require()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'var http = require("http");',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'require is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use setImmediate()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'setImmediate(function () {});',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'setImmediate is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use setInterval()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'setInterval(function () {}, 1000);',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'setInterval is not defined');
    }}));
    test.done();
};

test["sandboxBeh can't use setTimeout()"] = function (test) {
    test.expect(3);
    var stepping = tart.stepping();
    var sponsor = stepping.sponsor;

    var ok = sponsor(function okBeh(behavior) {});
    var moduleString = [
      'setTimeout(function () {}, 1000);',
      'module.exports = function fooBeh(customer) {',
      '  customer("foo");',
      '};'
    ].join('\n');

    var sandbox = sponsor(vm.sandboxBeh);
    sandbox({ok: ok, module: moduleString});
    test.ok(stepping.eventLoop({fail: function (error) {
        test.ok(error);
        test.equal(error.message, 'setTimeout is not defined');
    }}));
    test.done();
};