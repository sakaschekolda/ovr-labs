/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the user
 *           example: 1
 *         name:
 *           type: string
 *           description: User's full name
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role in the system
 *           example: "user"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the user was created
 *           example: "2024-03-15T14:30:00Z"
 *       required:
 *         - name
 *         - email
 *         - role
 *
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the event
 *           example: 1
 *         title:
 *           type: string
 *           description: Title of the event
 *           minLength: 3
 *           maxLength: 100
 *           example: "Summer Tech Conference"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the event
 *           maxLength: 2000
 *           example: "Annual web development conference with workshops and networking."
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the event (must be in the future)
 *           example: "2024-09-20T09:00:00Z"
 *         category:
 *           type: string
 *           enum: [concert, lecture, exhibition, 'master class', sport]
 *           description: Category of the event
 *           example: "lecture"
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the event
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the event was created
 *           example: "2024-03-15T14:30:00Z"
 *         creator:
 *           $ref: '#/components/schemas/User'
 *       required:
 *         - title
 *         - date
 *         - category
 *         - created_by
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: General error message
 *           example: "Validation failed."
 *         errors:
 *           type: object
 *           description: Detailed validation errors by field
 *           additionalProperties:
 *             type: string
 *           example:
 *             title: "Title is required"
 *             date: "Event date must be in the future"
 *       required:
 *         - message */

export const Event = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'The unique identifier for the event',
    },
    title: {
      type: 'string',
      description: 'The title of the event',
    },
    description: {
      type: 'string',
      description: 'The description of the event',
    },
    date: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time of the event',
    },
    category: {
      type: 'string',
      enum: ['concert', 'lecture', 'exhibition', 'master class', 'sport'],
      description: 'The category of the event',
    },
    created_by: {
      type: 'integer',
      description: 'ID of the user who created the event',
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'When the event was created',
    },
    creator: {
      $ref: '#/components/schemas/User',
    },
  },
  required: ['title', 'date', 'category', 'created_by'],
};

export const CreateEventRequest = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the event',
    },
    description: {
      type: 'string',
      description: 'The description of the event',
    },
    date: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time of the event',
    },
    location: {
      type: 'string',
      description: 'The location of the event',
    },
    category: {
      type: 'string',
      enum: ['CONCERT', 'THEATER', 'SPORT', 'EXHIBITION', 'OTHER'],
      description: 'The category of the event',
    },
    price: {
      type: 'number',
      description: 'The price of the event ticket',
    },
    image: {
      type: 'string',
      description: 'URL of the event image',
    },
  },
  required: ['title', 'description', 'date', 'location', 'category', 'price'],
};

export const UpdateEventRequest = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the event',
    },
    description: {
      type: 'string',
      description: 'The description of the event',
    },
    date: {
      type: 'string',
      format: 'date-time',
      description: 'The date and time of the event',
    },
    location: {
      type: 'string',
      description: 'The location of the event',
    },
    category: {
      type: 'string',
      enum: ['CONCERT', 'THEATER', 'SPORT', 'EXHIBITION', 'OTHER'],
      description: 'The category of the event',
    },
    price: {
      type: 'number',
      description: 'The price of the event ticket',
    },
    image: {
      type: 'string',
      description: 'URL of the event image',
    },
  },
};

export const LoginRequest = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
    },
    password: {
      type: 'string',
      description: 'User password',
    },
  },
  required: ['email', 'password'],
};

export const RegisterRequest = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
    },
    password: {
      type: 'string',
      description: 'User password',
    },
    name: {
      type: 'string',
      description: 'User full name',
    },
  },
  required: ['email', 'password', 'name'],
};

export const AuthResponse = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      description: 'JWT token for authentication',
    },
    user: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'User ID',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
        },
        name: {
          type: 'string',
          description: 'User full name',
        },
      },
    },
  },
};
