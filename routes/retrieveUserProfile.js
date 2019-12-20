const { tokenValidation } = require('../utils/accessTokens');
const { ifUserExist } = require('../utils/userServices');
const { success, error } = require('../utils/responses');

const _get = require('lodash/get');

const _ = {
  get: _get
};

const retrieveUserProfile = (app) => {
  app.get('/retrieve-user-profile', async (req, res) => {
    const authHeader = req.get('Authorization');
    const response = await tokenValidation(authHeader);
    const { decodedInfo } = response;
    if (response.ok) {
      const userId = _.get(decodedInfo, 'sub', '_').split('_')[1];
      const userResponse = await ifUserExist({
        userId
      });
      if (userResponse.status === 2) {
        const userProfile = {};
        const targetedProperties = [
          'firstName',
          'lastName',
          'username',
          'email',
          '_id',
          'createdAt',
          'updatedAt'
        ];
        targetedProperties.forEach((prop, index) => {
          userProfile[prop] = userResponse.doc[prop];
        });
        return success({
          res,
          status: 200,
          data: {
            userProfile,
            tokenPayload: {
              exp: _.get(decodedInfo, 'exp', null)
            }
          }
        });
      } else {
        return error({
          res,
          status: 404,
          errorMessage: `Not Found: can not find the user. user satus: ${userResponse.status}`
        });
      }
    } else {
      const {
        status,
        errorMessage
      } = response;
      error({
        res,
        status,
        errorMessage
      });
    }
  });
};

module.exports = retrieveUserProfile;
