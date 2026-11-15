"use server";

import type {
  CouponResult,
  FormState,
  PlaceOrderInput,
  PlaceOrderResult,
} from "@/lib/action-types";
import { findCoupon, getProducts } from "@/lib/data";
import { getDb } from "@/lib/mongodb";
import { newOrderId, saveOrder } from "@/lib/orders";
import {
  computeTotals,
  couponError,
  DELIVERY_OPTIONS,
  MAX_QTY_PER_LINE,
  PAYMENT_OPTIONS,
  WARRANTY_PLANS,
} from "@/lib/pricing";
import type { CartLine, Order, OrderItem } from "@/lib/types";

/*
 * Server Functions are reachable by a plain POST, so every one of them treats
 * its arguments as untrusted and re-derives prices from the catalogue.
 */

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function indianMobile(value: unknown) {
  const digits = text(value, 20).replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export async function applyCouponAction(code: unknown, itemsTotal: unknown): Promise<CouponResult> {
  const wanted = text(code, 24).toUpperCase();
  const total = typeof itemsTotal === "number" && Number.isFinite(itemsTotal) ? itemsTotal : 0;
  if (!wanted) return { ok: false, error: "Enter a coupon code." };

  const coupon = await findCoupon(wanted);
  if (!coupon) return { ok: false, error: `“${wanted}” is not a valid code.` };

  const problem = couponError(coupon, total);
  if (problem) return { ok: false, error: problem };

  return { ok: true, coupon };
}

export async function placeOrderAction(raw: PlaceOrderInput): Promise<PlaceOrderResult> {
  const input = (raw ?? {}) as Partial<PlaceOrderInput>;
  const fields: Record<string, string> = {};

  const delivery = DELIVERY_OPTIONS.find((d) => d.id === input.delivery)?.id;
  const payment = PAYMENT_OPTIONS.find((p) => p.id === input.payment)?.id;
  if (!delivery || !payment) return { ok: false, error: "Choose a delivery and payment method." };

  const pickup = delivery === "pickup";
  if ((payment === "store" && !pickup) || (payment === "cod" && pickup)) {
    return { ok: false, error: "That payment method is not available for this delivery option." };
  }

  // Contact details
  const name = text(input.customer?.name, 80);
  const email = text(input.customer?.email, 120).toLowerCase();
  const phone = indianMobile(input.customer?.phone);
  if (name.length < 2) fields.name = "Enter your full name.";
  if (!phone) fields.phone = "Enter a valid 10-digit mobile number.";
  if (!EMAIL.test(email)) fields.email = "Enter a valid email address.";

  // Address (not needed for store pickup)
  const address = {
    line1: text(input.address?.line1, 120),
    line2: text(input.address?.line2, 120),
    city: text(input.address?.city, 60),
    state: text(input.address?.state, 60),
    pin: text(input.address?.pin, 6),
  };
  if (!pickup) {
    if (address.line1.length < 5) fields.line1 = "Enter your house number and street.";
    if (address.city.length < 2) fields.city = "Enter your city.";
    if (address.state.length < 2) fields.state = "Choose your state.";
    if (!/^[1-9]\d{5}$/.test(address.pin)) fields.pin = "Enter a valid 6-digit PIN code.";
  }

  const gstin = text(input.gstin, 15).toUpperCase();
  if (gstin && !GSTIN.test(gstin)) fields.gstin = "That GSTIN does not look right.";

  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "Please check the highlighted fields.", fields };
  }

  // Rebuild every line from the catalogue: never trust client-side prices.
  const requested = Array.isArray(input.lines) ? input.lines.slice(0, 30) : [];
  if (requested.length === 0) return { ok: false, error: "Your cart is empty." };

  const products = await getProducts();
  const items: OrderItem[] = [];
  const pricedLines: Pick<CartLine, "price" | "mrp" | "qty" | "warranty" | "category">[] = [];

  for (const line of requested) {
    const product = products.find((p) => p.slug === line?.slug);
    const variant = product?.variants.find((v) => v.id === line?.variantId);
    if (!product || !variant) {
      return { ok: false, error: "An item in your cart is no longer available. Please review it." };
    }
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: `Check the quantity for ${product.name}.` };
    }
    if (qty > variant.stock) {
      return {
        ok: false,
        error:
          variant.stock === 0
            ? `${product.name} just sold out.`
            : `Only ${variant.stock} of ${product.name} left in stock.`,
      };
    }
    const warranty =
      product.category === "accessory"
        ? "standard"
        : (WARRANTY_PLANS.find((p) => p.id === line.warranty)?.id ?? "standard");

    items.push({
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      image: product.images[0],
      price: variant.price,
      mrp: variant.mrp,
      qty,
      warranty,
    });
    pricedLines.push({
      price: variant.price,
      mrp: variant.mrp,
      qty,
      warranty,
      category: product.category,
    });
  }

  const itemsTotal = pricedLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const couponCode = text(input.couponCode, 24).toUpperCase();
  let coupon = null;
  if (couponCode) {
    coupon = await findCoupon(couponCode);
    const problem = coupon ? couponError(coupon, itemsTotal) : `${couponCode} is no longer valid.`;
    if (problem) return { ok: false, error: `${problem} Remove the coupon to continue.` };
  }

  const giftWrap = input.giftWrap === true;
  const setup = input.setup === true;

  const order: Order = {
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    status: "confirmed",
    customer: { name, phone: phone!, email },
    address,
    items,
    totals: computeTotals({ lines: pricedLines, coupon, delivery, giftWrap, setup }),
    delivery,
    payment,
    couponCode: coupon?.code ?? null,
    giftWrap,
    setup,
    note: text(input.note, 300),
    gstin,
  };

  await saveOrder(order);
  return { ok: true, orderId: order.id };
}

const ENQUIRY_TYPES = ["service", "bulk", "general"] as const;

export async function submitEnquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields: Record<string, string> = {};
  const type = ENQUIRY_TYPES.find((t) => t === formData.get("type")) ?? "general";
  const name = text(formData.get("name"), 80);
  const phone = indianMobile(formData.get("phone"));
  const email = text(formData.get("email"), 120).toLowerCase();
  const device = text(formData.get("device"), 120);
  const message = text(formData.get("message"), 1000);

  if (name.length < 2) fields.name = "Enter your name.";
  if (!phone) fields.phone = "Enter a valid 10-digit mobile number.";
  if (email && !EMAIL.test(email)) fields.email = "Enter a valid email address.";
  if (message.length < 10) fields.message = "Tell us a little more so we can help.";
  if (Object.keys(fields).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", fields };
  }

  const reference = `SR-${newOrderId().slice(4, 8)}`;
  const db = await getDb();
  if (db) {
    try {
      await db.collection("enquiries").insertOne({
        reference,
        type,
        name,
        phone,
        email,
        device,
        message,
        status: "new",
        createdAt: new Date(),
      });
    } catch (error) {
      console.warn("[lapnotek] Could not save the enquiry to MongoDB.", error);
    }
  }

  return {
    status: "success",
    message: `Thanks ${name.split(" ")[0]}, your request ${reference} is with our team. We will call you back within working hours.`,
  };
}

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData.get("email"), 120).toLowerCase();
  if (!EMAIL.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const db = await getDb();
  if (db) {
    try {
      await db
        .collection("subscribers")
        .updateOne({ email }, { $setOnInsert: { email, createdAt: new Date() } }, { upsert: true });
    } catch (error) {
      console.warn("[lapnotek] Could not save the subscriber to MongoDB.", error);
    }
  }

  return { status: "success", message: "You are on the list. Watch your inbox for fresh arrivals." };
}
