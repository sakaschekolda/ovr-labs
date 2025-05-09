import express, { Router, Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User';
import { ValidationError } from '../utils/errors';
import { login, resetPassword, getCurrentUser } from '../controllers/auth.controller';
import passport from '../config/passport';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

interface RegisterResponseBody {
  success: boolean;
  message: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    role: 'user' | 'admin';
    gender: 'male' | 'female' | 'other';
    birthDate: string;
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
        const {
          email,
          password,
          firstName,
          lastName,
          middleName,
          gender,
          birthDate
        } = req.body;

        // Валидация обязательных полей
        const validationErrors: Record<string, string> = {};
        if (!email) validationErrors.email = 'Email is required';
        if (!password) validationErrors.password = 'Password is required';
        if (!firstName) validationErrors.firstName = 'First name is required';
        if (!lastName) validationErrors.lastName = 'Last name is required';
        if (!middleName) validationErrors.middleName = 'Middle name is required';
        if (!gender) validationErrors.gender = 'Gender is required';
        if (!birthDate) validationErrors.birthDate = 'Birth date is required';

        if (Object.keys(validationErrors).length > 0) {
          throw new ValidationError(validationErrors);
        }

        // Валидация пароля
        if (password.length < 8) {
          throw new ValidationError({
            password: 'Password must be at least 8 characters long'
          });
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ValidationError({
            email: 'Invalid email format'
          });
        }

        // Валидация пола
        if (!['male', 'female', 'other'].includes(gender)) {
          throw new ValidationError({
            gender: 'Invalid gender value'
          });
        }

        // Валидация даты рождения
        const birthDateObj = new Date(birthDate);
        if (isNaN(birthDateObj.getTime())) {
          throw new ValidationError({
            birthDate: 'Invalid birth date format'
          });
        }

        // Проверка существования пользователя
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new ValidationError({
            email: 'Email is already registered'
          });
        }

        // Создание пользователя
        const user = await User.create({
          email,
          password,
          firstName,
          lastName,
          middleName,
          gender,
          birthDate: birthDateObj.toISOString().split('T')[0],
          role: 'user'
        });

        res.status(201).json({
          success: true,
          message: 'User registered successfully.',
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            email: user.email,
            role: user.role,
            gender: user.gender,
            birthDate: user.birthDate
          }
        });
      } catch (error) {
        console.error('Registration error details:', {
          error,
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown',
          errorStack: error instanceof Error ? error.stack : 'No stack trace',
          requestBody: req.body
        });

        if (error instanceof ValidationError) {
          next(error);
        } else if (error instanceof Error) {
          if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const sequelizeError = error as SequelizeError;
            const errors: Record<string, string> = {};
            if (sequelizeError.errors && Array.isArray(sequelizeError.errors)) {
              sequelizeError.errors.forEach((err) => {
                if (err.path) {
                  errors[err.path] = err.message;
                }
              });
            }
            next(new ValidationError(errors));
          } else {
            next(new Error(`Registration failed: ${error.message}`));
          }
        } else {
          next(new Error('An unexpected error occurred during registration'));
        }
      }
    }
  )
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

router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user data
 *     tags: [Authentication]
 *     description: Get the currently authenticated user's data
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [user, admin]
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticateToken, getCurrentUser);

export default router;
