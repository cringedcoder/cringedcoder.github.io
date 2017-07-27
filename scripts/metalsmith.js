let Metalsmith    = require('metalsmith');
let markdown      = require('metalsmith-markdown');
let layouts       = require('metalsmith-layouts');
let permalinks    = require('metalsmith-permalinks');
let collections   = require('metalsmith-collections');
let debug         = require('metalsmith-debug');
let writemetadata = require('metalsmith-writemetadata');
let author        = require('metalsmith-author');
let navigation    = require('metalsmith-navigation');
let sane          = require('sane');
let debounce      = require('throttle-debounce/debounce');
let config        = require('../config.json');
let logger        = require('./logger.js');
let rootDir       = process.cwd();

function metalsmith() {
  return new Promise((resolve, reject) => {
    Metalsmith(rootDir)
      .metadata(config.metadata)
      .source(config.dir.source)
      .destination(config.dir.destination)
      .clean(true)
      .use(markdown())
      .use(navigation())
      .use(collections({
        posts: {
          sortBy: 'date',
          reverse: true,
          limit: 10,
          metadata: config['metadata-posts']
        }
      }))
      .use(author({ // make sure it comes after collections
        collection: 'posts',
        authors: config.authors
      }))
      .use(layouts({
        engine: 'handlebars'
      }))
      .build((err, files) => {
        console.log(files);
        if (err) {
          logger.error('Metalsmith [ERROR]');
          reject(err); 
        } else {
          logger.success('Metalsmith [SUCCESS]');
          resolve();
        }
      });
  });
}

function watch() {
  let watcherContent = sane(config.dir.source, {glob: ['**/*.md']});
  let watcherLayouts = sane(config.dir.layouts, {glob: ['**/*.html']});

  let debounced = debounce(300, metalsmith);

  watcherContent.on('change', debounced);
  watcherContent.on('add', debounced);
  watcherContent.on('delete', debounced);
  watcherLayouts.on('change', debounced);
  watcherLayouts.on('add', debounced);
  watcherLayouts.on('delete', debounced);
}

module.exports = {
  build: metalsmith,
  watch: watch
};
