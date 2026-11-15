import { randomInt } from "node:crypto";
import { getDb } from "./mongodb";
import type { Order } from "./types";

/**
 * Orders live in the `orders` collection. Without a database they are kept in
 * memory so the checkout flow still works end to end during a demo (they are
 * lost when the server restarts).
 */

const globalForOrders = globalThis as typeof globalThis & {
  __lapnotekOrders?: Map<string, Order>;
};

function memoryStore() {
  globalForOrders.__lapnotekOrders ??= new Map();
  return globalForOrders.__lapnotekOrders;
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newOrderId() {
  const pick = () => ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  const block = () => Array.from({ length: 4 }, pick).join("");
  return `LNK-${block()}-${block()}`;
}

export function normalizeOrderId(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export async function saveOrder(order: Order): Promise<"mongodb" | "memory"> {
  const db = await getDb();
  if (db) {
    try {
      await db.collection("orders").insertOne({ ...order, createdAtDate: new Date(order.createdAt) });
      return "mongodb";
    } catch (error) {
      console.warn("[lapnotek] Could not save the order to MongoDB, keeping it in memory.", error);
    }
  }
  memoryStore().set(order.id, order);
  return "memory";
}

export async function getOrder(rawId: string): Promise<Order | null> {
  const id = normalizeOrderId(rawId);
  if (!/^LNK-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return null;

  const fromMemory = memoryStore().get(id);
  if (fromMemory) return fromMemory;

  const db = await getDb();
  if (!db) return null;
  try {
    const doc = await db
      .collection("orders")
      .findOne({ id }, { projection: { _id: 0, createdAtDate: 0 } });
    return doc ? (JSON.parse(JSON.stringify(doc)) as Order) : null;
  } catch (error) {
    console.warn("[lapnotek] Could not read the order from MongoDB.", error);
    return null;
  }
}
