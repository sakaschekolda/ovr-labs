import { User } from '@models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module 'express' {
  export = e;
}

declare const e: Express.Application;
export = e;
