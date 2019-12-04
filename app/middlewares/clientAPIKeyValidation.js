const { getClientDetails } = require('../../utils/clientServices');
const { CLINET_API_KEY } = require('../../constants/headers');

const clientAPIKeyValidation = async (req, res, next) => {
  const clientApiKey = req.get(CLINET_API_KEY);
  if (!clientApiKey) {
    res.status(401).send('<strong>401.</strong> the client project should send request with valid API Key. <br/><br/><br/>  Please contact the author to get the key.');
  }
  try {
    const clientInfo = await getClientDetails(clientApiKey);
    if (clientInfo) {
      next();
    }
  } catch (e) {
    res.status(500).send('<strong>500.</strong>Server System Error. <br/><br/><br/> Please try again later.');
  }
};

module.exports = {
  clientAPIKeyValidation
};
