import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import {
  findUserByEmail,
  createUser,
} from '../repositories/auth.repository.js';

// Лог 1: Проверяем, правильный ли URL передается при старте сервера
console.log('[Passport Init] Google Callback URL:', env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Лог 2: Срабатывает, если Google успешно перенаправил обратно и передал профиль
      console.log('[Google Strategy] Отримано профіль від Google, ID:', profile.id);
      
      try {
        const email = profile.emails?.[0].value;
        console.log('[Google Strategy] Email користувача:', email);

        if (!email) {
          console.error('[Google Strategy Error] Email відсутній у профілі Google');
          return done(new Error('Email not found in Google profile'), false);
        }

        let user = await findUserByEmail(email);
        
        if (!user) {
          console.log('[Google Strategy] Користувач не знайдений, створюємо нового...');
          const username = profile.displayName || email?.split('@')[0] || 'User';
          user = await createUser({ username, email });
          console.log('[Google Strategy] Створено нового користувача з ID:', user.id);
        } else {
          console.log('[Google Strategy] Користувач знайдений в БД, ID:', user.id);
        }

        return done(null, user);
      } catch (error) {
        // Лог 3: Если упала база данных (findUserByEmail / createUser)
        console.error('[Google Strategy Error] Помилка під час обробки користувача:', error);
        return done(error, false);
      }
    },
  ),
);

export default passport;