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

const ifUserExist = async ({ userId, email }) => {
  const doc = await User.findOne({ $or: [{ _id: userId }, { email }] });
  if (doc) {
    return doc;
  }
  return null;
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

const passwordValidation = async ({ userId, email, attemptPassword }) => {
  const doc = await ifUserExist({ userId, email });
  if (!doc) {
    return false;
  }
  const { iterations, salt, password } = doc;
  const hashReplica = reproducePasswordHash({
    salt,
    iterations,
    attemptPassword
  });
  if (hashReplica === password) {
    return true;
  }
  return false;
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
  updatePassword
};
