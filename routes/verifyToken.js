const { tokenValidation } = require('../utils/accessTokens');
const { success, error } = require('../utils/responses');

const verifyToken = (app) => {
  app.get('/verify-token', async (req, res) => {
    const authHeader = req.get('Authorization');
    const response = await tokenValidation(authHeader);
    const { decodedInfo } = response;
    if (response.ok) {
      success({
        res,
        status: 200,
        data: decodedInfo,
        statusCode: 1
      });
    } else {
      const { errorMessage, status } = response;
      error({
        res,
        status,
        errorMessage
      });
    }
  });
};

module.exports = verifyToken;
