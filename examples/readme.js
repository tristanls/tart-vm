/*

readme.js - example from the README

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
