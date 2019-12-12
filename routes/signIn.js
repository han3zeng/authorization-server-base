const { emailValidation, passwordValidation } = require('../utils/userServices');
const { error, success } = require('../utils/responses');

const validation = async (email, password) => {
  let ok = false;
  let status = null;
  let errorMessage = null;

  if (!email || !password) {
    status = 400;
    errorMessage = 'Bad Request. Email and passsword are both mandatory.';
  } else if (!emailValidation(email)) {
    status = 400;
    errorMessage = 'Bad Request. Email syntax error';
  } else {
    const result = await passwordValidation({ email, attemptPassword: password });
    if (result.status === 0) {
      status = 400;
      errorMessage = 'Bad Request. Email has no match user record or the user has the record but not been authorized';
    } else if (result.status === 1) {
      status = 403;
      errorMessage = 'Forbidden. password is not correct';
    } else {
      ok = true;
      status = 200;
    }
  }
  return Object.freeze({
    ok,
    status,
    errorMessage
  });
};

const signIn = (app) => {
  app.post('/user/signin', async (req, res) => {
    const { email, password } = req.body;
    const validationResult = await validation(email, password);
    if (!validationResult.ok) {
      const {
        status,
        errorMessage
      } = validationResult;
      return error({
        res,
        status,
        errorMessage
      });
    }
    success({
      res,
      status: 200,
      data: {
        message: 'user signin successfully'
      },
      statusCode: 1
    });
  });
};

module.exports = signIn;
