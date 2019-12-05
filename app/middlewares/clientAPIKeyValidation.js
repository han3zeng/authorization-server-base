const { getClientDetails } = require('../../utils/clientServices');
const { CLINET_API_KEY } = require('../../constants/headers');
const { error } = require('../../utils/responses');

const clientAPIKeyValidation = async (req, res, next) => {
  const clientApiKey = req.get(CLINET_API_KEY);
  console.log('CLINET_API_KEY: ', CLINET_API_KEY)
  console.log('clientApiKey: ', clientApiKey)
  if (!clientApiKey) {
    return error({
      res,
      status: 401,
      errorMessage: 'the client project should send request with valid API Key. Please contact the author to get the key.'
    });
  }
  try {
    const clientInfo = await getClientDetails(clientApiKey);
    if (clientInfo) {
      next();
    } else {
      error({
        res,
        status: 401,
        errorMessage: 'Invalid API-Key'
      });
    }
  } catch (e) {
    error({
      res,
      status: 500,
      errorMessage: 'Server System Error. Please try again later.'
    });
  }
};

module.exports = clientAPIKeyValidation;
