let config = require('../config.json');
let path   = require('path');
let rimraf = require('rimraf');
let logger = require('./logger.js');

let temp = path.resolve(config.paths.temp);

function clearTemp() {
  return new Promise((resolve, reject) => {
    rimraf(temp, () => {
      logger.success(`Cleaning [SUCCESS]`);
      resolve();
    });
  });
}

module.exports = clearTemp;
