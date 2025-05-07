/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError } from '../utils/errors';
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
  console.log('Auth middleware - Request headers:', req.headers);
  const authHeader: string | undefined = req.headers['authorization'];
  console.log('Auth middleware - Authorization header:', authHeader);
  const token: string | undefined = authHeader?.split(' ')[1];
  console.log('Auth middleware - Token:', token);

  if (!token) {
    console.log('Auth middleware - No token provided');
    return next(
      new UnauthorizedError('No authentication token provided. Access denied.'),
    );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedPayload;
    console.log('Auth middleware - Decoded token:', decoded);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.id !== 'number'
    ) {
      console.log('Auth middleware - Invalid token payload');
      throw new Error(
        'Invalid token payload: ID is missing, not a number, or payload is not an object.',
      );
    }

    const user: User | null = await User.findByPk(decoded.id);
    console.log('Auth middleware - Found user:', user?.id);

    if (!user) {
      console.log('Auth middleware - User not found');
      return next(new UnauthorizedError('Invalid token: User not found.'));
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    console.error('Auth middleware - Error:', error);
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
