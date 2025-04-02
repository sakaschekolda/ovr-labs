const { ValidationError, ApiError, NotFoundError } = require('./errors');
const errorHandler = (err, req, res, next) => {
  console.error('--------------------');
  console.error(`[GLOBAL ERROR HANDLER] ${new Date().toISOString()}`);
  console.error(`Request: ${req.method} ${req.originalUrl}`);
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Message: ${err.message}`);
  if (err.errors) {
      console.error(`Validation Errors: ${JSON.stringify(err.errors)}`);
  }
  console.error('Error Stack:', err.stack);
  console.error('--------------------');

  if (err instanceof ValidationError || err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message || 'Validation failed.',
      errors: err.errors
    });
  }

  if (err instanceof NotFoundError || err.name === 'NotFoundError') {
    return res.status(404).json({
      message: err.message || 'The requested resource was not found.'
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode || 400).json({
      message: err.message || 'An API error occurred.',
      ...(err.errors && { errors: err.errors })
    });
  }
  let responseMessage = 'Internal Server Error. An unexpected issue occurred.';
  return res.status(500).json({
    message: responseMessage
  });
};

module.exports = errorHandler;