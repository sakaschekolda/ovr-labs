const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./db');
const User = require('./models/User');
const Event = require('./models/Event');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { ApiError, ValidationError, NotFoundError } = require('./errors');
const errorHandler = require('./errorHandler');

dotenv.config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'Events and users managing API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Иван Иванов' },
            email: { type: 'string', example: 'ivan@example.com' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Classic music concert' },
            description: { type: 'string', example: 'Event description' },
            date: { type: 'string', format: 'date-time' },
            category: { 
              type: 'string',
              enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport'],
              example: 'concert'
            },
            created_by: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error message' },
            errors: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(morgan('[API] :method :url :status - :response-time ms'));
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "Events API Documentation"
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server works',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email is already in use
 *       500:
 *         description: Server error
 */
app.post('/users', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email) {
      throw new ValidationError({
        name: !name ? 'Name is required' : null,
        email: !email ? 'Email is required' : null
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError({
        email: 'Invalid email format'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    const user = await User.create({ 
      name, 
      email,
      password: password || null
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users list
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events list
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport']
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Event list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Server error
 */
app.get('/events', async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = {};
    
    if (category) {
      where.category = category;
    }

    const events = await Event.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }],
      order: [['date', 'ASC']]
    });
    
    res.status(200).json({
      status: 'success',
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/categories:
 *   get:
 *     summary: Get available event categories
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
app.get('/events/categories', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      categories: ['concert', 'lecture', 'exhibition', 'master class', 'sport']
    }
  });
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
app.get('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }]
    });
    
    if (!event) {
      throw new NotFoundError('Event');
    }
    
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - created_by
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               created_by:
 *                 type: integer
 *               category:
 *                 type: string
 *                 enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport']
 *     responses:
 *       201:
 *         description: Event was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */
app.post('/events', async (req, res, next) => {
  try {
    const { title, description, date, created_by, category } = req.body;
    
    if (!title || !date || !created_by || !category) {
      throw new ValidationError({
        title: !title ? 'Title is required' : null,
        date: !date ? 'Date is required' : null,
        created_by: !created_by ? 'Creator ID is required' : null,
        category: !category ? 'Category is required' : null
      }, 'Missing required fields');
    }

    const event = await Event.create({ 
      title, 
      description, 
      date, 
      created_by, 
      category 
    });
    
    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Updated event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
app.put('/events/:id', async (req, res, next) => {
  try {
    const { title, description, date, category } = req.body;
    
    if (!title && !description && !date && !category) {
      throw new ValidationError({}, 'At least one field to update is required');
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (category) updateData.category = category;

    const [updated] = await Event.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      throw new NotFoundError('Event');
    }
    
    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
app.delete('/events/:id', async (req, res, next) => {
  try {
    const deleted = await Event.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      throw new NotFoundError('Event');
    }
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  next(new NotFoundError('Endpoint'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Database connection established');
    try {
      await User.sync({ alter: true });
      await Event.sync({ alter: true });
      console.log('✅ All models synchronized');
    } catch (syncError) {
      console.error('❌ Model sync error:', syncError);
      process.exit(1);
    }
    
    app.listen(PORT, (error) => {
      if (error) {
        console.error('Error occurred on server start', error);
        process.exit(1);
      } else {
        console.log(`✅ Server is on port ${PORT}`);
        console.log(`➡️  API: http://localhost:${PORT}`);
        console.log(`📚 Docs: http://localhost:${PORT}/api-docs`);
      }
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
    process.exit(1);
  });