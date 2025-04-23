import express, { Router } from 'express';
import * as eventController from '@controllers/event.controller';
import { handleAsync } from '@utils/asyncHandler';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Public Events
 *   description: Publicly accessible event endpoints
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve a list of events (Public)
 *     tags: [Public Events]
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       400:
 *          description: Invalid category specified in the query parameter.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/events', handleAsync(eventController.getAllEvents));

/**
 * @swagger
 * /events/categories:
 *   get:
 *     summary: Get the list of available event categories (Public)
 *     tags: [Public Events]
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
 */
router.get('/events/categories', eventController.getEventCategories);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Retrieve a single event by its ID (Public)
 *     tags: [Public Events]
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
 *       400:
 *         description: Invalid ID supplied in the URL path (e.g., not an integer).
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
router.get('/events/:id', handleAsync(eventController.getEventById));

export default router;
