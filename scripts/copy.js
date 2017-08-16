let config = require('../config.json');
let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
let sane = require('sane');
let ncp    = require('ncp').ncp;
let rimraf = require('rimraf');
let debounce = require('throttle-debounce/debounce');
let logger = require('./logger.js');

let fontsSrc = path.resolve(config.paths.sources, config.dirs.fonts);
let fontsDest = path.resolve(config.paths.temp, config.dirs.fonts);
let imgSrc = path.resolve(config.paths.sources, config.dirs.img);
let imgDest = path.resolve(config.paths.temp, config.dirs.img);

ncp.limit = 16;

function copyFonts() {
    new Promise((resolve, reject) => {
        mkdirp(fontsDest, (err) => {
            if (err) {
                logger.error(`Copy fonts [ERROR]`);
                reject(err); 
            } else {
              ncp(fontsSrc, fontsDest, (err) => {
                  if (err) {
                      logger.error(`Copy fonts [ERROR]`);
                      reject(err); 
                  } else {
                      logger.success(`Copy fonts [SUCCESS]`);
                      resolve();
                  }
              });
            }
        });
    });
}

function copyImages() {
    new Promise((resolve, reject) => {
        mkdirp(imgDest, (err) => {
            if (err) {
                logger.error(`Copy images [ERROR]`);
                reject(err); 
            } else {
              ncp(imgSrc, imgDest, (err) => {
                  if (err) {
                      logger.error(`Copy images [ERROR]`);
                      reject(err); 
                  } else {
                      logger.success(`Copy images [SUCCESS]`);
                      resolve();
                  }
              });
            }
        });
    });
}

function build(dev) {
    return Promise.all([
        copyFonts(dev),
        copyImages(dev)
    ]);
}


function watch(dev, callback) {
    let watcherFonts = sane(fontsSrc, {glob: '**/*'});
    let debouncedFonts = debounce(300, () => {
      copyFonts(dev).then(callback);
    });

    let watcherImg = sane(imgSrc, {glob: '**/*'});
    let debouncedImg = debounce(300, () => {
      copyImages(dev).then(callback);
    });
    
    watcherFonts.on('change', debouncedFonts);
    watcherFonts.on('add', debouncedFonts);
    watcherFonts.on('delete', debouncedFonts);
    watcherImg.on('change', debouncedImg);
    watcherImg.on('add', debouncedImg);
    watcherImg.on('delete', debouncedImg);
}

module.exports = {
    build: build,
    watch: watch
};
