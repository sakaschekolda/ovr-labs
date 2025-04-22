import { Request, Response, NextFunction } from 'express';
import { WhereOptions, FindOptions, Order, CreationOptional, ForeignKey, Optional, InferAttributes, InferCreationAttributes } from 'sequelize';
import Event, { EventCategory } from '../models/Event.js';
import User from '../models/User.js';
import {
  ApiError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../error/errors.js';
import 'dotenv/config';

interface SequelizeError extends Error {
    errors?: Array<{ path?: string | null; message: string }>;
}

interface GetAllEventsQuery {
    category?: EventCategory;
}

interface CreateEventRequestBody {
    title: string;
    description?: string | null;
    date: string;
    category: EventCategory;
}

interface UpdateEventRequestBody {
    title?: string;
    description?: string | null;
    date?: string;
    category?: EventCategory;
}

type EventUpdateData = Partial<Pick<Event, 'title' | 'description' | 'date' | 'category'>>;

interface ModifyEventParams { id: string; }

type EventCreationAttributes = {
    title: string;
    description: CreationOptional<string | null>;
    date: Date;
    created_by: ForeignKey<User['id']>;
    category: EventCategory;
    id: CreationOptional<number>;
    created_at: CreationOptional<Date>;
};

const VALID_CATEGORIES: EventCategory[] = [
  'concert',
  'lecture',
  'exhibition',
  'master class',
  'sport',
];

export const getAllEvents = async (req: Request<object, unknown, object, GetAllEventsQuery>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;
    const where: WhereOptions<Event> = {};

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        throw new ValidationError({
          category: `Invalid category query parameter. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      where.category = category;
    }

    const orderOption: Order = [['date', 'ASC']];

    const findOptions: FindOptions<Event> = {
        where,
        include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'role'] }
        ],
        order: orderOption
    };

    const events: Event[] = await Event.findAll(findOptions);

    res.status(200).json({
      count: events.length,
      data: events,
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const getEventCategories = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json({
      data: {
        categories: VALID_CATEGORIES,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

export const getEventById = async (req: Request<ModifyEventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventIdString = req.params.id;
    if (eventIdString === undefined) {
        throw new ApiError(400, 'Event ID parameter is missing in the request URL.');
    }
    const eventId = parseInt(eventIdString, 10);

    if (isNaN(eventId)) {
      throw new ValidationError({ id: 'Event ID must be a valid integer' });
    }

    const event: Event | null = await Event.findByPk(eventId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      ],
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    res.status(200).json({ data: event });
  } catch (error: unknown) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser || typeof authenticatedUser.id !== 'number') {
      return next(
        new ApiError(401, 'Authentication failed, user not found on request.'),
      );
    }

    const created_by = authenticatedUser.id;
    const { title, description, date: dateString, category } = req.body as CreateEventRequestBody;

    const validationErrors: Record<string, string> = {};
    let validatedDate: Date | null = null;

    if (!title) validationErrors.title = 'Title is required';

    if (!dateString) {
      validationErrors.date = 'Date is required';
    } else {
        const parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) {
            validationErrors.date = 'Invalid date format provided.';
        } else if (parsedDate <= new Date()) {
            validationErrors.date = 'Event date must be in the future.';
        } else {
            validatedDate = parsedDate;
        }
    }
    if (!category) {
      validationErrors.category = 'Category is required';
    } else if (!VALID_CATEGORIES.includes(category)) {
      validationErrors.category = `Invalid category selected. Must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }
    if (description != null && typeof description === 'string' && description.length > 2000) {
      validationErrors.description = 'Description cannot exceed 2000 characters.';
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError(
        validationErrors,
        'Event creation failed validation.',
      );
    }

    const event = await Event.create({
        title,
        description: description ?? null,
        date: validatedDate!,
        created_by,
        category,
    });

    const createdEventWithCreator: Event | null = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      ],
    });

    res.status(201).json({ data: createdEventWithCreator ?? event });

  } catch (error: unknown) {
     if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const errors: Record<string, string> = {};
        const sequelizeError = error as SequelizeError;
        if (sequelizeError.errors && Array.isArray(sequelizeError.errors)) {
            sequelizeError.errors.forEach((err) => {
            if (err.path) {
                errors[err.path] = err.message;
            }
            });
        }
        return next(
            new ValidationError(
            errors,
            'Event creation failed database validation.',
            ),
        );
    }
     if (error instanceof Error && error.name === 'SequelizeForeignKeyConstraintError') {
      return next(
        new ValidationError(
          { created_by: `Invalid user specified. User may not exist.` },
          'Failed to create event due to invalid creator reference.',
        ),
      );
    }
    next(error);
  }
};

