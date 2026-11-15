import { cacheLife, cacheTag } from "next/cache";
import { CATALOG, COUPONS } from "./catalog";
import { getDb } from "./mongodb";
import type { Coupon, Product } from "./types";

export type DataSource = "mongodb" | "demo";

interface CatalogResult {
  source: DataSource;
  products: Product[];
}

/** Mongo documents can carry BSON types; cached values must be plain JSON. */
function plain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * The whole catalogue, cached for a minute. It is small enough to filter in
 * memory, which keeps every listing page static and instant.
 */
async function loadCatalog(): Promise<CatalogResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const db = await getDb();
  if (db) {
    try {
      const docs = await db
        .collection("products")
        .find({}, { projection: { _id: 0 } })
        .sort({ sort: 1 })
        .toArray();
      if (docs.length > 0) return { source: "mongodb", products: plain<Product[]>(docs) };
    } catch (error) {
      console.warn("[lapnotek] Could not read products from MongoDB.", error);
    }
  }
  return { source: "demo", products: CATALOG };
}

export async function getProducts(): Promise<Product[]> {
  return (await loadCatalog()).products;
}

export async function getDataSource(): Promise<DataSource> {
  return (await loadCatalog()).source;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const others = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const score = (p: Product) =>
    (p.brand === product.brand ? 2 : 0) +
    p.useCases.filter((u) => product.useCases.includes(u)).length;
  return others.sort((a, b) => score(b) - score(a) || a.sort - b.sort).slice(0, limit);
}

/** Coupons are read fresh so a code switched off in the database stops working. */
export async function findCoupon(code: string): Promise<Coupon | null> {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return null;

  const db = await getDb();
  if (db) {
    try {
      const doc = await db
        .collection("coupons")
        .findOne({ code: wanted, active: { $ne: false } }, { projection: { _id: 0, active: 0 } });
      if (doc) return plain<Coupon>(doc);
      if ((await db.collection("coupons").estimatedDocumentCount()) > 0) return null;
    } catch (error) {
      console.warn("[lapnotek] Could not read coupons from MongoDB.", error);
    }
  }
  return COUPONS.find((c) => c.code === wanted) ?? null;
}

/** The lightweight shape used by cards, search, the wishlist and cart cross-sells. */
export interface ProductSummary {
  slug: string;
  name: string;
  brand: string;
  category: Product["category"];
  subcategory?: string;
  image: string;
  hoverImage?: string;
  price: number;
  mrp: number;
  grade?: Product["grade"];
  variantId: string;
  variantLabel: string;
  variantCount: number;
  stock: number;
  rating: number;
  reviews: number;
  tagline: string;
  badge?: string;
  deal: boolean;
  featured: boolean;
  useCases: Product["useCases"];
  highlights: string[];
  sort: number;
}

export function summarize(product: Product): ProductSummary {
  const first = product.variants[0];
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    image: product.images[0],
    hoverImage: product.images[1],
    price: first.price,
    mrp: first.mrp,
    grade: product.grade,
    variantId: first.id,
    variantLabel: first.label,
    variantCount: product.variants.length,
    stock: first.stock,
    rating: product.rating,
    reviews: product.reviews,
    tagline: product.tagline,
    badge: product.badge,
    deal: Boolean(product.deal),
    featured: Boolean(product.featured),
    useCases: product.useCases,
    highlights: product.highlights.slice(0, 3),
    sort: product.sort,
  };
}

export async function getSummaries(): Promise<ProductSummary[]> {
  return (await getProducts()).map(summarize);
}

/** Offers shown on the cart page. Validation always happens again on the server. */
export async function getPublicCoupons(): Promise<Coupon[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("coupons");

  const db = await getDb();
  if (db) {
    try {
      const docs = await db
        .collection("coupons")
        .find({ active: { $ne: false } }, { projection: { _id: 0, active: 0 } })
        .toArray();
      if (docs.length > 0) return plain<Coupon[]>(docs);
    } catch (error) {
      console.warn("[lapnotek] Could not read coupons from MongoDB.", error);
    }
  }
  return COUPONS;
}
