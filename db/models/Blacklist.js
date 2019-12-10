// Access Token
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const blacklistPrototype = {
  jti: String,
  expireAt: {
    type: Date,
    default: Date.now() + 7 * 60 * 1000
  }
};

const BlacklistSchema = new Schema(blacklistPrototype);
model('Blacklist', BlacklistSchema);
