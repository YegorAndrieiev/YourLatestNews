import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import {
  findUserByEmail,
  createUser,
} from '../repositories/auth.repository.js';
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('Email not found in Google profile'), false);
        }
        let user = await findUserByEmail(email);
        if (!user) {
          const username =
            profile.displayName || email?.split('@')[0] || 'User';
          user = await createUser({ username, email });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
