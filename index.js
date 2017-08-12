let config      = require('./config.json');
let logger      = require('./scripts/logger.js');
let metalsmith  = require('./scripts/metalsmith.js');
let webpack     = require('./scripts/webpack.js');
let server      = require('./scripts/server.js');
let dev         = true;

function build() {
  logger.blockStart('Build started');
  return Promise.all([
    metalsmith.build(dev),
    webpack.build(dev, config),
    server.build(dev)
  ]).then(() => {
    logger.blockEnd('Build finished');
  });
}

function watch() {
  metalsmith.watch(dev);
  webpack.watch(dev, config);
  logger.blockStart('Watchers started');
}


if(dev) {
  build().then(watch);
} else {
  build();
}
