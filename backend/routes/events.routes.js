// routes/events.routes.js

const express = require('express');
const eventController = require('../controllers/event.controller');
const passport = require('passport');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Protected Events
 *   description: Event management endpoints requiring authentication
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Requires Authentication)
 *     tags: [Protected Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Event object. `title`, `date`, `category` required. `date` must be future. `created_by` is set automatically from authenticated user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, category]
 *             properties:
 *               title: { type: string, example: "Summer Tech Conference" }
 *               description: { type: string, nullable: true, example: "Annual web dev conference." }
 *               date: { type: string, format: date-time, description: "Must be a future date", example: "2024-09-20T09:00:00Z" }
 *               category: { type: string, enum: [concert, lecture, exhibition, 'master class', sport], example: "lecture" }
 *     responses:
 *       201:
 *         description: Event created successfully. Includes creator details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation Error (e.g., missing fields, invalid format, date not future).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required or token invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  eventController.createEvent,
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an existing event (Requires Authentication & Ownership)
 *     tags: [Protected Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         description: Numeric ID of the event to update.
 *     requestBody:
 *       description: Object with fields to update (`title`, `description`, `date`, `category`). Provide at least one. Must own the event.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Updated Conference Title" }
 *               description: { type: string, nullable: true, example: "Updated description." }
 *               date: { type: string, format: date-time, description: "Must be a future date", example: "2024-09-21T10:00:00Z" }
 *               category: { type: string, enum: [concert, lecture, exhibition, 'master class', sport], example: "lecture" }
 *     responses:
 *       200:
 *         description: Event updated successfully. Includes updated event data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation Error (Invalid ID, invalid data, no valid fields provided, attempt to update immutable fields).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required or token invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Permission denied (User does not own the event).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  eventController.updateEvent,
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event by its ID (Requires Authentication & Ownership)
 *     tags: [Protected Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         description: Numeric ID of the event to delete. Must own the event.
 *     responses:
 *       204:
 *         description: Event deleted successfully.
 *       400:
 *         description: Invalid ID supplied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required or token invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Permission denied (User does not own the event).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  eventController.deleteEvent,
);

module.exports = router;
