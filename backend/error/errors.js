class BaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ApiError extends BaseError {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    if (errors) {
      this.errors = errors;
    }
  }
}

class ValidationError extends BaseError {
  constructor(errors, message = 'Validation failed.') {
    super(message);
    this.statusCode = 400;
    this.errors = errors;
  }
}

class NotFoundError extends BaseError {
  constructor(resourceName = 'Resource', message) {
    super(message || `${resourceName} not found.`);
    this.statusCode = 404;
  }
}


module.exports = {
  BaseError,
  ApiError,
  ValidationError,
  NotFoundError,
};