const { ACCESS_TOKEN } = require('../constants/secretKeys');
const jwt = require('jsonwebtoken');

jwt.verify('', ACCESS_TOKEN);
