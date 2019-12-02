const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../constants/credentials');
const { authRoutes, newSessionRoutes } = require('../config/routeConfig');

const isNewSessionRequired = (httpMethod, url) => {
  for (const route of newSessionRoutes) {
    if (httpMethod === route.method && url === route.path) {
      return true;
    }
  }
  return false;
};

const isAuthRequired = (httpMethod, url) => {
  for (const route of authRoutes) {
    if (httpMethod === route.method && url === route.path) {
      return true;
    }
  }
  return false;
};

const generateToken = (userData) => {
  return jwt.sign(userData, SECRET_KEY);
};

const verifyToken = (jwtToken) => {
  try {
    return jwt.verify(jwtToken, SECRET_KEY);
  } catch (e) {
    console.log('e:', e);
    return null;
  }
};

// const 

module.exports = {
  isNewSessionRequired,
  isAuthRequired,
  generateToken,
  verifyToken
};
