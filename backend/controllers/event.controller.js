const Event = require('../models/Event');
const User = require('../models/User');
const { ApiError, ValidationError, NotFoundError } = require('../error/errors');
const VALID_CATEGORIES = ['concert', 'lecture', 'exhibition', 'master class', 'sport'];

exports.getAllEvents = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = {};

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
          throw new ValidationError({ category: `Invalid category query parameter. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      where.category = category;
    }

    const events = await Event.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['date', 'ASC']]
    });

    res.status(200).json({
      count: events.length,
      data: events
    });
  } catch (error) {
     if (error instanceof ValidationError || error.name === 'ValidationError') {
       return next(error);
     }
     next(error);
  }
};

exports.getEventCategories = (req, res) => {
  try {
    res.status(200).json({
      data: {
        categories: VALID_CATEGORIES
      }
    });
  } catch (error) {
      next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    if (isNaN(parseInt(eventId))) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: { id: 'Event ID must be an integer' }
      });    }

    const event = await Event.findByPk(eventId, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
    });

    if (!event) {
      throw new NotFoundError('Event');
    }

    res.status(200).json({ data: event });
  } catch (error) {
     if (error instanceof ValidationError || error.name === 'ValidationError' ||
         error instanceof NotFoundError || error.name === 'NotFoundError') {
       return next(error);
     }
     next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, created_by, category } = req.body;

    const validationErrors = {};
    if (!title) validationErrors.title = 'Title is required';

    if (!date) {
      validationErrors.date = 'Date is required';
    } else if (isNaN(Date.parse(date))) {
       validationErrors.date = 'Invalid date format provided.';
    } else if (new Date(date) <= new Date()) {
       validationErrors.date = 'Event date must be in the future.';
    }

    if (created_by === undefined || created_by === null) {
        validationErrors.created_by = 'Creator ID (created_by) is required';
    } else if (isNaN(parseInt(created_by))) {
         validationErrors.created_by = 'Creator ID must be an integer';
    }

    if (!category) {
        validationErrors.category = 'Category is required';
    } else if (!VALID_CATEGORIES.includes(category)) {
         validationErrors.category = `Invalid category selected. Must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }
    if (created_by && !isNaN(parseInt(created_by))) {
        const creatorExists = await User.findByPk(created_by);
        if (!creatorExists) {
            validationErrors.created_by = `User with ID ${created_by} not found. Cannot create event.`;
        }
    }
    if (description && description.length > 2000) {
       validationErrors.description = 'Description cannot exceed 2000 characters.';
    }

    if (Object.keys(validationErrors).length > 0) {
        throw new ValidationError(validationErrors, 'Event creation failed validation.');
    }

    const event = await Event.create({
      title,
      description: description || null,
      date,
      created_by,
      category
    });
    const createdEventWithCreator = await Event.findByPk(event.id, {
       include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
    });

    res.status(201).json({ data: createdEventWithCreator || event });

  } catch (error) {
    if (error instanceof ValidationError || error.name === 'ValidationError') {
        return next(error);
    }

    if (error.name === 'SequelizeValidationError') {
        const errors = {};
        error.errors.forEach(err => { errors[err.path] = err.message; });
        return next(new ValidationError(errors, 'Event creation failed database validation.'));
    }
     if (error.name === 'SequelizeForeignKeyConstraintError') {
         return next(new ValidationError({ created_by: `Invalid user specified (ID: ${req.body.created_by}). User may not exist.` }, 'Failed to create event due to invalid creator reference.'));
     }
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const { title, description, date, category } = req.body;
        const { id: bodyId, created_by: bodyCreatedBy } = req.body;
        const eventId = req.params.id;

        if (isNaN(parseInt(eventId))) {
            throw new ValidationError({ id: "Event ID in URL must be an integer" });
        }
        if (bodyId !== undefined || bodyCreatedBy !== undefined) {
            throw new ApiError(403, 'Cannot modify event ID or creator (created_by) field via request body.');
        }

        const updateData = {};
        const validationErrors = {};
        let hasUpdate = false;

        if (title !== undefined) {
            if (typeof title !== 'string' || title.length < 3 || title.length > 100) {
                validationErrors.title = 'Event title must be between 3 and 100 characters.'
            } else { updateData.title = title; hasUpdate = true; }
        }
        if (description !== undefined) {
             if (description !== null && (typeof description !== 'string' || description.length > 2000)) {
                 validationErrors.description = 'Description cannot exceed 2000 characters.'
             } else { updateData.description = description; hasUpdate = true; }
        }
        if (date !== undefined) {
            if (isNaN(Date.parse(date))) { validationErrors.date = 'Invalid date format provided.'; }
            else if (new Date(date) <= new Date()) { validationErrors.date = 'Event date must be in the future.'; }
            else { updateData.date = date; hasUpdate = true; }
         }
        if (category !== undefined) {
            if (!VALID_CATEGORIES.includes(category)) { validationErrors.category = `Invalid category selected. Must be one of: ${VALID_CATEGORIES.join(', ')}`; }
            else { updateData.category = category; hasUpdate = true; }
        }

        if (Object.keys(validationErrors).length > 0) {
            throw new ValidationError(validationErrors, 'Event update failed validation.');
        }
        if (!hasUpdate && Object.keys(req.body).length > 0) {
            throw new ValidationError({}, 'No valid fields provided for update. Allowed fields are: title, description, date, category.');
        } else if (!hasUpdate) {
             throw new ValidationError({}, 'Request body is empty or contains only non-updatable fields.');
        }

        const existingEvent = await Event.findByPk(eventId);
        if (!existingEvent) {
            throw new NotFoundError('Event');
        }

        existingEvent.set(updateData);
        await existingEvent.save();
        const updatedEvent = await Event.findByPk(eventId, {
            include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
        });

        res.status(200).json({ data: updatedEvent });

    } catch (error) {
        if (error instanceof ValidationError || error.name === 'ValidationError' ||
            error instanceof NotFoundError || error.name === 'NotFoundError' ||
            error instanceof ApiError) {
            return next(error);
        }

        if (error.name === 'SequelizeValidationError') {
            const errors = {};
            error.errors.forEach(err => { errors[err.path] = err.message; });
            return next(new ValidationError(errors, 'Event update failed database validation.'));
        }
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
  try {
     const eventId = req.params.id;
      if (isNaN(parseInt(eventId))) {
         throw new ValidationError({ id: "Event ID must be an integer" });
     }

     const deletedCount = await Event.destroy({
         where: { id: eventId }
     });

     if (deletedCount === 0) {
       throw new NotFoundError('Event');
     }

     res.status(204).end();
  } catch (error) {
     if (error instanceof ValidationError || error.name === 'ValidationError' ||
         error instanceof NotFoundError || error.name === 'NotFoundError') {
         return next(error);
     }
    next(error);
  }
};