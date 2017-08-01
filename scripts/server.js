
var connect     = require('connect');
var serveStatic = require('serve-static');
var extend      = require('extend');
let logger      = require('./logger.js');
let config      = require('../config.json');
let rootDir     = process.cwd() + '/';

let defaults = {
  port: config.server.port, // Set the server port. Defaults to 8080.
  host: config.server.host, // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: rootDir + config.dir.destination // Set root directory that's being served. Defaults to cwd.
};

class Server {
  constructor(options) {
    this.settings = extend({}, defaults, options);

    this.run();
  }

  run() {
    connect().use(serveStatic(this.settings.root)).listen(this.settings.port, () => {
        logger.success(`Server running on ${this.settings.port} [SUCCESS]`);
    });
  }
}

module.exports = {
  build: () => {new Server();}
};
