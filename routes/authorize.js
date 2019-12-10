const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Accesslist = mongoose.model('Accesslist');
const Blacklist = mongoose.model('Blacklist');

const { urlToObject, getCredentials } = require('../utils');
const { error } = require('../utils/responses');
const { ISSUER } = require('../constants/payload');
const uuidv1 = require('uuid/v1');

const { ACCESS_TOKEN } = getCredentials();

const getExpireAt = (dayInterval = 7) => {
  return Date.now() + dayInterval * 24 * 60 * 60 * 1000;
};

const authorizeUser = async (_id) => {
  await User.updateOne({ _id }, { $set: { authorized: true } });
};

const createBacklist = async ({
  jti,
  expireAt
}) => {
  await Blacklist.create({
    jti,
    expireAt
  });
};

const checkIfUserAndAccessIdExist = async (_id, attemptAccessId) => {
  const userDoc = await User.findOne({ _id });
  const accessIdDoc = await Accesslist.findOne({ userId: _id, accessId: attemptAccessId });
  const { expireAt, accessId } = accessIdDoc;
  if (!userDoc || !accessIdDoc) {
    return null;
  }
  try {
    if ((Date.parse(expireAt) >= Date.now()) && (accessId === attemptAccessId)) {
      return {
        userDoc,
        accessIdDoc
      };
    }
  } catch (e) {
    return null;
  }
  return null;
};

const authorize = (app) => {
  app.get('/oauth/authorize', async (req, res) => {
    const { client_id, response_type, state, redirect_url } = req.query;
    const { callerProtocol, callerDomain, callerPath, userId, accessId } = urlToObject(state);
    const doc = await checkIfUserAndAccessIdExist(userId, accessId);
    if (!doc) {
      return error({
        res,
        status: 500,
        errorMessage: 'The authorization url has expired. Please sign up again to get the authorization url.'
      });
    }
    authorizeUser(userId);
    const expireAt = getExpireAt(7);
    const jti = uuidv1();
    createBacklist({ jti, expireAt });
    const accessTokenPayload = {
      iss: ISSUER,
      aud: `${callerProtocol}://${callerDomain}/${callerPath}`,
      sub: `user_${userId}`,
      scope: 'undefined',
      iat: Math.floor(Date.now() / 1000),
      exp: expireAt / 1000,
      jti
    };
    const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN);
    // res
    //   .cookie('access_token', accessToken, {
    //     expires: new Date(expireAt(true)(7)),
    //     httpOnly: true,
    //     domain: callerDomain
    //   })
    //  .redirect(307, redirect_url);
    res
      .set('Authorization', `Bearer ${accessToken}`)
      .status(200)
      .end();
  });
};

module.exports = authorize;
