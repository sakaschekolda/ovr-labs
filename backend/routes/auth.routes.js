const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  ApiError,
  ValidationError,
  UnauthorizedError,
} = require('../error/errors');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login and token management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     description: Creates a new user account with email, name, and password.
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
 *             examples:
 *               missingField:
 *                 value:
 *                   message: "Validation failed."
 *                   errors:
 *                     email: "Email is required"
 *               duplicateEmail:
 *                 value:
 *                   message: "Validation failed."
 *                   errors:
 *                     email: "Email address is already in use."
 *       500:
 *         description: Internal Server Error during registration process.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const validationErrors = {};
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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError(
        { email: 'Email address is already in use.' },
        'User registration failed.',
      );
    }

    const user = await User.create({ name, email, password });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    res.status(201).json({
      message: 'User registered successfully.',
      user: userData,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(error);
    }
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = err.message;
      });
      return next(
        new ValidationError(
          errors,
          'User registration failed database validation.',
        ),
      );
    }
    next(error);
  }
});

/**
 * @swagger
 * /auth/login:
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
 *             example:
 *               message: "Validation failed."
 *               errors:
 *                 credentials: "Email and password are required."
 *       401:
 *         description: Authentication failed - Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid email or password."
 *       500:
 *         description: Internal Server Error during login process.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authController.login);

module.exports = router;
