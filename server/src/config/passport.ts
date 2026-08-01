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
          const randomSuffix = Math.floor(100 + Math.random() * 900);
          const username = `user_${Date.now()}${randomSuffix}`;
          user = await createUser({ username, email, password: null });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
