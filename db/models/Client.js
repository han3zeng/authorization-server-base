const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const clientPrototype = {
  service: String,
  organization: String,
  apiKey: String,
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
};

const ClientSchema = new Schema(clientPrototype);
model('Client', ClientSchema);
