import { createClient } from "redis";

const { REDIS_USERNAME, REDIS_PASSWORD, REDIS_URL } = process.env;

const redis = createClient({
  url: REDIS_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    connectTimeout: 50000,
  },
});

redis.on("connect", () => {
  console.log("redis connected.");
});

redis.on("error", (err) => {
  console.error("redis error:", err);
});

await redis.connect();

export { redis };
