import Redis from "ioredis"
import Redlock from "redlock"
const upstashUrl = "rediss://default:gQAAAAAAAndzAAIgcDFkYzFlYmUwNGI1N2I0ZmNlOThkZGYwOTc3NTZhOTQ0MA@alert-foal-161651.upstash.io:6379";
export const redisClient = new Redis(process.env.REDIS_URL || upstashUrl||"redis://127.0.0.1:6379",{
    maxRetriesPerRequest: null, 
    enableReadyCheck: false,
    lazyConnect: false
})
redisClient.on("error", (err) => {
    console.error("Redis Connection Error:", err.message);
});

redisClient.on("connect", () => {
    console.log("Connected to Redis successfully!");
});
export const redlock = new Redlock([redisClient],{
    retryJitter:200,
    retryCount:3,
    driftFactor:0.01,
    retryDelay:200
})
