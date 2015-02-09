'use strict';

var Command, CommandError;

Command = function(nameMap) {
  if (!(this instanceof Command)) {
    return new Command(nameMap);
  }
  this.nameMap = nameMap;
  this.validSubCommand = ['create', 'update', 'delete', 'list'];
};

Command.prototype._create = function(args) {
  if (args.length !== 1) {
    throw new CommandError('InvalidFormation');
  }
  var ircName = args[0];
  this.nameMap.createIrcName(ircName);
};

Command.prototype._update = function(args) {
  if (args.length !== 2) {
    throw new CommandError('InvalidFormation');
  }
  var oldIrcName = args[0];
  var newIrcName = args[1];
  this.nameMap.updateIrcName(oldIrcName, newIrcName);
};

Command.prototype._delete = function(args) {
  if (args.length !== 1) {
    throw new CommandError('InvalidFormation');
  }
  var ircName = args[0];
  this.nameMap.deleteIrcName(ircName);
};

Command.prototype._list = function() {
  var list = this.nameMap.getOwnList();
  return list;
};

Command.prototype.execute = function(text) {
  var args = text.split(' ');
  var subCommand = args[0];
  args.shift();

  if (this.validSubCommand.indexOf(subCommand) === -1) {
    throw new CommandError('InvalidSubCommand');
  }

  this['_' + subCommand](args);
};

CommandError = function(message) {
  this.name = 'CommandError';
  this.message = (message || '');
};

CommandError.prototype = new Error();
CommandError.prototype.constructor = CommandError;

module.exports = Command;
