import { User } from '@models/User.js';
import { Request as ExpressRequest } from 'express-serve-static-core';

declare module 'express' {
  interface Request extends ExpressRequest {
    user?: User;
  }
}

export {};
