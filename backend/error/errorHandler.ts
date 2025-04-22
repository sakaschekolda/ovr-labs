import { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationErrorsObject,
} from './errors.js';

interface MiddlewareError extends Error {
  status?: number;
  expose?: boolean;
  errors?:
    | ValidationErrorsObject
    | Array<{ path?: string | null; message: string }>;
}

interface RequestUser {
  id?: number | string;
}

const errorHandler = (
  err: MiddlewareError | ApiError | Error,
  req: Request & { user?: RequestUser },
  res: Response,
  _next: NextFunction,
): void => {
  console.error('--------------------');
  console.error(`[GLOBAL ERROR HANDLER] ${new Date().toISOString()}`);
  console.error(`Request: ${req.method} ${req.originalUrl}`);
  if (req.user?.id) {
    console.error(`Authenticated User ID (if available): ${req.user.id}`);
  }
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Message: ${err.message}`);

  if ('errors' in err && err.errors) {
    try {
      console.error(
        `Validation/Sequelize Errors: ${JSON.stringify(err.errors, null, 2)}`,
      );
    } catch (stringifyError: unknown) {
      console.error(
        `Error trying to stringify errors property: ${stringifyError instanceof Error ? stringifyError.message : String(stringifyError)}`,
      );
      console.error(`Original errors property:`, err.errors);
    }
  }

  if ('status' in err && typeof err.status === 'number') {
    console.error(
      `Error Status from middleware (e.g., body-parser): ${err.status}`,
    );
  }
  if (err instanceof ApiError && err.statusCode) {
    console.error(`Custom Status Code: ${err.statusCode}`);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isClientError =
    (err instanceof ApiError && err.statusCode < 500) ||
    ('status' in err && typeof err.status === 'number' && err.status < 500);

  if (!isProduction || !isClientError) {
    console.error('Error Stack:', err.stack);
  }
  console.error('--------------------');

  if (
    err instanceof UnauthorizedError ||
    err.name === 'UnauthorizedError' ||
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    res.status(401).json({
      message:
        err.message || 'Authentication required. Invalid or missing token.',
    });
    return;
  }

  if (err instanceof ForbiddenError || err.name === 'ForbiddenError') {
    res.status(403).json({
      message: err.message || 'Permission denied.',
    });
    return;
  }

  if (
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  ) {
    res.status(err.status).json({
      message: err.expose
        ? err.message
        : `Request Error: Invalid request format or data.`,
      ...(!isProduction && { error_name: err.name }),
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({
      message: err.message || 'Validation failed.',
      errors:
        err.errors &&
        typeof err.errors === 'object' &&
        !Array.isArray(err.errors)
          ? err.errors
          : undefined,
    });
    return;
  }

  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    const errors: ValidationErrorsObject = {};
    if ('errors' in err && Array.isArray(err.errors)) {
      (err.errors as Array<{ path?: string | null; message: string }>).forEach(
        (e) => {
          if (e.path && typeof e.path === 'string') {
            errors[e.path] = e.message;
          } else {
            const generalKey = 'general';
            const existingMessage =
              typeof errors[generalKey] === 'string' ? errors[generalKey] : '';
            errors[generalKey] = existingMessage
              ? existingMessage + ', ' + e.message
              : e.message;
          }
        },
      );
    }
    res.status(400).json({
      message: err.message || 'Database validation failed.',
      errors: errors,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      message: err.message || 'The requested resource was not found.',
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode || 500).json({
      message: err.message || 'An API error occurred.',
      ...(err.errors &&
        typeof err.errors === 'object' &&
        !Array.isArray(err.errors) && { errors: err.errors }),
    });
    return;
  }

  console.log('[errorHandler] No specific match found, defaulting to 500.');
  const responseMessage =
    'Internal Server Error. An unexpected issue occurred.';

  res.status(500).json({
    message: responseMessage,
  });
};

export default errorHandler;
