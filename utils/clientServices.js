const mongoose = require('mongoose');
const Client = mongoose.model('Client');

const getClientDetails = async (clientAPIKey) => {
  try {
    const doc = await Client.findOne({ apiKey: clientAPIKey });
    if (doc) {
      return doc;
    }
  } catch (e) {
    throw new Error('There is something during fetching data from mongodb serve');
  }
};

module.exports = {
  getClientDetails
};
