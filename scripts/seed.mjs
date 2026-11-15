/**
 * Loads the demo catalogue into MongoDB.
 *
 *   npm run seed            upsert products and coupons (safe to re-run)
 *   npm run seed -- --reset wipe the products and coupons collections first
 *
 * Reads MONGODB_URI and MONGODB_DB from .env. Orders, enquiries and
 * subscribers are never touched.
 */
import { MongoClient } from "mongodb";
import { CATALOG, COUPONS } from "../lib/catalog.ts";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "lapnotek";
const reset = process.argv.includes("--reset");

if (!uri) {
  console.error(
    "MONGODB_URI is empty. Paste your Atlas connection string into .env first, for example:\n" +
      '  MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/"',
  );
  process.exit(1);
}

const client = new MongoClient(uri, { appName: "lapnotek-seed", serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const products = db.collection("products");
  const coupons = db.collection("coupons");

  if (reset) {
    await Promise.all([products.deleteMany({}), coupons.deleteMany({})]);
    console.log("Cleared the products and coupons collections.");
  }

  const now = new Date();
  const productResult = await products.bulkWrite(
    CATALOG.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: { $set: { ...product, updatedAt: now }, $setOnInsert: { createdAt: now } },
        upsert: true,
      },
    })),
  );
  const couponResult = await coupons.bulkWrite(
    COUPONS.map((coupon) => ({
      updateOne: {
        filter: { code: coupon.code },
        update: { $set: coupon, $setOnInsert: { active: true, createdAt: now } },
        upsert: true,
      },
    })),
  );

  await Promise.all([
    products.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ category: 1, sort: 1 }),
    coupons.createIndex({ code: 1 }, { unique: true }),
    db.collection("orders").createIndex({ id: 1 }, { unique: true }),
    db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
  ]);

  console.log(
    `Seeded "${dbName}": ${productResult.upsertedCount} products added, ${productResult.modifiedCount} updated; ` +
      `${couponResult.upsertedCount} coupons added, ${couponResult.modifiedCount} updated.`,
  );
  console.log("Open MongoDB Compass and refresh the lapnotek database to see them.");
} catch (error) {
  console.error("Seeding failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
