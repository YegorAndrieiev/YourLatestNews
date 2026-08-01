import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { initCleanupCron } from './cron/taskCleanup';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';
import cookieParser from 'cookie-parser';
import { emailWorker } from './queues/email.worker';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use('/graphql', express.json(), expressMiddleware(server));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.get('/', (req, res) => {
  res.send('Serenity API is running');
});
initCleanupCron();
emailWorker.resume();
app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log('ENV URL:', env.DATABASE_URL);
  console.log('TYPE:', typeof env.DATABASE_URL);
});
