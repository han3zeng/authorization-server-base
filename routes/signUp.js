const mongoose = require('mongoose');
const sendMail = require('../utils/sendMail');
const { objectToUrl } = require('../utils');
const { error, success } = require('../utils/responses');
const { hashPassword, emailValidation, passwordPrimitiveValidation } = require('../utils/userServices');
const config = require('../config');

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
    const redirectUrlDev = `redirect_url_dev=${doc.redirectUrlDev}`;
    return `${origin}/${path}?${clientId}&${responseType}&${state}&${redirectUrl}&${redirectUrlDev}`;
  }
  return null;
};

const generateTMPAccessId = async (userId) => {
  const { hash, salt, iterations } = hashPassword(`${userId}_${Date.now()}`);
  const doc = Accesslist.create({
    userId,
    accessId: hash,
    expireAt: Date.now() + 10 * 60 * 1000,
    updatedAt: Date.now(),
    createdAt: Date.now()
  });
  if (doc) {
    return hash;
  } else {
    throw new Error('can not create the accessId');
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
      authUrl: authorizationUrl,
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

const formValidation = ({ res, username, email, password, firstName, lastName }) => {
  let result = true;
  if (!email || !password) {
    result = false;
    error({
      res,
      status: 400,
      errorMessage: 'email and password are mendatory'
    });
  } else if (!emailValidation(email)) {
    result = false;
    error({
      res,
      status: 400,
      errorMessage: 'email is invalid'
    });
  } else {
    if (!passwordPrimitiveValidation(password)) {
      result = false;
      error({
        res,
        status: 400,
        errorMessage: 'the password requires at least one lowercase letter, one uppercase letter and one number'
      });
    }
  }
  return result;
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
    if (!formValidation({ res, username, email, password, firstName, lastName })) {
      return;
    };
    if (userProfile && userProfile.authorized) {
      error({
        res,
        status: 400,
        errorMessage: 'the email has been used'
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
          errorMessage: `System Error: ${e}`
        });
      }
    }
  });
};

module.exports = signUp;
