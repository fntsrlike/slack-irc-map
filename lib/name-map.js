'use strict';

var _ = require('underscore'),
  Fs = require('fs');

var NameMap, NameMapError;

NameMap = function(filename) {
  if (!(this instanceof NameMap)) {
    return new NameMap(filename);
  }

  this.filename = filename;
  this.map = {};
  this.mapQuota = 0;

  this._checkFileExist();
  this._readMap();
};

NameMap.prototype._checkFileExist = function() {
  if (typeof this.filename === 'undefined') {
    console.log('Filename is undefined! Please check you configure.');
    process.exit();
  }
  if (!Fs.existsSync(this.filename)) {
    this._writeMap();
  }
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
  var owner = this.map[ircName];
  if ( owner !== this.slackName ) {
    throw new NameMapError('Update deny! This irc name is used by ' + owner + '.');
  }
};

NameMap.prototype._checkIrcNameUnique = function(ircName) {
  var owner = this.map[ircName];
  if (_.has(this.map, ircName)) {
    throw new NameMapError('Irc name exist! This irc name is used by ' + owner + '.');
  }
};

NameMap.prototype._checkIrcNameExist = function(ircName) {
  if (!_.has(this.map, ircName)) {
    throw new NameMapError('Irc name "' + ircName + '" not exist. Please check again.');
  }
};

NameMap.prototype._checkMappingQuota = function() {
  var slackNameList = _.values(this.map);
  var counter = _.countBy(slackNameList, function(slackName) {
    return slackName === this.slackName ? 'is': 'not';
  }.bind(this)).is;

  if (counter >= this.mapQuota ) {
    throw new NameMapError('Mapping quota is full. You hava ' + counter + ' names already.');
  }
};

NameMap.prototype.setSlackName = function(slackName) {
  this.slackName = slackName;
  return this;
};

NameMap.prototype.setMappigQuota = function(quota) {
  this.mapQuota = quota;
};

NameMap.prototype.createIrcName = function(ircName) {
  if (this.mapQuota > 0) {
    this._checkMappingQuota();
  }
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

NameMapError = function(message) {
  this.name = 'NameMapError';
  this.message = (message || '');
};

NameMapError.prototype = new Error();
NameMapError.prototype.constructor = NameMapError;

module.exports = NameMap;
