import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '@models/User';
import { ValidationError, UnauthorizedError } from '@utils/errors';
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
      const errors: Record<string, string> = {};
      if (!email) errors.email = 'Email is required';
      if (!password) errors.password = 'Password is required';
      throw new ValidationError(errors);
    }

    if (password.length < 8) {
      throw new ValidationError({
        password: 'Password must be at least 8 characters long'
      });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials. Please check your email and password.');
    }

    if (!user.getDataValue('password')) {
      throw new UnauthorizedError('Please set a new password. Your password needs to be at least 8 characters long.');
    }

    const isValid = await user.validPassword(password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials. Please check your email and password.');
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

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      throw new ValidationError({
        email: 'Email обязателен',
        newPassword: 'Новый пароль обязателен'
      });
    }

    if (newPassword.length < 8) {
      throw new ValidationError({
        newPassword: 'Пароль должен быть не менее 8 символов'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Пользователь не найден');
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Пароль успешно обновлен'
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
