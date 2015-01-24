'use strict';

var _ = require('underscore'),
  Fs = require('fs');

var NameMap = function(filename) {
  if (!(this instanceof NameMap)) {
    return new NameMap(filename);
  }

  this.filename = filename;
  this.map = {};

  this._checkFileExist();
  this._readMap();
};

NameMap.prototype._checkFileExist = function() {
  if (!Fs.existsSync(this.filename)) {
    this._writeMap();
  };
};

NameMap.prototype._readMap = function() {
  try {
    this.map = JSON.parse(Fs.readFileSync(this.filename, 'utf8'));
  } catch(e) {
    console.log('Map file formation is invalid!');
    process.exit();
  }
};

NameMap.prototype._writeMap = function() {
  var data = JSON.stringify(this.map, null, 2);
  Fs.writeFileSync(this.filename, data, 'utf8');
};

NameMap.prototype._checkPermission = function(ircName) {
  if ( this.map[ircName] !== this.slackName ) {
    throw 'UpdatePermissionDeny';
  }
};

NameMap.prototype._checkIrcNameUnique = function(ircName) {
  if (_.has(this.map, ircName)) {
    throw 'IrcNameExist';
  }
};

NameMap.prototype._checkIrcNameExist = function(ircName) {
  if (!_.has(this.map, ircName)) {
    throw 'IrcNameNotExist';
  }
};

NameMap.prototype.setSlackName = function(slackName) {
  this.slackName = slackName;
  return this;
};

NameMap.prototype.createIrcName = function(ircName) {
  this._checkIrcNameUnique(ircName);
  this.map[ircName] = this.slackName;
  this._writeMap();
};

NameMap.prototype.updateIrcName = function(oldIrcName, newIrcName) {
  this._checkIrcNameExist(oldIrcName);
  this._checkPermission(oldIrcName);
  this._checkIrcNameUnique(newIrcName);

  delete this.map[oldIrcName];
  this.map[newIrcName] = this.slackName;
  this._writeMap();
};

NameMap.prototype.deleteIrcName = function(ircName) {
  this._checkIrcNameExist(ircName);
  this._checkPermission(ircName);

  delete this.map[ircName];
  this._writeMap();
};

NameMap.prototype.getOwnList = function() {
  var list = [];
  _.each(this.map, function(slackName, ircName) {
    if (slackName === this.slackName) {
      list.push(ircName);
    }
  }.bind(this));

  return list;
};

NameMap.prototype.getMap = function() {
  return this.map;
};

module.exports = NameMap;
