'use strict';

var App = require('./lib/app');

var config = {
  fileName: './map.json',
  token: 'XXXXXXXXXXXXXXXXXXXXXXXX',
  port: 80
};

App(config).listen();
