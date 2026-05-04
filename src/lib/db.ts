import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

export class DatabaseConnectionError extends Error {
  code = "DATABASE_CONNECTION_FAILED";
  status = 503;
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DatabaseConnectionError";
    this.cause = cause;
  }
}

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: CachedConnection;
};

const cache = globalWithMongoose.mongooseCache ?? { conn: null, promise: null };
globalWithMongoose.mongooseCache = cache;

export async function connectToDatabase() {
  if (!uri) {
    throw new DatabaseConnectionError("MONGODB_URI is required");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw new DatabaseConnectionError(getDatabaseErrorMessage(error), error);
  }
}

function getDatabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to connect to MongoDB";

  if (message.toLowerCase().includes("authentication failed") || message.toLowerCase().includes("bad auth")) {
    return "MongoDB authentication failed. Check MONGODB_URI username and password.";
  }

  if (message.includes("querySrv") || message.includes("ENOTFOUND")) {
    return "MongoDB host could not be resolved. Check the cluster hostname in MONGODB_URI.";
  }

  if (message.includes("Server selection timed out")) {
    return "MongoDB connection timed out. Check Atlas Network Access and allow 0.0.0.0/0 for Vercel.";
  }

  return message;
}
