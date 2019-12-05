const mongoose = require('mongoose');
const Blacklist = mongoose.model('Blacklist');

const checkIfTokenInBlacklist = async (accessToken) => {
  const doc = await Blacklist.findOne({ accessToken });
  if (doc) {
    return true;
  } else {
    return false;
  }
};

const addTokenToBlacklist = async (accessToken) => {
  try {
    const doc = await Blacklist.create({ accessToken });
    if (doc) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log('error: addTokenToBlacklist > accessTokens > utils');
    return false;
  }
};

module.exports = {
  checkIfTokenInBlacklist,
  addTokenToBlacklist
};
