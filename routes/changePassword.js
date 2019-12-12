const { tokenValidation } = require('../utils/accessTokens');
const { error, success } = require('../utils/responses');
const { passwordValidation, updatePassword } = require('../utils/userServices');
const _get = require('lodash/get');

const _ = {
  get: _get
};

const changePassword = (app) => {
  app.patch('/user/change-password', async (req, res) => {
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
    const subid = _.get(validationResult, 'decodedInfo.sub', '_').split('_')[1];
    const { originalPassword, updatedPassword } = req.body;
    const pwValidtionResult = await passwordValidation({
      userId: subid,
      attemptPassword: originalPassword
    });
    if (pwValidtionResult.status === 0) {
      error({
        res,
        status: 400,
        errorMessage: 'Bad Request. the subId has no match user record or the collection has the doc record but the doc has not been authorized'
      });
    } else if (pwValidtionResult.status === 1) {
      error({
        res,
        status: 403,
        errorMessage: 'Forbidden. the original password is not correct'
      });
    } else {
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
    }
  });
};

module.exports = changePassword;
