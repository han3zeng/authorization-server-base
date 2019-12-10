const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const objectToUrl = (obj) => {
  try {
    const stringifiedJSON = JSON.stringify(obj);
    return encodeURIComponent(stringifiedJSON);
  } catch (e) {
    console.log('JSON.stringify || encodeURIComponent error, objectToUrl, utils');
    return null;
  }
};

const urlToObject = (str) => {
  try {
    const stringifiedJSON = decodeURIComponent(str);
    return JSON.parse(stringifiedJSON);
  } catch (e) {
    console.log('decodeURIComponent || JSON.parse error, urlToObject, utils');
    return null;
  }
};

const getCredentials = () => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../constants/credentials.json')));
  } catch (e) {
    console.log('fail to read credentisl: ', e);
    return {};
  }
};

const hashPassword = (password) => {
  const { randomBytes, pbkdf2Sync } = crypto;
  const salt = randomBytes(128).toString('base64');
  const iterations = 10000;
  const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return {
    hash,
    salt,
    iterations
  };
};

const verfiyPassword = ({
  hash,
  salt,
  iterations,
  attemptPassword
}) => {
  return crypto.pbkdf2Sync(attemptPassword, salt, iterations, '64', 'sha512').toString('hex');
};

module.exports = {
  urlToObject,
  objectToUrl,
  getCredentials,
  hashPassword,
  verfiyPassword
};
