let config      = require('./config.json');
let logger      = require('./scripts/logger.js');
let metalsmith  = require('./scripts/metalsmith.js');
let dev         = true;

function build() {
  logger.blockStart('Build started');
  return Promise.all([
  metalsmith.build()
  ]).then(() => {
    logger.blockEnd('Build finished');
  });
}

function watch() {
  metalsmith.watch();
  logger.blockStart('Watchers started');
}


if(dev) {
  build().then(watch);
} else {
  build();
}