export const updateEvent = async (req: Request<ModifyEventParams, unknown, UpdateEventRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser || typeof authenticatedUser.id !== 'number') {
      return next(
        new ApiError(401, 'Authentication failed, user not found on request.'),
      );
    }

    const eventIdString = req.params.id;
    if (eventIdString === undefined) {
        throw new ApiError(400, 'Event ID parameter is missing in the request URL.');
    }
    const eventId = parseInt(eventIdString, 10);
    const userId = authenticatedUser.id;

    const { title, description, date: dateString, category } = req.body;
    if ('id' in req.body || 'created_by' in req.body) {
      throw new ValidationError(
        { general: 'Cannot modify event ID or creator (created_by) field via request body.' },
        'Invalid update request.',
      );
    }


    if (isNaN(eventId)) {
      throw new ValidationError({ id: 'Event ID must be a valid integer' });
    }

    const updateData: EventUpdateData = {};
    const validationErrors: Record<string, string> = {};
    let hasUpdate = false;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.length < 3 || title.length > 100) {
        validationErrors.title = 'Event title must be between 3 and 100 characters.';
      } else {
        updateData.title = title;
        hasUpdate = true;
      }
    }
    if (description !== undefined) {
      if (description !== null && (typeof description !== 'string' || description.length > 2000)) {
        validationErrors.description = 'Description cannot exceed 2000 characters.';
      } else {
        updateData.description = description;
        hasUpdate = true;
      }
    }
    if (dateString !== undefined) {
        const parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) {
            validationErrors.date = 'Invalid date format provided.';
        } else if (parsedDate <= new Date()) {
            validationErrors.date = 'Event date must be in the future.';
        } else {
            updateData.date = parsedDate;
            hasUpdate = true;
        }
    }
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        validationErrors.category = `Invalid category selected. Must be one of: ${VALID_CATEGORIES.join(', ')}`;
      } else {
        updateData.category = category;
        hasUpdate = true;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError(
        validationErrors,
        'Event update failed validation.',
      );
    }
     if (!hasUpdate) {
         if (Object.keys(req.body).length > 0) {
            throw new ValidationError(
                { general: 'No valid fields provided for update or invalid fields were sent.' },
                'Invalid update request.'
            );
         } else {
            throw new ValidationError(
              { general: 'Request body is empty. Provide at least one field to update (title, description, date, category).' },
              'Invalid update request.'
            );
          }
    }

    const existingEvent: Event | null = await Event.findByPk(eventId);
    if (!existingEvent) {
      throw new NotFoundError('Event');
    }

    const eventCreatorId = existingEvent.getDataValue('created_by');
    if (typeof eventCreatorId !== 'number' || eventCreatorId !== userId) {
           throw new ForbiddenError('You do not have permission to update this event.');
    }

    await existingEvent.update(updateData);

    const updatedEvent = await Event.findByPk(eventId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      ],
    });

    res.status(200).json({ data: updatedEvent });
  } catch (error: unknown) {
     if (error instanceof Error && error.name === 'SequelizeValidationError') {
        const errors: Record<string, string> = {};
        const sequelizeError = error as SequelizeError;
         if (sequelizeError.errors && Array.isArray(sequelizeError.errors)) {
          sequelizeError.errors.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
         }
        return next(
          new ValidationError(errors, 'Event update failed database validation.'),
        );
      }
    next(error);
  }
};

export const deleteEvent = async (req: Request<ModifyEventParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser || typeof authenticatedUser.id !== 'number') {
      return next(
        new ApiError(401, 'Authentication failed, user not found on request.'),
      );
    }

    const eventIdString = req.params.id;
    if (eventIdString === undefined) {
        throw new ApiError(400, 'Event ID parameter is missing in the request URL.');
    }
    const eventId = parseInt(eventIdString, 10);
    const userId = authenticatedUser.id;

    if (isNaN(eventId)) {
      throw new ValidationError({ id: 'Event ID must be a valid integer' });
    }

    const eventToDelete: Event | null = await Event.findByPk(eventId);

    if (!eventToDelete) {
      throw new NotFoundError('Event');
    }

    const eventCreatorId = eventToDelete.getDataValue('created_by');
    if (typeof eventCreatorId !== 'number' || eventCreatorId !== userId) {
           throw new ForbiddenError('You do not have permission to delete this event.');
    }

    const deletedCount: number = await Event.destroy({
      where: { id: eventId },
    });

    if (deletedCount === 0) {
      console.warn(
        `Attempted to delete event ${eventId} after ownership check, but destroy returned 0.`,
      );
      throw new NotFoundError('Event could not be deleted.');
    }

    res.status(204).end();
  } catch (error: unknown) {
    next(error);
  }
};