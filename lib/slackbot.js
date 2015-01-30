'use strict';

var _ = require('underscore'),
  request = require('request');

var SlackBot = function(config) {
  if (!(this instanceof SlackBot)) {
    return new SlackBot(config);
  }

  this.incomeUrl = config.incomeUrl;
  this.args = {
    unfurl_links: true,
    attachments: [{}]
  };
  return this;
};

SlackBot.prototype.setIconByUrl = function(url) {
  this.args.icon_url = url;
  return this;
};

SlackBot.prototype.setIconByEmoji= function(emojiCode) {
  this.args.icon_emoji = emojiCode;
  return this;
};

SlackBot.prototype.initMessage = function() {
  this.args.attachments = [{}];
  return this;
};

SlackBot.prototype.setAttachmentsFallback = function(text) {
  this.args.attachments[0].fallback = text;
  return this;
};

SlackBot.prototype.setAttachmentsPretext = function(text) {
  this.args.attachments[0].pretext = text;
  return this;
};

SlackBot.prototype.setAttachmentsColor = function(hex) {
  this.args.attachments[0].color = hex;
  return this;
};

SlackBot.prototype.setAttachmentsFields = function(title, value, isShort) {
  this.args.attachments[0].fields = [{
    'title': title || '',
    'value': value || '',
    'short': isShort || false
  }];
  return this;
};

SlackBot.prototype.send = function(method, args) {
  args = _.defaults(args, this.args);

  request.post({
    url: this.incomeUrl,
    json: true,
    form: { payload: JSON.stringify(args) }
  }, function(error, response, body) {
    if (error || body.error) {
      throw 'Error:' + error || body.error;
    }
  });
};

module.exports = SlackBot;
