import { RequestHandler } from 'express';
import passport from 'passport';

export const authenticateJWT: RequestHandler = (req, res, next) => {
    const middleware = passport.authenticate('jwt', { session: false }) as RequestHandler;
    return middleware(req, res, next);
}; 