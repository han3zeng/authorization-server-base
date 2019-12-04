const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { error, success } = require('../utils/responses');
const { PASSWORD, ACCESS_TOKEN } = require('../constants/secretKeys');
const { ISSUER } = require('../constants/payload');

const User = mongoose.model('User');

const checkIfUserExist = async (email) => {
  const doc = await User.findOne({ email });
  if (doc) {
    return doc;
  }
  return null;
};

const expireAt = (dayInterval = 7) => {
  const millionSeconds = Date.now() + dayInterval * 24 * 60 * 60 * 1000;
  return Math.floor(millionSeconds / 1000);
};

/**
 * @param {object} - instance of express()
 * @returns {null} - express res
 * @property {object} response.data.signUpStatus - 1 create new profile, 0 user profile has existed and reutrn the profile
 */
const signUp = (app) => {
  app.post('/user/signup', async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
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
        const hashedPassword = jwt.sign({ email, password }, PASSWORD).split('.')[2];
        const newDoc = {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName
        };
        User.create(newDoc, (err, doc) => {
          if (err) {
            throw err;
          }
          const accessTokenPayload = {
            iss: ISSUER,
            aud: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
            sub: `user_${doc._id.toString()}`,
            scope: 'undefined',
            iat: Math.floor(Date.now() / 1000),
            exp: expireAt()
          };
          const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN);
          success({
            res,
            status: 200,
            data: { token: accessToken },
            statusCode: 1
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
