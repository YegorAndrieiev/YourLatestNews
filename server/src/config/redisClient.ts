import { createClient } from 'redis';
import { env } from './env.js';
const redisClient = createClient({
  url: env.REDIS_URL,
});
redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () =>
  console.log('🚀 Redis successfully connected!'),
);
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
};
connectRedis();
export default redisClient;
