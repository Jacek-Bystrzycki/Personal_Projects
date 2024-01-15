const { CustomAPIError } = require('./plc-query.js');

const customErrorHandler = (err, req, res, next) => {
  if (err instanceof CustomAPIError) {
    res.status(err.statusCode).json({ status: 'failure', code: err.message });
  } else {
    res.status(500).json({ status: 'failure', code: 'Unknown error' });
  }
};

module.exports = customErrorHandler;
