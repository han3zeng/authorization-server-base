const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Accesslist = mongoose.model('Accesslist');

const config = require('../config');
const { urlToObject, getCredentials } = require('../utils');
const { error } = require('../utils/responses');
const { ISSUER } = require('../constants/payload');
const uuidv1 = require('uuid/v1');

const { ACCESS_TOKEN } = getCredentials();
const { nodeEnvIsProd } = config;

const getExpireAt = (dayInterval = 7) => {
  return Date.now() + dayInterval * 24 * 60 * 60 * 1000;
};

const authorizeUser = async (_id) => {
  await User.updateOne({ _id }, { $set: { authorized: true } });
};

const checkIfUserAndAccessIdExist = async ({
  res,
  userId,
  attemptAccessId
}) => {
  const userDoc = await User.findOne({ _id: userId });
  const accessIdDoc = await Accesslist.findOne({ userId, accessId: attemptAccessId });
  let status = null;
  let errorMessage = null;
  if (!userDoc || !accessIdDoc) {
    status = 500;
    errorMessage = 'System error. the autho-server do not create the user or accessId properly.';
  } else {
    const { authorized } = userDoc;
    if (authorized) {
      status = 409;
      errorMessage = 'Data Conflict. The user has been authorized and confered the access token.';
    } else {
      const { expireAt } = accessIdDoc;
      try {
        if ((Date.parse(expireAt) >= Date.now())) {
          return {
            userDoc,
            accessIdDoc
          };
        }
        status = 401;
        errorMessage = 'Unauthorized. Your url has been expired. Please signup again to get a new eamil';
      } catch (e) {
        status = 500;
        errorMessage = 'System error. Date parse error';
      }
    }
  }
  error({
    res,
    status,
    errorMessage
  });
  return null;
};

const authorize = (app) => {
  app.get('/oauth/authorize', async (req, res) => {
    const { client_id, response_type, state, redirect_url, redirect_url_dev } = req.query;
    const { callerProtocol, callerDomain, callerPath, userId, accessId } = urlToObject(state);
    const doc = await checkIfUserAndAccessIdExist({
      res,
      userId,
      attemptAccessId: accessId
    });
    if (!doc) {
      return;
    }
    authorizeUser(userId);
    const expireAt = getExpireAt(7);
    const jti = uuidv1();
    const accessTokenPayload = {
      iss: ISSUER,
      aud: `${callerProtocol}://${callerDomain}/${callerPath}`,
      sub: `user_${userId}`,
      scope: 'undefined',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expireAt / 1000),
      jti
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN);
    const redirectUrl = nodeEnvIsProd ? redirect_url : redirect_url_dev;
    if (redirectUrl) {
      res
        .redirect(302, `${redirectUrl}?accessToken=${accessToken}`);
    } else {
      res
        .set('Authorization', `Bearer ${accessToken}`)
        .status(200)
        .end();
    }
  });
};

module.exports = authorize;
