const fs = require('fs');
const path = require('path');

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


module.exports = {
  urlToObject,
  objectToUrl,
  getCredentials
};
