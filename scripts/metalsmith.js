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
let sitemap       = require('metalsmith-sitemap');
let metallic      = require('metalsmith-metallic');
let publish       = require('metalsmith-publish');
let robots        = require('metalsmith-robots');
let path          = require('path');
let sane          = require('sane');
let debounce      = require('throttle-debounce/debounce');
let config        = require('../config.json');
let logger        = require('./logger.js');
let rootDir       = process.cwd();
let devMode       = 'watcher'; // browserSync, watcher
let verbose       = false;

function generateGravatarAuthors(authors) {
  let gravatarAuthors = {};

  for (var [authorName, authorObject] of Object.entries(authors)) {
      gravatarAuthors[authorName] = authorObject.email;
  }
  return gravatarAuthors;
}

function metalsmith(dev, name, destinationPath, publishConfig, useBrowserSync) {
  return new Promise((resolve, reject) => {
    let compiler = Metalsmith(rootDir)
      .metadata(config.metadata)
      .source(config.dir.source)
      .destination(destinationPath)
      .clean(true)
      .use(publish(publishConfig))
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
      .use(sitemap({
        hostname: config.metadata.url,
        output: config.metadata.sitemap,
      }))
      .use(robots({
        allow: '*',
        sitemap: config.metadata.url + config.metadata.sitemap
      }))
      .use(author({ // make sure it comes after collections
        collection: 'posts',
        authors: config.authors
      }))
      .use(gravatar(generateGravatarAuthors(config.authors)))
      .use(layouts({
        engine: 'handlebars'
      }));

    if(dev && devMode === 'browserSync' && useBrowserSync) {
      compiler.use(browserSync({
        server : destinationPath,
        files  : '**/*.html'
      }));
    }

    compiler.build((err, files) => {
      if(verbose) {
        console.log(files);
      }
      if (err) {
        logger.error(`Metalsmith ${name} [ERROR]`);
        reject(err); 
      } else {
        logger.success(`Metalsmith ${name} [SUCCESS]`);
        resolve();
      }
    });
  });
}

function published(dev) {
  return metalsmith(dev, 'published', config.dir.destination, {});
}

function drafts(dev) {
  return metalsmith(dev, 'drafts', config.dir.drafts, {draft: true}, true);
}

function build(dev) {
  return Promise.all([
    published(dev),
    drafts(dev)
    ]);
}

function watch(dev) {
    let watcherContent = sane(path.resolve(rootDir, config.dir.source), {glob: '**/*.md'});
    let watcherLayout = sane(path.resolve(rootDir, config.dir.layouts), {glob: '**/*.html'});
    let debounced = debounce(300, build.bind(this, dev));

    watcherContent.on('change', debounced);
    watcherContent.on('add', debounced);
    watcherContent.on('delete', debounced);
    watcherLayout.on('change', debounced);
    watcherLayout.on('add', debounced);
    watcherLayout.on('delete', debounced);
}

module.exports = {
  build: build,
  watch: watch
};
