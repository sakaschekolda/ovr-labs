import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User.js';
import { ValidationError, UnauthorizedError } from '../error/errors.js';
import 'dotenv/config';

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface LoginResponseBody {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: 'user' | 'admin';
  };
}

const jwtSecret: string = process.env.JWT_SECRET ?? '';
const defaultExpiresInSeconds = 3600;
let jwtExpiresInSeconds: number;

if (process.env.JWT_EXPIRES_IN) {
  const parsed = parseInt(process.env.JWT_EXPIRES_IN, 10);
  if (!isNaN(parsed) && isFinite(parsed)) {
    jwtExpiresInSeconds = parsed;
    console.log(
      `Using JWT expiration from env: ${jwtExpiresInSeconds} seconds.`,
    );
  } else {
    console.warn(
      `⚠️ Invalid JWT_EXPIRES_IN value: "${process.env.JWT_EXPIRES_IN}". Must be a number of seconds. Using default: ${defaultExpiresInSeconds}s.`,
    );
    jwtExpiresInSeconds = defaultExpiresInSeconds;
  }
} else {
  jwtExpiresInSeconds = defaultExpiresInSeconds;
}

if (!jwtSecret) {
  console.error('❌ JWT_SECRET environment variable is not defined!');
  process.exit(1);
}

export const login = async (
  req: Request<object, LoginResponseBody, LoginRequestBody>,
  res: Response<LoginResponseBody>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError({
        credentials: 'Email and password are required.',
      });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }
    const isValid = await user.validPassword(password);

    if (!isValid) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    const payload = {
      id: user.id,
    };

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresInSeconds,
    };

    const token = jwt.sign(payload, jwtSecret, signOptions);

    const userRole = user.getDataValue('role');

    const responseBody: LoginResponseBody = {
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
    };

    res.status(200).json(responseBody);
  } catch (error: unknown) {
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedError
    ) {
      return next(error);
    }
    console.error(
      'Unexpected error during login:',
      error instanceof Error ? error.message : error,
    );
    next(
      error instanceof Error
        ? error
        : new Error('An unexpected error occurred during login.'),
    );
  }
};
