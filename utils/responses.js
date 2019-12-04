const error = ({ res, status, errorMessage }) => {
  res.status(status).json({
    ok: false,
    status,
    response: {
      errorMessage
    }
  });
};

const success = ({ res, status, data, statusCode }) => {
  res.status(status).json({
    ok: true,
    status,
    response: {
      data,
      statusCode
    }
  });
};

module.exports = {
  error,
  success
};
