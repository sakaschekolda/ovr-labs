const { ValidationError, ApiError, NotFoundError, UnauthorizedError, ForbiddenError } = require('./errors');

const errorHandler = (err, req, res, next) => {
  console.error('--------------------');
  console.error(`[GLOBAL ERROR HANDLER] ${new Date().toISOString()}`);
  console.error(`Request: ${req.method} ${req.originalUrl}`);
  if (req.user && req.user.id) {
    console.error(`Authenticated User ID (if available): ${req.user.id}`);
  }
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Message: ${err.message}`);
  if (err.errors) {
      console.error(`Validation Errors: ${JSON.stringify(err.errors)}`);
  }
  if (err.statusCode) {
      console.error(`Status Code: ${err.statusCode}`);
  }
  if (process.env.NODE_ENV !== 'production' || !(err instanceof ApiError && err.statusCode < 500)) {
      console.error('Error Stack:', err.stack);
  }
  console.error('--------------------');

  if (err instanceof UnauthorizedError || err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: err.message || 'Authentication required. Invalid or missing token.'
    });
  }

  if (err instanceof ForbiddenError || err.name === 'ForbiddenError') {
    return res.status(403).json({
        message: err.message || 'Permission denied.'
    });
  }

  if (err instanceof ValidationError || err.name === 'ValidationError' || err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    let errors = err.errors;
    if (err.name?.startsWith('Sequelize') && err.errors && !err.errors[0]?.path) {
       const formattedErrors = {};
       err.errors.forEach(e => { formattedErrors[e.path || 'general'] = e.message; });
       errors = formattedErrors;
    }
    return res.status(400).json({
      message: err.message || 'Validation failed.',
      errors: errors
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