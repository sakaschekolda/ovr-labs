require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const sequelize = require('./db');
const { NotFoundError } = require('./error/errors');
const errorHandler = require('./error/errorHandler');
const mainApiRouter = require('./routes');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 5000;

// Конфигурация Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API for managing Users and Events',
    },
    servers: [
      { 
        url: `http://localhost:${PORT}`, 
        description: 'Development server' 
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', readOnly: true, example: 1 },
            name: { type: 'string', example: 'Иван Иванов' },
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'ivan@example.com' 
            },
            created_at: { 
              type: 'string', 
              format: 'date-time', 
              readOnly: true 
            }
          },
          required: ['name', 'email']
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', readOnly: true, example: 1 },
            title: { type: 'string', example: 'Classic music concert' },
            description: { 
              type: 'string', 
              nullable: true, 
              example: 'Event description' 
            },
            date: { 
              type: 'string', 
              format: 'date-time', 
              example: '2024-10-26T20:00:00Z' 
            },
            category: { 
              type: 'string', 
              enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport'], 
              example: 'concert' 
            },
            created_by: { 
              type: 'integer', 
              description: 'ID of the user who created', 
              example: 1 
            },
            created_at: { 
              type: 'string', 
              format: 'date-time', 
              readOnly: true 
            }
          },
          required: ['title', 'date', 'category', 'created_by']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { 
              type: 'string', 
              example: 'Detailed error message' 
            },
            errors: {
              type: 'object',
              additionalProperties: { 
                type: 'string', 
                example: 'Validation error description' 
              },
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

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Валидатор запросов на основе Swagger-спецификации
app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerSpec,
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /\/api-docs/ // Игнорируем эндпоинт документации
  })
);

// Документация API
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Events API Documentation'
  })
);

// Обработчик ошибок валидации
app.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors
    });
  }
  next(err);
});

// Маршруты API
app.use('/', mainApiRouter);

// Обработчик 404
app.use((req, res, next) => {
  next(new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} not found`));
});

// Финальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📄 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();