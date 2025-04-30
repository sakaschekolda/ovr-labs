import express, { Router, Request, Response, NextFunction } from 'express';
import User, { UserRole } from '@models/User';
import { ValidationError } from '@utils/errors';
import { login } from '@controllers/auth.controller';
import passport from '@config/passport';

const router: Router = express.Router();

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

interface RegisterResponseBody {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: Date;
  };
}

interface SequelizeError extends Error {
  errors?: Array<{ path?: string | null; message: string }>;
}

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login and token management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account with email, name, and password. Role defaults to 'user'.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый Пользователь"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "User's password (min 8 chars recommended)"
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation Error (e.g., missing fields, invalid email, email already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error during registration process.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const handleAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };

router.post(
  '/register',
  handleAsync(
    async (
      req: Request<object, RegisterResponseBody, RegisterRequestBody>,
      res: Response<RegisterResponseBody>,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const { name, email, password } = req.body;
        console.log('Received registration request:', { name, email, password });
        console.log('Full request body:', req.body);

        const validationErrors: Record<string, string> = {};
        if (!name) validationErrors.name = 'Name is required';
        if (!email) {
          validationErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          validationErrors.email = 'Invalid email format';
        }
        if (!password) validationErrors.password = 'Password is required';

        if (Object.keys(validationErrors).length > 0) {
          throw new ValidationError(
            validationErrors,
            'User registration failed validation.',
          );
        }

        const existingUser: User | null = await User.findOne({
          where: { email },
        });
        if (existingUser) {
          throw new ValidationError(
            { email: 'Email address is already in use.' },
            'User registration failed.',
          );
        }

        const user: User = await User.create({
          name: name!,
          email: email!,
          password: password!,
          role: 'user',
        });

        const userRole: UserRole = user.getDataValue('role');
        const createdAt: Date = user.getDataValue('created_at');

        const createdUserData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole,
          created_at: createdAt,
        };

        res.status(201).json({
          message: 'User registered successfully.',
          user: createdUserData,
        });
      } catch (error: unknown) {
        if (error instanceof ValidationError) {
          next(error);
          return;
        }
        if (
          error instanceof Error &&
          (error.name === 'SequelizeValidationError' ||
            error.name === 'SequelizeUniqueConstraintError')
        ) {
          const errors: Record<string, string> = {};
          const sequelizeError = error as SequelizeError;
          if (sequelizeError.errors && Array.isArray(sequelizeError.errors)) {
            sequelizeError.errors.forEach((err) => {
              if (err.path) {
                errors[err.path] = err.message;
              }
            });
          }
          const message =
            error.name === 'SequelizeUniqueConstraintError'
              ? 'Database constraint violation.'
              : 'User registration failed database validation.';
          next(new ValidationError(errors, message));
          return;
        }
        next(error);
      }
    },
  ),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     description: Authenticate using email and password to receive a JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful!"
 *                 token:
 *                   type: string
 *                   description: JWT token for subsequent authenticated requests.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNj..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation Error - Missing credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication failed - Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error during login process.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', handleAsync(login));

export default router;
