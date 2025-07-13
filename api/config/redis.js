const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT, 10)
  : 6379;

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

module.exports = {
  redisClient,
  redisConnection,
};