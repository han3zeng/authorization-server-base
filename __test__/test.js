const { ACCESS_TOKEN } = require('../constants/credentials');
const jwt = require('jsonwebtoken');

jwt.verify('', ACCESS_TOKEN);
