'use strict';

var App = require('./lib/app');

var config = {
  fileName: './map.json',
  token: 'XXXXXXXXXXXXXXXXXXXXXXXX',
  incomeUrl: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  port: 80
};

App(config).listen();
