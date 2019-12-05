const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { urlToObject } = require('../utils');
const { error } = require('../utils/responses');
const { ACCESS_TOKEN } = require('../constants/credentials');
const { ISSUER } = require('../constants/payload');

const expireAt = (isMillionSecs) => {
  return (dayInterval = 7) => {
    if (isMillionSecs) {
      return Date.now() + dayInterval * 24 * 60 * 60 * 1000;
    } else {
      return Date.now() + dayInterval * 24 * 60 * 60;
    }
  };
};

const checkIfUserExist = async (_id) => {
  const doc = await User.findOne({ _id });
  if (doc) {
    return doc;
  }
  return null;
};

const authorize = (app) => {
  app.get('/oauth/authorize', (req, res) => {
    const { client_id, response_type, state, redirect_url } = req.query;
    const { callerProtocol, callerDomain, callerPath, userId } = urlToObject(state);
    const doc = checkIfUserExist(userId);
    // TODO: The temporary authorizationurl should be set expiration date
    if (!doc) {
      return error({
        res,
        status: 500,
        errorMessage: 'The authorization url has expired. Please sign up again to get the authorization url.'
      });
    }
    const accessTokenPayload = {
      iss: ISSUER,
      aud: `${callerProtocol}://${callerDomain}/${callerPath}`,
      sub: `user_${userId}`,
      scope: 'undefined',
      iat: Math.floor(Date.now() / 1000),
      exp: expireAt(false)(7)
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN);
    res
      .cookie('access_token', accessToken, {
        expires: new Date(expireAt(true)(7)),
        httpOnly: true,
        domain: callerDomain
      })
      .redirect(307, redirect_url);
  });
};

module.exports = authorize;
