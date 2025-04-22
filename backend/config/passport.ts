import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import User from '../models/User.js';
import 'dotenv/config';

interface AppJwtPayload {
  id: number;
}

const jwtSecret: string = process.env.JWT_SECRET ?? '';

if (!jwtSecret) {
  console.error('❌ JWT_SECRET environment variable is not defined!');
  process.exit(1);
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(options, (jwt_payload: AppJwtPayload, done: VerifiedCallback) => {
    void (async () => {
      try {
        const user: User | null = await User.findByPk(jwt_payload.id);

        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          done(error, false);
        } else {
            done(new Error('An unknown error occurred during JWT verification'), false);
        }
      }
    })();
  }),
);

export default passport;