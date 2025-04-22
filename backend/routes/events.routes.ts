import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { ValidationError } from '../error/errors.js';
import Event, { EventCategory } from '../models/Event.js';
import { handleAsync } from '../utils/asyncHandler.js';
import { authenticateJWT } from '../middleware/auth.js';
import { InferAttributes } from 'sequelize';
import { ParsedQs } from 'qs';
import passport from '../config/passport.js';
import { ParamsDictionary } from 'express-serve-static-core';

interface ModifyEventParams extends Record<string, string> {
  id: string;
}

interface CreateEventRequestBody {
  title: string;
  description?: string;
  date: string;
  category: EventCategory;
  created_by: number;
}

interface UpdateEventRequestBody {
  title?: string;
  description?: string;
  date?: string;
  category?: EventCategory;
}

interface EventResponseBody {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  category: EventCategory;
  created_by: number;
  created_at: Date;
}

interface EventResponse {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
  updated_at: string;
}

const router = Router();

const jwtAuthMiddleware = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;

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
  jwtAuthMiddleware,
  handleAsync<
    ParamsDictionary,
    EventResponseBody,
    CreateEventRequestBody,
    ParsedQs
  >(async (req, res, next) => {
    try {
      const { title, description, date, category, created_by } = req.body;

      const validationErrors: Record<string, string> = {};
      if (!title) validationErrors.title = 'Title is required';
      if (!date) validationErrors.date = 'Date is required';
      if (!category) validationErrors.category = 'Category is required';
      if (!created_by) validationErrors.created_by = 'Creator ID is required';

      if (Object.keys(validationErrors).length > 0) {
        throw new ValidationError(
          validationErrors,
          'Event creation failed validation.',
        );
      }

      const event = await Event.create({
        title,
        description,
        date: new Date(date),
        category,
        created_by,
      });

      const response: EventResponseBody = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        category: event.category,
        created_by: event.created_by,
        created_at: event.created_at,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }),
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
  jwtAuthMiddleware,
  handleAsync<
    ModifyEventParams,
    EventResponseBody,
    UpdateEventRequestBody,
    ParsedQs
  >(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, date, category } = req.body;

      const event = await Event.findByPk(id);
      if (!event) {
        throw new ValidationError(
          { id: 'Event not found' },
          'Event update failed.',
        );
      }

      const updates: Partial<InferAttributes<Event>> = {};
      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (date) updates.date = new Date(date);
      if (category) updates.category = category;

      await event.update(updates);

      const response: EventResponseBody = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        category: event.category,
        created_by: event.created_by,
        created_at: event.created_at,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }),
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
  jwtAuthMiddleware,
  handleAsync<ModifyEventParams, void, unknown, ParsedQs>(
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
          throw new ValidationError(
            { id: 'Event not found' },
            'Event deletion failed.',
          );
        }

        await event.destroy();
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ),
);

router.get(
  '/',
  jwtAuthMiddleware,
  handleAsync<ParamsDictionary, EventResponseBody[], unknown, ParsedQs>(
    async (req, res, next) => {
      try {
        const events = await Event.findAll();
        const response: EventResponseBody[] = events.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          category: event.category,
          created_by: event.created_by,
          created_at: event.created_at,
        }));
        res.json(response);
      } catch (error) {
        next(error);
      }
    },
  ),
);

export default router;
