const express = require('express');
const eventController = require('../controllers/event.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management (Reading is public, Creating/Updating/Deleting requires auth)
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events (Public)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [concert, lecture, exhibition, 'master class', sport]
 *         required: false
 *         description: Filter events by category.
 *     responses:
 *       200:
 *         description: A list of events, each including creator details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             example:
 *               count: 1
 *               data:
 *                 - id: 1
 *                   title: "Classic music concert"
 *                   description: "Event description"
 *                   date: "2024-10-26T20:00:00Z"
 *                   category: "concert"
 *                   created_by: 1
 *                   created_at: "2023-10-27T10:00:00Z"
 *                   creator: { id: 1, name: "Иван Иванов" }
 *       400:
 *          description: Invalid category specified in the query parameter.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *              example:
 *                message: "Validation failed."
 *                errors:
 *                  category: "Invalid category query parameter. Must be one of: concert, lecture, exhibition, master class, sport"
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.get('/', eventController.getAllEvents);

/**
 * @swagger
 * /events/categories:
 *   get:
 *     summary: Get the list of available event categories (Public)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of valid category names.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["concert", "lecture", "exhibition", "master class", "sport"]
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example  :
 *               message: "Internal Server Error. Please try again later."
 */
router.get('/categories', eventController.getEventCategories);


/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Requires Authentication)
 *     tags: [Events]
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
 *         description: Authentication required (Missing or invalid token).
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
router.post('/', authenticateToken, eventController.createEvent);


/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve a single event by its ID (Public)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the event to retrieve.
 *     responses:
 *       200:
 *         description: Event details found successfully, includes creator information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *             example:
 *               data:
 *                 id: 1
 *                 title: "Classic music concert"
 *                 description: "Event description"
 *                 date: "2024-10-26T20:00:00Z"
 *                 category: "concert"
 *                 created_by: 1
 *                 created_at: "2023-10-27T10:00:00Z"
 *                 creator: { id: 1, name: "Иван Иванов" }
 *       400:
 *         description: Invalid ID supplied in the URL path (e.g., not an integer).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Validation failed."
 *                errors:
 *                  id: "Event ID must be an integer"
 *       404:
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Event not found."
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.get('/:id', eventController.getEventById);


/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an existing event (Requires Authentication & Ownership)
 *     tags: [Events]
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
 *         description: Authentication required (Missing or invalid token).
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
 *             example:
 *                 message: "You do not have permission to update this event."
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
router.put('/:id', authenticateToken, eventController.updateEvent);


/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event by its ID (Requires Authentication & Ownership)
 *     tags: [Events]
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
 *         description: Authentication required (Missing or invalid token).
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
 *             example:
 *                 message: "You do not have permission to delete this event."
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
router.delete('/:id', authenticateToken, eventController.deleteEvent);

module.exports = router;