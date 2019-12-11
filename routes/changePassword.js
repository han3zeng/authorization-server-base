const { validation } = require('../utils/accessTokens');
const { error, success } = require('../utils/responses');
const { hashPassword, passwordValidation, updatePassword } = require('../utils/userServices');
const _get = require('lodash/get');

const _ = {
  get: _get
}

const changePassword = (app) => {
  app.post('/user/change-password', async (req, res) => {
    const authoriztionHeader = req.get('Authorization');
    const validationResult = await validation(authoriztionHeader);
    if (!validationResult.ok) {
      const { status, errorMessage } = validationResult;
      return error({
        res,
        status,
        errorMessage
      });
    }
    const subid = _.get(validationResult, 'decodedInfo.sub', '_').split('_')[1];
    const { originalPassword, updatedPassword } = req.body;
    const pwValidtionResult = await passwordValidation({
      userId: subid,
      attemptPassword: originalPassword
    });
    if (!pwValidtionResult) {
      return error({
        res,
        status: 403,
        errorMessage: 'Forbidden. the original password is not correct'
      });
    }
    if (!updatedPassword) {
      return error({
        res,
        status: 406,
        errorMessage: 'Not Acceptable. the updated password is empty'
      });
    }
    const updatePasswordResult = updatePassword({
      userId: subid,
      password: updatedPassword
    });
    if (!updatePasswordResult) {
      return error({
        res,
        status: 500,
        errorMessage: 'Internel Server Error'
      });
    }
    success({
      res,
      status: 200,
      data: null,
      statusCode: 1
    });
  });
};

module.exports = changePassword;
