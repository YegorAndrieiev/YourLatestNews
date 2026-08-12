import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import cronRoutes from './routes/cron.routes';
import cookieParser from 'cookie-parser';
const app = express();
app.use(
  cors({
    origin: env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/cron', cronRoutes);
app.get('/', (req, res) => {
  res.send('Serenity API is running');
});
app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT}`);
});
