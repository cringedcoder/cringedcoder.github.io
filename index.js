var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');

console.log('Started Metalsmith pipeline');

Metalsmith(__dirname)
  .metadata({
    title: "Cringed Coder Blog",
    description: "Cringed Coder's posts storage.",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./build')
  .clean(false)
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars'
  }))
  .build(function(err, files) {
    if (err) {
      throw err; 
    } else {
      console.log('Success');
    }
  });
