// const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sendMail = require('../utils/sendMail');
const { objectToUrl } = require('../utils');
const { error, success } = require('../utils/responses');
const { hashPassword } = require('../utils');
const config = require('../config');

// const { PASSWORD_SECRET_KEY } = getCredentials();

const User = mongoose.model('User');
const Client = mongoose.model('Client');
const Accesslist = mongoose.model('Accesslist');

const checkIfUserExist = async (email) => {
  const doc = await User.findOne({ email });
  if (doc) {
    return doc;
  }
  return null;
};

const generateAuthorizationURL = async ({
  apiKey,
  userId,
  callerProtocol,
  callerDomain,
  cllaerPath,
  accessId
}) => {
  const doc = await Client.findOne({ apiKey });
  if (doc) {
    const origin = config.origin;
    const path = 'oauth/authorize';
    const clientId = `client_id=${userId}`;
    const responseType = 'response_type=code';
    const state = `state=${objectToUrl({
      userId,
      callerProtocol,
      callerDomain,
      cllaerPath,
      accessId
    })}`;
    const redirectUrl = `redirect_url=${doc.redirectUrl}`;
    return `${origin}/${path}?${clientId}&${responseType}&${state}&${redirectUrl}`;
  }
  return null;
};

const generateTMPAccessId = async (userId) => {
  const { hash, salt, iterations } = hashPassword(`${userId}_${Date.now()}`);
  const doc = Accesslist.create({
    userId,
    accessId: hash,
    salt,
    iterations
  });
  if (doc) {
    return hash;
  } else {
    throw new Error('can not crate the accessId');
  }
};

const preparationForAuthorization = async ({ req, res, email, doc, apiKey }) => {
  const callerProtocol = req.protocol;
  const callerDomain = req.get('host');
  const cllaerPath = req.originalUrl;
  const userId = doc._id.toString();
  const accessId = await generateTMPAccessId(userId);
  const authorizationUrl = await generateAuthorizationURL({
    apiKey,
    userId,
    callerProtocol,
    callerDomain,
    cllaerPath,
    accessId
  });
  if (authorizationUrl) {
    sendMail({
      text: authorizationUrl,
      target: email
    });
    success({
      res,
      status: 200,
      data: { message: 'please check your email and click on the link' },
      statusCode: 1
    });
  } else {
    error({
      res,
      status: 500,
      errorMessage: 'the client project do not register with the authorization service'
    });
  }
};

/**
 * @param {object} - instance of express()
 * @returns {null} - express res
 * @property {object} response.data.signUpStatus - 1 create new profile, 0 user profile has existed and reutrn the profile
 */
const signUp = (app) => {
  app.post('/user/signup', async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    const apiKey = req.get('API-Key');
    const userProfile = await checkIfUserExist(email);
    if (userProfile && userProfile.authorized) {
      success({
        res,
        status: 200,
        data: null,
        statusCode: 0
      });
    } else if (userProfile && !userProfile.authorized) {
      preparationForAuthorization({
        req,
        res,
        email,
        doc: userProfile,
        apiKey
      });
    } else {
      try {
        const { hash, salt, iterations } = hashPassword(password);
        const newDoc = {
          username,
          email,
          password: hash,
          iterations,
          salt,
          firstName,
          lastName,
          authorized: false
        };
        User.create(newDoc, async (err, doc) => {
          if (err || !doc._id) {
            throw err;
          }
          preparationForAuthorization({
            req,
            res,
            email,
            doc,
            apiKey
          });
        });
      } catch (e) {
        error({
          res,
          status: 500,
          errorMessage: 'System Error'
        });
      }
    }
  });
};

module.exports = signUp;
