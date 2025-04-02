// backend/routes/events.routes.js
const express = require('express');
const eventController = require('../controllers/event.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and retrieval endpoints.
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events, optionally filtered by category
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [concert, lecture, exhibition, 'master class', sport] # Ensure enum matches VALID_CATEGORIES
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
 *                     $ref: '#/components/schemas/Event' # Reference the Event schema defined in index.js
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
 *       400: # Validation Error on Query Parameter
 *          description: Invalid category specified in the query parameter.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse' # Reference ErrorResponse schema
 *              example:
 *                message: "Validation failed."
 *                errors:
 *                  category: "Invalid category query parameter. Must be one of: concert, lecture, exhibition, master class, sport"
 *       500: # Server Error
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
 *     summary: Get the list of available event categories
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
 *       500: # Server Error
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.get('/categories', eventController.getEventCategories);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       description: Event object to be created. `title`, `date`, `created_by`, and `category` are required. `date` must be in the future. `created_by` must be a valid User ID.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, created_by, category]
 *             properties:
 *               title: { type: string, example: "Summer Tech Conference" }
 *               description: { type: string, nullable: true, example: "Annual web dev conference." }
 *               date: { type: string, format: date-time, description: "Must be a future date", example: "2024-09-20T09:00:00Z" }
 *               created_by: { type: integer, description: "ID of the user creating the event", example: 1 }
 *               category: { type: string, enum: [concert, lecture, exhibition, 'master class', sport], example: "lecture" }
 *     responses:
 *       201:
 *         description: Event created successfully. The response includes the created event data along with creator details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *             example:
 *               data:
 *                 id: 2
 *                 title: "Summer Tech Conference"
 *                 description: "Annual web dev conference."
 *                 date: "2024-09-20T09:00:00Z"
 *                 category: "lecture"
 *                 created_by: 1
 *                 created_at: "2023-10-28T11:00:00Z"
 *                 creator: { id: 1, name: "Иван Иванов" }
 *       # --- 400 Bad Request Definition ---
 *       400:
 *         description: Validation Error. Occurs if required fields are missing, data formats are incorrect (e.g., date), enum values are invalid, the date is not in the future, or the referenced `created_by` user ID does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Correctly references the ErrorResponse schema
 *             example: # Example for missing fields
 *               message: "Event creation failed validation."
 *               errors:
 *                 created_by: "Creator ID (created_by) is required"
 *                 category: "Category is required"
 *       # --- End 400 Definition ---
 *       500: # Server Error
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.post('/', eventController.createEvent);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve a single event by its ID
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
 *       400: # Validation Error on Path Parameter
 *         description: Invalid ID supplied in the URL path (e.g., not an integer).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Validation failed."
 *                errors:
 *                  id: "Event ID in URL must be an integer"
 *       404: # Not Found
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Event not found."
 *       500: # Server Error
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
 *     summary: Update an existing event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the event to update.
 *     requestBody:
 *       description: Object containing event fields to update. Only `title`, `description`, `date`, and `category` can be updated. Provide at least one valid field. `id` and `created_by` cannot be updated via the request body.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: # Only show updatable fields
 *               title: { type: string, example: "Updated Conference Title" }
 *               description: { type: string, nullable: true, example: "Updated description." }
 *               date: { type: string, format: date-time, description: "Must be a future date", example: "2024-09-21T10:00:00Z" }
 *               category: { type: string, enum: [concert, lecture, exhibition, 'master class', sport], example: "lecture" }
 *     responses:
 *       200:
 *         description: Event updated successfully. Response includes the full updated event data with creator details.
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
 *                 title: "Updated Conference Title"
 *                 description: "Updated description."
 *                 date: "2024-09-21T10:00:00Z"
 *                 category: "lecture"
 *                 created_by: 1
 *                 created_at: "2023-10-27T10:00:00Z" # created_at doesn't change on update in this setup
 *                 creator: { id: 1, name: "Иван Иванов" }
 *       400: # Validation Error
 *         description: Validation Error. Occurs if the path ID is invalid, provided data is invalid (e.g., bad date format, past date, invalid category), or if no valid fields for update are provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Event update failed validation."
 *               errors:
 *                 date: "Event date must be in the future."
 *       403: # Forbidden
 *         description: Forbidden. Attempted to update restricted fields like `id` or `created_by` in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Cannot modify event ID or creator (created_by) field via request body."
 *       404: # Not Found
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Event not found."
 *       500: # Server Error
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.put('/:id', eventController.updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event by its ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the event to delete.
 *     responses:
 *       204: # Success, No Content
 *         description: Event deleted successfully. No response body.
 *       400: # Validation Error on Path Parameter
 *         description: Invalid ID supplied in the URL path (e.g., not an integer).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Validation failed."
 *                errors:
 *                  id: "Event ID must be an integer"
 *       404: # Not Found
 *         description: Event with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *                message: "Event not found."
 *       500: # Server Error
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal Server Error. Please try again later."
 */
router.delete('/:id', eventController.deleteEvent);

module.exports = router;