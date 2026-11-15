import { MongoClient, type Db } from "mongodb";

/**
 * One shared MongoClient per server process.
 *
 * The site never hard-fails without a database: when `MONGODB_URI` is missing
 * or the cluster cannot be reached, `getDb()` resolves to `null` and callers
 * fall back to the bundled demo catalogue.
 */

interface MongoState {
  promise: Promise<MongoClient> | null;
  retryAfter: number;
  warned: boolean;
}

const RETRY_DELAY_MS = 30_000;

const globalForMongo = globalThis as typeof globalThis & { __lapnotekMongo?: MongoState };

function state(): MongoState {
  globalForMongo.__lapnotekMongo ??= { promise: null, retryAfter: 0, warned: false };
  return globalForMongo.__lapnotekMongo;
}

export function databaseName() {
  return process.env.MONGODB_DB?.trim() || "lapnotek";
}

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  const mongo = state();
  if (!mongo.promise) {
    // After a failed attempt, wait a little before hammering the cluster again.
    if (performance.now() < mongo.retryAfter) return null;
    mongo.promise = new MongoClient(uri, {
      appName: "lapnotek-web",
      serverSelectionTimeoutMS: 6000,
    }).connect();
  }

  try {
    const client = await mongo.promise;
    return client.db(databaseName());
  } catch (error) {
    mongo.promise = null;
    mongo.retryAfter = performance.now() + RETRY_DELAY_MS;
    if (!mongo.warned) {
      mongo.warned = true;
      console.warn(
        `[lapnotek] MongoDB is unreachable, serving the demo catalogue instead. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    return null;
  }
}
