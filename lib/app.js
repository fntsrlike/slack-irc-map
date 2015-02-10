'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  url = require('url'),
  Command = require('./command'),
  NameMap = require('./name-map');

var App, PayloadError;

App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = _.defaults(config, {
    botName: 'Name Map Server',
    command: '/irc',
    fileName: './map.json',
    token: '',
    port: 80
  });

  this.nameMap = NameMap(this.config.fileName);
  this.command = Command(this.nameMap);

  this.nameMap.setMappigQuota(this.config.mappigQuota);
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
      throw new PayloadError('Invalid token! Please check your configure.');
    }
    res.end(JSON.stringify(this.nameMap.getMap()));
  } catch(e) {
    if (_.contains(['PayloadError', 'NameMapError'], e.name)) {
      res.end(e);
    } else {
      throw e;
    }
  }
};

App.prototype._postHandler = function(req, res) {
  req.on('data', function(data) {
    try {
      var payload = this._payloadHandler(querystring.parse(data.toString()));

      this.nameMap.setSlackName(payload.user_name);
      this.command.execute(payload.text);
      res.end(this.command.getResponse());
    } catch(e) {
      if (_.contains(['PayloadError', 'NameMapError', 'CommandError'], e.name)) {
        res.end(e);
      } else {
        throw e;
      }
    }
  }.bind(this));
};

App.prototype._payloadHandler = function(payload) {
  payload = _.defaults(payload, {
    token: '',
    user_name: '',
    text: ''
  });

  if (payload.command !== this.config.command) {
    throw new PayloadError('Invalid command! Please check your slash command interaction.');
  } else if (_.isEmpty(payload.user_name)) {
    throw new PayloadError('Empty username!');
  } else if (payload.token !== this.config.token) {
    throw new PayloadError('Invalid token! Please check your configure.');
  }

  return payload;
};

App.prototype.listen = function() {
  this._server().listen(this.config.port);
  console.log('Server running at ' +
               'http://localhost:' + this.config.port + '/');
};

PayloadError = function(message) {
  this.name = 'PayloadError';
  this.message = (message || '');
};

PayloadError.prototype = new Error();
PayloadError.prototype.constructor = PayloadError;

module.exports = App;
