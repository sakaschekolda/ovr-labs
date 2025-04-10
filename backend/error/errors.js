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

class ValidationError extends ApiError {
  constructor(errors, message = 'Validation failed.') {
    super(400, message, errors);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends ApiError {
  constructor(resourceName = 'Resource', message) {
    super(404, message || `${resourceName} not found.`);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication failed. Access denied.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends ApiError {
    constructor(message = 'Permission denied. You do not have rights to access or modify this resource.') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}


module.exports = {
  BaseError,
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};