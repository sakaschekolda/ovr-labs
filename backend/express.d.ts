import User from './models/User';
declare global {
  namespace Express {
    export interface User extends User {}
    export interface Request {
      user?: User;
    }
  }
}

export {};