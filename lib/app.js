'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  url = require('url'),
  Command = require('./command'),
  NameMap = require('./name-map');

var App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = _.defaults(config, {
    fileName: './map.json',
    token: '',
    port: 80
  });

  this.nameMap = NameMap(this.config.fileName);
  this.command = Command(this.nameMap);
  this.validSubCommand = ['create', 'update', 'delete', 'list'];
};

App.prototype._server = function() {
  var server = http.createServer(function(req, res) {
    if (req.method === 'GET') {
      this._getHandler(req, res);
    } else if (req.method === 'POST') {
      this._postHandler(req, res);
    } else {
      res.end('Error! InvalidMethod');
    }
  }.bind(this));

  return server;
};

App.prototype._getHandler = function(req, res) {
  try {
    var token = url.parse(req.url, true).query.token;

    if (token !== this.config.token) {
      throw 'InvalidToken';
    }
    res.end(JSON.stringify(this.nameMap.getMap()));
  } catch(e) {
    res.end('Error! ' + e);
  }
};

App.prototype._postHandler = function(req, res) {
  req.on('data', function(data) {
    try {
      var
      payload = this._payloadHandler(querystring.parse(data.toString())),
      action = '_' + payload.subCommand;

      this.nameMap.setSlackName(payload.user_name);
      this.command[action](payload.args);
      res.end('done');
    } catch(e) {
      res.end('Error! ' + e);
    }
  }.bind(this));
};

App.prototype._payloadHandler = function(payload) {
  payload = _.defaults(payload, {
    token: '',
    user_name: '',
    text: ''
  });

  payload.args = payload.text.split(' ');
  payload.subCommand = payload.args[0];
  payload.args.shift();

  if (_.isEmpty(payload.user_name)) {
    throw 'EmptyUsername';
  } else if (payload.token !== this.config.token) {
    throw 'InvalidToken';
  } else if (payload.command !== '/ircname') {
    throw 'InvalidCommand';
  } else if (this.validSubCommand.indexOf(payload.subCommand) === -1) {
    throw 'InvalidSubCommand';
  }

  return payload;
};

App.prototype.listen = function() {
  this._server().listen(this.config.port);
  console.log('Server running at ' +
               'http://localhost:' + this.config.port + '/');
};

module.exports = App;
