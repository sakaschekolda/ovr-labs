import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import sequelizeConnection from './db.js';
import { NotFoundError, UnauthorizedError } from './error/errors.js';
import errorHandler from './error/errorHandler.js';
import passport from './config/passport.js';
import mainApiRouter from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.js';

const requiredEnvDb: string[] = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
];
const missingEnvDb: string[] = requiredEnvDb.filter((key) => !process.env[key]);
if (missingEnvDb.length > 0) {
  console.error(
    `❌ Missing required environment variables for database connection: ${missingEnvDb.join(', ')}`,
  );
  console.error(
    '   Please ensure they are defined in your .env file or system environment.',
  );
  process.exit(1);
}

const requiredEnvApp: string[] = ['JWT_SECRET'];
const missingEnvApp: string[] = requiredEnvApp.filter(
  (key) => !process.env[key],
);
if (missingEnvApp.length > 0) {
  console.error(
    `❌ Missing required environment variables for application: ${missingEnvApp.join(', ')}`,
  );
  console.error(
    '   Please ensure they are defined in your .env file or system environment.',
  );
  process.exit(1);
}

const app: Express = express();
const portString: string = process.env.PORT || '5000';
const PORT: number = parseInt(portString, 10);

if (isNaN(PORT)) {
  console.error(`❌ Invalid PORT specified: ${portString}. Must be a number.`);
  process.exit(1);
}

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API for managing events',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  OpenApiValidator.middleware({
    // @ts-expect-error - swagger-jsdoc and express-openapi-validator types don't match perfectly
    apiSpec: swaggerSpec,
    validateRequests: true,
    validateResponses: false,
    ignorePaths: /\/api-docs|\/auth\/login|\/auth\/register/,
  }),
);

const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'Events API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
};
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

interface OpenApiError extends Error {
  status?: number;
  errors?: Array<{ path: string; message: string }>;
}
app.use(
  (
    err: OpenApiError | Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      err.status &&
      Array.isArray(err.errors)
    ) {
      console.error('OpenAPI Validation Error:', err.errors);
      res.status(err.status).json({
        message: err.message || 'Request validation failed',
        errors: err.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
      return;
    }
    if (
      err instanceof Error &&
      (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
    ) {
      console.error('JWT/Auth Error:', err.message);
      return next(
        new UnauthorizedError(err.message || 'Authentication Failed'),
      );
    }
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      err.status === 401
    ) {
      console.error('Passport Auth Error:', err.message || 'Unauthorized');
      return next(
        new UnauthorizedError(err.message || 'Authentication Failed'),
      );
    }

    next(err);
  },
);

app.use('/auth', authRoutes);
app.use('/', publicRoutes);
app.use('/', mainApiRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!res.headersSent) {
    next(
      new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} not found`),
    );
  }
});

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await sequelizeConnection.authenticate();
    console.log('✅ Database connection established');

    await sequelizeConnection.sync({ alter: true });
    console.log('✅ Database synchronized');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📄 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Server startup failed:', error.message);
      console.error(error.stack);
    } else {
      console.error('❌ Server startup failed with unknown error:', error);
    }
    process.exit(1);
  }
};

void startServer();
