const mongoose = require('mongoose');
const crypto = require('crypto');
const User = mongoose.model('User');

const emailValidation = (email) => {
  if (typeof email !== 'string') {
    return false;
  }
  const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return regex.test(email);
};

const passwordPrimitiveValidation = (password) => {
  if (typeof password !== 'string') {
    return false;
  }
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/;
  return regex.test(password);
}

/**
 * @param {object} searchQuery - search queary for user model
 * @property {string} userId - userId assign by sign up process (mongodb _id for user doc)
 * @property {string} email - email that user used to apply account
 * @return {object} searchResult
 * @property {status} 0: user not found, 1: user found but not authorized, 2 user found and authorized
 * @property {object} doc - user document
*/

const ifUserExist = async ({ userId, email }) => {
  const doc = await User.findOne({ $or: [{ _id: userId }, { email }] });
  if (doc) {
    if (doc.authorized) {
      return {
        status: 2,
        doc
      };
    } else {
      return {
        status: 1,
        doc
      };
    }
  }
  return {
    status: 0,
    doc: null
  };
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

const reproducePasswordHash = ({
  salt,
  iterations,
  attemptPassword
}) => {
  return crypto.pbkdf2Sync(attemptPassword, salt, iterations, 64, 'sha512').toString('hex');
};

/**
 * @param {object} validation - three basic elements that used to do user authentication
 * @param {string} validation.userId - assigned userId from signup process - choose either one of userId || email
 * @param {string} validation.email - email that user used to apply account - choose either one of userId || email
 * @param {string} validation.attemptPassword - the password that user type in the input bar
 * @returns {object} validationResult: which has three properties ok, status, data
 * @property {boolean} ok - valid: true/false
 * @property {number} status - 0: user dose not exist, 1: invalid+user exist 2. valid+ user exist
 * @property {object|null} doc - object: user doc from mongodb database, null: has no such user
*/

const passwordValidation = async ({ userId, email, attemptPassword }) => {
  const response = await ifUserExist({ userId, email });
  const { doc } = response;
  if (response.status !== 2) {
    return {
      ok: false,
      status: 0,
      doc: null
    };
  }
  const { iterations, salt, password } = doc;
  const hashReplica = reproducePasswordHash({
    salt,
    iterations,
    attemptPassword
  });
  if (hashReplica === password) {
    return {
      ok: true,
      status: 2,
      doc
    };
  }
  return {
    ok: false,
    status: 1,
    doc: null
  };
};

const updatePassword = async ({ userId, password }) => {
  const hashRes = hashPassword(password);
  const { salt, iterations, hash } = hashRes;
  const doc = await User.updateOne({ _id: userId }, { $set: { salt, iterations, password: hash } });
  if (doc) {
    return doc;
  } else {
    return null;
  }
};

module.exports = {
  emailValidation,
  passwordValidation,
  hashPassword,
  ifUserExist,
  updatePassword,
  passwordPrimitiveValidation
};
