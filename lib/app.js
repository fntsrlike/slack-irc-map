'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  url = require('url'),
  Command = require('./command'),
  NameMap = require('./name-map'),
  SlackBot = require('./slackbot');

var App, PayloadError;

App = function(config) {
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
  this.slackBot = SlackBot(this.config);

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
      throw new PayloadError('InvalidToken');
    }
    res.end(JSON.stringify(this.nameMap.getMap()));
  } catch(e) {
    if (_.contains(['PayloadError', 'NameMapError'], e.name)) {
      res.end('Error! ' + e);
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
      this._response(payload);
      res.end('Done!');
    } catch(e) {
      if (e.name === 'CommandError') {
        var message = '"/ircname" command error! ' + e;
        this._errorResponse(payload, message);
        res.end(message);
      } else if (_.contains(['PayloadError', 'NameMapError'], e.name)) {
        res.end('Error! ' + e);
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

  if (payload.command !== '/ircname') {
    throw new PayloadError('InvalidCommand');
  } else if (_.isEmpty(payload.user_name)) {
    throw new PayloadError('EmptyUsername');
  } else if (payload.token !== this.config.token) {
    throw new PayloadError('InvalidToken');
  }

  return payload;
};

App.prototype._response = function(payload) {
  var
    action = '*IRC Nick Action*',
    message = action + '\n' + this.command.getResponse();

  this.slackBot.initMessage()
    .send('chat.postMessage', {
      channel: '@' + payload.user_name,
      username: 'nameMapServer',
      text: message
    });
};

App.prototype._errorResponse = function(payload, message) {
  this.slackBot.initMessage()
    .setAttachmentsFallback(message)
    .setAttachmentsColor('#D00000')
    .setAttachmentsFields('Command Error', message)
    .send('chat.postMessage', {
      channel: '@' + payload.user_name,
      username: 'nameMapServer'
    });
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
