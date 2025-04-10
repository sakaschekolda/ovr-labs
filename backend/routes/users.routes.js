// routes/users.routes.js

const express = require('express');
const userController = require('../controllers/user.controller');
const passport = require('passport'); // Используем passport
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Public / Registration)
 *     tags: [Users]
 *     description: This endpoint is typically handled by /auth/register now. Keeping for potential direct user creation if needed, otherwise consider removing or aliasing to register.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string, example: "Иван Иванов" }
 *               email: { type: string, format: email, example: "ivan@example.com" }
 *               password: { type: string, format: password, description: "User's password (min 8 chars recommended)", example: "password123" }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation Error (e.g., missing fields, invalid email format, email exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /users остается публичным (регистрация вынесена в /auth/register, но этот может остаться для других целей)
router.post('/', userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users (Requires Authentication)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users (passwords excluded).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 5 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required or token invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', passport.authenticate('jwt', { session: false }), userController.getAllUsers);

module.exports = router;