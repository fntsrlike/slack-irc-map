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
  this.args = text.split(' ');
  this.subCommand = this.args[0];
  this.args.shift();

  if (this.validSubCommand.indexOf(this.subCommand) === -1) {
    throw new CommandError('InvalidSubCommand');
  }

  this['_' + this.subCommand](this.args);
};

Command.prototype.getSubCommand = function() {
  return this.subCommand;
};

Command.prototype.getArgs = function() {
  return this.args;
};

Command.prototype.getResponse = function() {
  var message;

  switch (this.getSubCommand()) {
    case 'create':
      message = 'You CREATE a irc name "' + this.args[0] + '"" mapping!';
      break;
    case 'update':
      message = 'You UPDATE irc name mapping from "' +
                this.args[0] + '" to "' + this.args[1] + '"!';
      break;
    case 'delete':
      message = 'You DELETE a irc name "' + this.args[0] + '"" mapping!';
      break;
    case 'list':
      message = 'Your IRC Nick LIST: ' + this._list(this.args).join(', ');
      break;
    default:
      message = 'undefined';
      break;
  }

  return message;
};

CommandError = function(message) {
  this.name = 'CommandError';
  this.message = (message || '');
};

CommandError.prototype = new Error();
CommandError.prototype.constructor = CommandError;

module.exports = Command;
