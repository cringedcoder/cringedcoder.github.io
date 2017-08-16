let config      = require('./config.json');
let logger      = require('./scripts/logger.js');
let metalsmith  = require('./scripts/metalsmith.js');
let webpack     = require('./scripts/webpack.js');
let sass        = require('./scripts/sass.js');
let server      = require('./scripts/server.js');
let publish     = require('./scripts/publish.js');
let clearTemp   = require('./scripts/clearTemp.js');
let copy        = require('./scripts/copy.js');

let argv        = require('minimist')(process.argv);
let dev         = argv.dev || false;
let draft       = argv.draft || false;

function build() {
  logger.blockStart('Build started');
  return clearTemp().then(() => {
    return Promise.all([
      metalsmith.build(dev, draft),
      sass.build(dev),
      webpack.build(dev, config),
      copy.build(dev),
      server.build(dev)
    ])
  }).then(() => {
    return publish(dev);
  }).then(() => {
    logger.blockEnd('Build finished');
  })
}

function watch() {
  metalsmith.watch(dev, draft, publish);
  sass.watch(dev, publish);
  webpack.watch(dev, config, publish);
  copy.watch(dev, publish);
  logger.blockStart('Watchers started');
}

if(dev) {
  build().then(watch);
} else {
  build().then(process.exit);
}
