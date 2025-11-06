import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
  if (redisClient) {
    return redisClient;
  }

  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  const redisPassword = process.env.REDIS_PASSWORD;

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
  if (redisPub) {
    await redisPub.quit();
    redisPub = null;
  }
  if (redisSub) {
    await redisSub.quit();
    redisSub = null;
  }
};

/**
 * Get Redis Publisher client for Pub/Sub
 * Used for broadcasting messages across multiple server instances
 */
export const getRedisPublisher = (): Redis => {
  if (!redisPub) {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    const redisPassword = process.env.REDIS_PASSWORD;

    redisPub = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisPub.on('error', (err) => {
      logger.error('Redis Publisher Error', err);
    });

    redisPub.on('connect', () => {
      logger.info('Redis Publisher connected');
    });
  }
  return redisPub;
};

/**
 * Get Redis Subscriber client for Pub/Sub
 * Used for receiving broadcasted messages from other server instances
 */
export const getRedisSubscriber = (): Redis => {
  if (!redisSub) {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    const redisPassword = process.env.REDIS_PASSWORD;

    redisSub = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisSub.on('error', (err) => {
      logger.error('Redis Subscriber Error', err);
    });

    redisSub.on('connect', () => {
      logger.info('Redis Subscriber connected');
    });
  }
  return redisSub;
};
