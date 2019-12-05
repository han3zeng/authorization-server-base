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

module.exports = {
  urlToObject,
  objectToUrl
};
