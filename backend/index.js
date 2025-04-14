require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const sequelize = require('./db');
const { NotFoundError, UnauthorizedError } = require('./error/errors');
const errorHandler = require('./error/errorHandler');
const passport = require('./config/passport');
const mainApiRouter = require('./routes');
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.js');

const requiredEnvDb = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnvDb = requiredEnvDb.filter(key => !process.env[key]);
if (missingEnvDb.length > 0) {
  console.error(`❌ Missing required environment variables for database connection: ${missingEnvDb.join(', ')}`);
  console.error("   Please ensure they are defined in your .env file or system environment.");
  process.exit(1);
}

const requiredEnvApp = ['JWT_SECRET'];
const missingEnvApp = requiredEnvApp.filter(key => !process.env[key]);
if (missingEnvApp.length > 0) {
  console.error(`❌ Missing required environment variables for application: ${missingEnvApp.join(', ')}`);
  console.error("   Please ensure they are defined in your .env file or system environment.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API for managing Users and Events with JWT Authentication (Public and Protected Routes)',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    tags: [
        { name: 'Authentication', description: 'User registration and login' },
        { name: 'Public Events', description: 'Publicly accessible event endpoints' },
        { name: 'Protected Events', description: 'Event management endpoints requiring authentication' },
        { name: 'Users', description: 'User management endpoints (listing and role changes require Admin Role). User creation via /auth/register.' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**'
        }
      },
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
            role: { // Добавим роль в схему для ответа
              type: 'string',
              enum: ['user', 'admin'],
              readOnly: true,
              example: 'user'
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
              description: 'ID of the user who created (Read Only after creation)',
              example: 1,
              readOnly: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true
            },
             creator: {
               type: 'object',
               readOnly: true,
               properties: {
                 id: { type: 'integer' },
                 name: { type: 'string'},
                 role: { type: 'string', enum: ['user', 'admin'] } // Добавим роль создателя
               }
             }
          },
          required: ['title', 'date', 'category']
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
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerSpec,
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /\/api-docs|\/auth\/login|\/auth\/register/
  })
);

app.use('/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Events API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        securityDefinitions: {
             BearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'Enter JWT token **_only_**, prefixed with "Bearer "'
            }
        },
        security: [{ BearerAuth: [] }]
    }
  })
);

app.use((err, req, res, next) => {
  if (err.status && err.errors) {
     console.error("OpenAPI Validation Error:", err.errors);
     return res.status(err.status).json({
        message: err.message || 'Request validation failed',
        errors: err.errors.map(e => ({
            path: e.path,
            message: e.message
        }))
     });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.status === 401) {
     console.error("JWT/Auth Error:", err.message);
     const authError = (err instanceof UnauthorizedError) ? err : new UnauthorizedError(err.message || 'Authentication Failed');
     return next(authError);
  }

  next(err);
});

app.use('/auth', authRoutes);
app.use('/', publicRoutes);
app.use('/', mainApiRouter);

app.use((req, res, next) => {
  if (!res.headersSent) {
    next(new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} not found`));
  }
});

app.use(errorHandler);

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