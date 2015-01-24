'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  url = require('url'),
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
      action = '_' + payload.subCommand + 'Action';

      this.nameMap.setSlackName(payload.user_name);
      this[action](payload.args);
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

App.prototype._createAction = function(args) {
  if (args.length !== 1) {
    throw 'InvalidFormation';
  }
  var ircName = args[0];
  this.nameMap.createIrcName(ircName);
};

App.prototype._updateAction = function(args) {
  if (args.length !== 2) {
    throw 'InvalidFormation';
  }
  var oldIrcName = args[0];
  var newIrcName = args[1];
  this.nameMap.updateIrcName(oldIrcName, newIrcName);
};

App.prototype._deleteAction = function(args) {
  if (args.length !== 1) {
    throw 'InvalidFormation';
  }
  var ircName = args[0];
  this.nameMap.deleteIrcName(ircName);
};

App.prototype._listAction = function(args) {
  if (args.length !== 0) {
    throw 'InvalidFormation';
  }
  var list = this.nameMap.getOwnList();
  return JSON.stringify(list);
};

App.prototype.listen = function() {
  this._server().listen(this.config.port);
  console.log('Server running at ' +
               'http://localhost:' + this.config.port + '/');
};

module.exports = App;
