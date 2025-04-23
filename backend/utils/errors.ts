export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export type ValidationErrorsObject = Record<string, string | string[]>;

export class ApiError extends BaseError {
  public statusCode: number;
  public errors?: ValidationErrorsObject | null;

  constructor(
    statusCode: number,
    message: string,
    errors?: ValidationErrorsObject | null,
  ) {
    super(message);
    this.statusCode = statusCode;
    if (errors) {
      this.errors = errors;
    }
  }
}

export class ValidationError extends ApiError {
  constructor(
    errors: ValidationErrorsObject,
    message: string = 'Validation failed.',
  ) {
    super(400, message, errors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resourceName: string = 'Resource', message?: string) {
    super(404, message || `${resourceName} not found.`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication failed. Access denied.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message: string = 'Permission denied. You do not have rights to access or modify this resource.',
  ) {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}
