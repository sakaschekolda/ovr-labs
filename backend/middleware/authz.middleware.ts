import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../error/errors.js';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(
      new ForbiddenError(
        'Authorization failed: User details not available on request after authentication.',
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