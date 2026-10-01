import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      // Fail fast on a degraded connection rather than hanging for minutes
      // on the driver's default retry/backoff window — a slow response is
      // worse than a quick, retryable error.
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 20_000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
