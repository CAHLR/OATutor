#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2)
const { invokeJavaLocal } = require('./index')
console.log(invokeJavaLocal(args))