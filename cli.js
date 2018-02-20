#!/usr/bin/env node
require('source-map-support').install();
process.on('unhandledRejection', err => {
  process.stderr.write(err.stack);
  process.exit(1);
});
require = require("@std/esm")(module);
require('./dst');