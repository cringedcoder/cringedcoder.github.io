let Metalsmith    = require('metalsmith');
let markdown      = require('metalsmith-markdown');
let layouts       = require('metalsmith-layouts');
let permalinks    = require('metalsmith-permalinks');
let collections   = require('metalsmith-collections');
let debug         = require('metalsmith-debug');
let writemetadata = require('metalsmith-writemetadata');
let author        = require('metalsmith-author');
let browserSync   = require('metalsmith-browser-sync');
let date          = require('metalsmith-build-date');
let navigation    = require('metalsmith-navigation');
let feed          = require('metalsmith-feed');
let gravatar      = require('metalsmith-gravatar');
let sitemap       = require('metalsmith-mapsite');
let metallic      = require('metalsmith-metallic');
let sane          = require('sane');
let debounce      = require('throttle-debounce/debounce');
let config        = require('../config.json');
let logger        = require('./logger.js');
let rootDir       = process.cwd();
let watchGlobs    = [config.dir.source + '**/*.md', config.dir.layouts + '**/*.html'];
let devMode       = 'watcher'; // browserSync, watcher
let verbose       = false;


function metalsmith(dev) {
  return new Promise((resolve, reject) => {
    let compiler = Metalsmith(rootDir)
      .metadata(config.metadata)
      .source(config.dir.source)
      .destination(config.dir.destination)
      .clean(true)
      .use(date())
      .use(metallic())
      .use(markdown())
      .use(navigation())
      .use(collections({
        posts: {
          sortBy: 'date',
          reverse: true,
          metadata: config['metadata-posts']
        }
      }))
      .use(feed({
        collection: 'posts',
        site_url: config.metadata.url
      }))
      .use(sitemap(config.metadata.url))
      .use(author({ // make sure it comes after collections
        collection: 'posts',
        authors: config.authors
      }))
      .use(gravatar(generateGravatarAuthors(config.authors)))
      .use(layouts({
        engine: 'handlebars'
      }));

    if(dev && devMode === 'browserSync') {
      compiler.use(browserSync({
        server : config.dir.destination,
        files  : watchGlobs
      }));
    }

    compiler.build((err, files) => {
      if(verbose) {
        console.log(files);
      }
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

function generateGravatarAuthors(authors) {
  let gravatarAuthors = {};

  for (var [authorName, authorObject] of Object.entries(authors)) {
      gravatarAuthors[authorName] = authorObject.email;
  }
  return gravatarAuthors;
}

function watch(dev) {
  if(devMode === 'watcher') {
    let watcher = sane(rootDir, {glob: watchGlobs});
    let debounced = debounce(300, metalsmith.bind(this, dev));

    watcher.on('change', debounced);
    watcher.on('add', debounced);
    watcher.on('delete', debounced);
  }
}

module.exports = {
  build: metalsmith,
  watch: watch
};
