import 'module-alias/register';
import './tsconfig-paths';
import 'dotenv/config';
import express from 'express';
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import sequelizeConnection from '@config/db';
import { NotFoundError, UnauthorizedError } from '@utils/errors';
import errorHandler from '@utils/errorHandler';
import passport from '@config/passport';
import mainApiRouter from '@routes/index';
import authRoutes from '@routes/auth.routes';
import publicRoutes from '@routes/public';
import * as schemas from './swagger/schemas';

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

const app = express();
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
    components: {
      schemas: schemas,
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.ts', './swagger/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      `http://localhost:${PORT}`
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  OpenApiValidator.middleware({
    // @ts-expect-error Type mismatch between swagger-jsdoc and express-openapi-validator
    apiSpec: swaggerSpec as unknown as Record<string, unknown>,
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

type ErrorWithStatus = Error & { status?: number };

const errorMiddleware: ErrorRequestHandler = (
  err: OpenApiError | ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    err.status &&
    'errors' in err &&
    Array.isArray(err.errors)
  ) {
    console.error('OpenAPI Validation Error:', err.errors);
    res.status(err.status).json({
      message: err.message || 'Request validation failed',
      errors: err.errors.map((e: { path: string; message: string }) => ({
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
    const error = new UnauthorizedError(err.message || 'Authentication Failed');
    next(error);
    return;
  }
  if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
    console.error('Passport Auth Error:', err.message || 'Unauthorized');
    const error = new UnauthorizedError(err.message || 'Authentication Failed');
    next(error);
    return;
  }

  next(err);
};

app.use(errorMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', mainApiRouter);

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
