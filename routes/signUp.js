const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sendMail = require('../utils/sendMail');
const { objectToUrl, getCredentials } = require('../utils');
const { error, success } = require('../utils/responses');
const config = require('../config');
const { PASSWORD_SECRET_KEY } = getCredentials();

const User = mongoose.model('User');
const Client = mongoose.model('Client');

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
  jwtPayloadAudience
}) => {
  const doc = await Client.findOne({ apiKey });
  if (doc) {
    const origin = config.origin;
    const path = 'oauth/authorize';
    const clientId = `client_id=${userId}`;
    const responseType = 'response_type=code';
    const state = `state=${objectToUrl({ userId, jwtPayloadAudience })}`;
    const redirectUrl = `redirect_url=${doc.redirectUrl}`;
    return `${origin}/${path}?${clientId}&${responseType}&${state}&${redirectUrl}`;
  }
  return null;
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
    if (userProfile) {
      success({
        res,
        status: 200,
        data: null,
        statusCode: 0
      });
    } else {
      try {
        const hashedPassword = jwt.sign({ email, password }, PASSWORD_SECRET_KEY).split('.')[2];
        const newDoc = {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          authorized: false
        };
        User.create(newDoc, async (err, doc) => {
          if (err || !doc._id) {
            throw err;
          }
          const callerProtocol = req.protocol;
          const callerDomain = req.get('host');
          const cllaerPath = req.originalUrl;
          const authorizationUrl = await generateAuthorizationURL({
            apiKey,
            userId: doc._id.toString(),
            callerProtocol,
            callerDomain,
            cllaerPath
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
