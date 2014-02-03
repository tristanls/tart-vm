/*

index.js - "tart-vm": Tart behavior sandbox

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

var nodeVm = require('vm');

var vm = module.exports;

/*
  * `message`: _Object_
    * `fail`: _Actor_ Fail actor to respond to if errors occur.
    * `ok`: _Actor_ Ok actor to respond to with sandboxed actor behaviors.
    * `module`: _String_ Node.js module that exports behaviors that should be
        sandboxed. The behaviors will be sent to `ok` actor as a map of
        name-behavior pairs, or a single behavior.
*/
vm.sandboxBeh = function sandboxBeh(message) {
    if (!message) {
        return; // nothing to do
    }

    if (!message.ok) {
        message.fail instanceof Function && message.fail(
            new Error("Missing 'ok'."));
        return;
    }

    if (!message.module) {
        message.fail instanceof Function && message.fail(
            new Error("Missing 'module'."));
        return;
    }

    var sandbox = {
        module: {}
    };
    nodeVm.runInNewContext(message.module, sandbox);

    if (!sandbox.module.exports && sandbox.exports) {
        sandbox.module.exports = sandbox.exports;
    }

    if (typeof sandbox.module.exports === 'function') {
        // only one sandboxed actor behavior
        message.ok(sandbox.module.exports);
        return;
    }

    if (typeof sandbox.module.exports === 'object') {
        // multiple sandboxed actor behaviors
        var response = {};
        Object.keys(sandbox.module.exports).forEach(function (behName) {
            response[behName] = sandbox.module.exports[behName];
        });
        message.ok(response);
        return;
    }
};