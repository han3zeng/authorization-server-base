const error = ({ res, status, message }) => {
  res.status(status).json({
    ok: false,
    status,
    data: {
      message
    }
  });
};

const success = ({ res, status, data }) => {
  res.status(status).json({
    ok: true,
    status,
    data
  });
};

module.exports = {
  error,
  success
};
