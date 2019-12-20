const mongoose = require('mongoose');
const Blacklist = mongoose.model('Blacklist');
const jwt = require('jsonwebtoken');
const { getCredentials } = require('../utils');
const { ISSUER } = require('../constants/payload');
const uuidv1 = require('uuid/v1');
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


// TODO: expiration
const tokenValidation = async (authorizationHeader) => {
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

const getExpireAt = (dayInterval = 7) => {
  return Date.now() + dayInterval * 24 * 60 * 60 * 1000;
};

const generateToken = ({
  callerProtocol,
  callerDomain,
  callerPath,
  sub,
  scope = 'undefined',
  expDaysInterval = 7
}) => {
  const expireAt = getExpireAt(expDaysInterval);
  const accessTokenPayload = {
    iss: ISSUER,
    aud: `${callerProtocol}://${callerDomain}/${callerPath}`,
    sub: sub,
    scope,
    iat: Math.floor(Date.now() / 1000),
    exp: expireAt / 1000,
    jti: uuidv1()
  };
  return jwt.sign(accessTokenPayload, ACCESS_TOKEN);
};

module.exports = {
  checkIfTokenInBlacklist,
  addTokenToBlacklist,
  tokenValidation,
  generateToken
};
