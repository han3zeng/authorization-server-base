// Access Token
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const blacklistPrototype = {
  accessToken: String
};

const BlacklistSchema = new Schema(blacklistPrototype);
model('Blacklist', BlacklistSchema);
