const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const userPrototype = {
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

const UserSchema = new Schema(userPrototype);
model('User', UserSchema);
