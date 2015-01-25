'use strict';

var Command = function(nameMap) {
  if (!(this instanceof Command)) {
    return new Command(nameMap);
  }
  this.nameMap = nameMap;
};

Command.prototype._create = function(args) {
  if (args.length !== 1) {
    throw 'InvalidFormation';
  }
  var ircName = args[0];
  this.nameMap.createIrcName(ircName);
};

Command.prototype._update = function(args) {
  if (args.length !== 2) {
    throw 'InvalidFormation';
  }
  var oldIrcName = args[0];
  var newIrcName = args[1];
  this.nameMap.updateIrcName(oldIrcName, newIrcName);
};

Command.prototype._delete = function(args) {
  if (args.length !== 1) {
    throw 'InvalidFormation';
  }
  var ircName = args[0];
  this.nameMap.deleteIrcName(ircName);
};

Command.prototype._list = function(args) {
  if (args.length !== 0) {
    throw 'InvalidFormation';
  }
  var list = this.nameMap.getOwnList();
  return JSON.stringify(list);
};

module.exports = Command;
