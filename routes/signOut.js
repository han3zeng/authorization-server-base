const mongoose = require('mongoose');
const { tokenValidation } = require('../utils/accessTokens');
const { error, success } = require('../utils/responses');
const _get = require('lodash/get');

const Blacklist = mongoose.model('Blacklist');

const _ = {
  get: _get
};

const signOut = (app) => {
  app.post('/user/signout', async (req, res) => {
    const authoriztionHeader = req.get('Authorization');
    const validationResult = await tokenValidation(authoriztionHeader);
    if (!validationResult.ok) {
      const { status, errorMessage } = validationResult;
      return error({
        res,
        status,
        errorMessage
      });
    }
    const { jti, exp } = _.get(validationResult, 'decodedInfo', {});
    const blockedJWT = await Blacklist.create({
      jti,
      expireAt: +exp * 1000
    });
    if (blockedJWT) {
      return success({
        res,
        status: 200,
        data: {
          jwt: blockedJWT,
          message: 'You sign out successfully. The old jwt is blocked'
        },
        statusCode: 1
      });
    }
    error({
      res,
      status: 500,
      errorMessage: 'Inernal Server Error. Fail to create doc in blacklist collection'
    });
  });
};

module.exports = signOut;
