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
  if (err.errors && typeof err.errors === 'object') {
      console.error(`Validation Errors: ${JSON.stringify(err.errors)}`);
  } else if (err.errors) {
       console.error(`Errors property: ${err.errors}`);
  }
  if (err.status) {
      console.error(`Error Status from middleware (e.g., body-parser): ${err.status}`);
  }
  if (err.statusCode) {
      console.error(`Custom Status Code: ${err.statusCode}`);
  }
  if (process.env.NODE_ENV !== 'production' || !(err instanceof ApiError && err.statusCode < 500) && !(typeof err.status === 'number' && err.status < 500)) {
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

  if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
      console.log(`[errorHandler] Matched: Middleware Error with status ${err.status}`);
      return res.status(err.status).json({
          message: err.expose ? err.message : `Request Error: Invalid request format or data.`,
          ...(process.env.NODE_ENV !== 'production' && { error_name: err.name })
      });
  }


  if (err instanceof ValidationError || err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message || 'Validation failed.',
      errors: (err.errors && typeof err.errors === 'object') ? err.errors : undefined
    });
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    let errors = {};
    if (err.errors && Array.isArray(err.errors)) {
        err.errors.forEach(e => { errors[e.path || 'general'] = e.message; });
    }
    return res.status(400).json({
      message: err.message || 'Database validation failed.',
      errors: errors
    });
  }


  if (err instanceof NotFoundError || err.name === 'NotFoundError') {
    return res.status(404).json({
      message: err.message || 'The requested resource was not found.'
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode || 500).json({
      message: err.message || 'An API error occurred.',
      ...(err.errors && typeof err.errors === 'object' && { errors: err.errors })
    });
  }


  console.log('[errorHandler] No specific match found, defaulting to 500.');
  let responseMessage = 'Internal Server Error. An unexpected issue occurred.';

  return res.status(500).json({
    message: responseMessage
  });
};

module.exports = errorHandler;