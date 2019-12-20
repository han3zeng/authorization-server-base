const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const clientPrototype = {
  service: String,
  organization: String,
  apiKey: String,
  redirectUrl: String,
  redirectUrlDev: String,
  origin: String,
  resourceServerOrigin: String,
  device: String,
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
};

const ClientSchema = new Schema(clientPrototype);
model('Client', ClientSchema);
