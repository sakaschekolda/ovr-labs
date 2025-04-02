const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sequelize = require('./db');
const User = require('./models/User');
const Event = require('./models/Event');
const { NotFoundError } = require('./error/errors');
const errorHandler = require('./error/errorHandler');
const mainApiRouter = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API for managing Users and Events (Refactored)',
    },
    servers: [ { url: `http://localhost:${PORT}`, description: 'Development server' } ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', readOnly: true, example: 1 },
            name: { type: 'string', example: 'Иван Иванов' },
            email: { type: 'string', format: 'email', example: 'ivan@example.com' },
            created_at: { type: 'string', format: 'date-time', readOnly: true }
          },
          required: ['id', 'name', 'email', 'created_at']
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', readOnly: true, example: 1 },
            title: { type: 'string', example: 'Classic music concert' },
            description: { type: 'string', nullable: true, example: 'Event description' },
            date: { type: 'string', format: 'date-time', example: '2024-10-26T20:00:00Z' },
            category: { type: 'string', enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport'], example: 'concert' },
            created_by: { type: 'integer', description: 'ID of the user who created', example: 1 },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
            creator: {
               type: 'object', readOnly: true, properties: {
                   id: { type: 'integer', example: 1 },
                   name: { type: 'string', example: 'Иван Иванов' }
               }
            }
          },
          required: ['id', 'title', 'date', 'category', 'created_by', 'created_at', 'creator']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Detailed error message' },
            errors: {
              type: 'object',
              description: 'Field-specific validation errors (if applicable)',
              additionalProperties: { type: 'string', example: 'Name is required' },
              nullable: true
            }
          },
          required: ['message']
        }
      }
    }
  },
  apis: ['./routes/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true, customSiteTitle: "Events API Documentation"
}));

app.use('/', mainApiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`Endpoint (${req.method} ${req.originalUrl}) not found.`));
});

app.use(errorHandler);

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Database connection established successfully.');
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ All models were synchronized successfully.');
    } catch (syncError) {
      console.error('❌ Unable to synchronize models with the database:', syncError);
      process.exit(1);
    }

    app.listen(PORT, (error) => {
      if (error) {
        console.error('❌ Error occurred while starting the server:', error);
        process.exit(1);
      } else {
        console.log(`✅ Server is listening on port ${PORT}`);
        console.log(`   API Base: http://localhost:${PORT}/`);
        console.log(`   Docs: http://localhost:${PORT}/api-docs`);
      }
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });