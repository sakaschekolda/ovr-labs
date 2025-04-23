import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@utils/errors.js';

interface AuthenticatedUser {
  id: number;
  name: string;
  role: string;
}

function isAuthenticatedUser(user: unknown): user is AuthenticatedUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'role' in user &&
    typeof (user as { role: unknown }).role === 'string'
  );
}

export const isAdmin = (
  req: Request & { user?: unknown },
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(
      new ForbiddenError(
        'Authorization failed: User details not available on request after authentication.',
      ),
    );
  }

  if (!isAuthenticatedUser(req.user)) {
    return next(
      new ForbiddenError(
        'Authorization failed: Invalid user object structure.',
      ),
    );
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return next(
      new ForbiddenError('Access denied. Administrator privileges required.'),
    );
  }
};
