const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AccesslistPrototype = {
  userId: String,
  accessId: String,
  expireAt: {
    type: Date,
    default: Date.now() + 10 * 60 * 1000
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
};
const AcccesslistSchema = Schema(AccesslistPrototype);
model('Accesslist', AcccesslistSchema);
