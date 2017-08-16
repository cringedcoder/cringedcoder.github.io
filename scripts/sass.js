let config = require('../config.json');
let sass = require('node-sass');
let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
let sane = require('sane');
let debounce = require('throttle-debounce/debounce');
let logger = require('./logger.js');

function build(dev) {
    return new Promise((resolve, reject) => {
        sass.render({
          file: path.resolve(config.paths.sources, config.dirs.sass, config.files.stylesSource)
        }, (err, result) => {
            if (err) {
                logger.error(`SASS [RROR]`);
                reject(err); 
            } else {
                //console.log();
                //console.log(result);
                mkdirp(path.resolve(__dirname, config.paths.root, config.paths.temp, config.dirs.css), function (err) {
                    if (err) {
                        logger.error(`SASS [RROR]`);
                        reject(err); 
                    } else {
                        fs.writeFile(path.resolve(__dirname, config.paths.root, config.paths.temp, config.dirs.css, config.files.stylesResults), result.css, (err) => {
                            if(err) {
                                logger.error(`SASS [RROR]`);
                                reject(err); 
                            } else {
                                logger.success(`SASS [SUCCESS]`);
                                resolve();
                            }
                        });
                    }
                });
            }
        });
    });
}


function watch(dev, callback) {
    let watcher = sane(path.resolve(config.paths.sources, config.dirs.sass), {glob: '**/*.scss'});
    let debounced = debounce(300, () => {
      build(dev).then(callback);
    });
    
    watcher.on('change', debounced);
    watcher.on('add', debounced);
    watcher.on('delete', debounced);
}

module.exports = {
    build: build,
    watch: watch
};
