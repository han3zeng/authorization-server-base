const mongoose = require('mongoose');
const Blacklist = mongoose.model('Blacklist');
const jwt = require('jsonwebtoken');
const { getCredentials } = require('../utils');
const { ACCESS_TOKEN } = getCredentials();

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

const verifyToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN);
  } catch (e) {
    return null;
  }
};

const ifExistInBlacklist = async (jti) => {
  const res = await Blacklist.findOne({ jti });
  if (res) {
    return true;
  }
  return false;
};

const validation = async (authorizationHeader) => {
  let status = null;
  let errorMessage = null;
  let ok = false;
  const accessToken = authorizationHeader && authorizationHeader.split(' ')[1];
  const decodedInfo = accessToken && verifyToken(accessToken);
  const { jti } = accessToken && decodedInfo ? decodedInfo : {};
  if (!authorizationHeader) {
    status = 401;
    errorMessage = 'Unauthorized. the Authorizatoin header has not been set';
  } else if (!accessToken) {
    status = 401;
    errorMessage = 'Unauthorized. the accessToken in Authorizatoin header is missing.';
  } else if (!decodedInfo) {
    status = 403;
    errorMessage = 'Forbidden. the accessToken is not valid based on the signature';
  } else if (!jti) {
    status = 403;
    errorMessage = 'Forbidden. the jti is missing in payload of jwt';
  } else if (jti) {
    const res = await ifExistInBlacklist(jti);
    if (res) {
      status = 403;
      errorMessage = 'Forbidden. the accessToken is not valid since it has been blocked';
    } else {
      ok = true;
    }
  } else {
    ok = true;
  }

  return Object.freeze({
    ok,
    status,
    errorMessage,
    decodedInfo
  });
};

module.exports = {
  checkIfTokenInBlacklist,
  addTokenToBlacklist,
  validation
};
