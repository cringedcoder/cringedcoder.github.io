let config = require('../config.json');
let ncp    = require('ncp').ncp;
let path   = require('path');
let rimraf = require('rimraf');
let logger = require('./logger.js');

let temp = path.resolve(config.paths.temp);
let results = path.resolve(config.paths.results);

ncp.limit = 16;

function publish(dev) {
  return new Promise((resolve, reject) => {
    rimraf(results, () => {
      ncp(temp, results, (err) => {
       if (err) {
          logger.error(`Publish [ERROR]`);
          reject(err); 
       } else {
          logger.success(`Publish [SUCCESS]`);
          resolve();
       }
      });
    });
  });
}

module.exports = publish;
