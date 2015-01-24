'use strict';

var _ = require('underscore'),
  Fs = require('fs');

var Command = function() {
  if (!(this instanceof Command)) {
    return new Command(filename);
  }

};

module.exports = Command;
