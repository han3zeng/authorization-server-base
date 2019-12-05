const ENV_CONSTANTS = require('../constants/env');

module.exports = Object.freeze({
  nodeEnv: process.NODE_ENV || ENV_CONSTANTS.DEVELOPMENT,
  origin: process.NODE_ENV === ENV_CONSTANTS.PRODUCTION ? 'https://authorization-server.appspot.com' : 'http://localhost:3030',
  allowedOrigins: ['http://localhost:3000', 'http://localhost:8080', 'https://portfolio-and-trial.appspot.com']
});
