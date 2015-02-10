'use strict';

var Command, CommandError;

Command = function(nameMap) {
  if (!(this instanceof Command)) {
    return new Command(nameMap);
  }
  this.nameMap = nameMap;
  this.validSubCommand = ['create', 'update', 'delete', 'list', 'help'];
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

Command.prototype._help = function() {
  return 'Command help: \n' +
    '`list`: List all of your irc name mapping your slack name \n' +
    '`create <arg1>`: Add irc name <arg1> to map \n' +
    '`delete <arg1>`: Remove irc name <arg1> from map \n' +
    '`update <arg1> <arg2>`: Change irc name <arg1> to <arg2> on map \n';
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
      message = 'Add `' + this.args[0] + '` to your irc-name-map.';
      break;
    case 'update':
      message = 'Update `' + this.args[0] + '` to `' + this.args[1] + '`' +
                'on your irc-name-map';
      break;
    case 'delete':
      message = 'Remove `' + this.args[0] + '` from your irc-name-map.';
      break;
    case 'list':
      message = 'List: `' + this._list(this.args).join('`, `') + '`';
      break;
    case 'help':
    default:
      message =  this._help();
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
