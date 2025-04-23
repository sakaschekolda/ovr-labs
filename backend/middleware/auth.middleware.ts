/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '@models/User.js';
import { UnauthorizedError } from '@utils/errors.js';
import 'dotenv/config';

declare global {
  namespace Express {
    interface User extends InstanceType<typeof User> {}
    interface Request {
      user?: User;
    }
  }
}

interface DecodedPayload extends JwtPayload {
  id: number;
}

const jwtSecret: string = process.env.JWT_SECRET ?? '';

if (!jwtSecret) {
  console.error(
    '❌ JWT_SECRET environment variable is not defined for auth middleware!',
  );
  process.exit(1);
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader: string | undefined = req.headers['authorization'];
  const token: string | undefined = authHeader?.split(' ')[1];

  if (!token) {
    return next(
      new UnauthorizedError('No authentication token provided. Access denied.'),
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedPayload;

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.id !== 'number'
    ) {
      throw new Error(
        'Invalid token payload: ID is missing, not a number, or payload is not an object.',
      );
    }

    const user: User | null = await User.findByPk(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('Invalid token: User not found.'));
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return next(
          new UnauthorizedError(
            'Authentication token has expired. Please log in again.',
          ),
        );
      }
      if (error.name === 'JsonWebTokenError') {
        return next(
          new UnauthorizedError(
            'Invalid authentication token. Malformed or bad signature.',
          ),
        );
      }
      console.error('Unexpected token verification error:', error);
      return next(
        new UnauthorizedError(`Token verification failed: ${error.message}`),
      );
    }
    console.error('Unknown error during token verification:', error);
    return next(
      new UnauthorizedError(
        'An unknown error occurred during token verification.',
      ),
    );
  }
};
