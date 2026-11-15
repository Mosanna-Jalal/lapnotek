import type {
  CartLine,
  Coupon,
  DeliveryId,
  PaymentId,
  Totals,
  WarrantyPlanId,
} from "./types";

/**
 * Pricing rules shared by the browser (live cart totals) and the server
 * (authoritative totals when an order is placed).
 */

export const WARRANTY_PLANS: {
  id: WarrantyPlanId;
  label: string;
  detail: string;
  price: number;
}[] = [
  { id: "standard", label: "Standard", detail: "6 months included", price: 0 },
  { id: "plus12", label: "Care+ 12", detail: "Adds 12 months", price: 1499 },
  { id: "plus24", label: "Care+ 24", detail: "Adds 24 months", price: 2499 },
];

export const DELIVERY_OPTIONS: {
  id: DeliveryId;
  label: string;
  detail: string;
  fee: number;
}[] = [
  { id: "standard", label: "Standard delivery", detail: "3–6 days, insured, anywhere in India", fee: 0 },
  { id: "express", label: "Express delivery", detail: "1–2 days across Bihar & Jharkhand", fee: 249 },
  { id: "pickup", label: "Pick up at store", detail: "Ready in 2 hours at Gewal Bigha, Gaya", fee: 0 },
];

export const PAYMENT_OPTIONS: { id: PaymentId; label: string; detail: string }[] = [
  { id: "upi", label: "UPI", detail: "PhonePe, Paytm, GPay or any UPI app" },
  { id: "card", label: "Credit / debit card", detail: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net banking", detail: "All major Indian banks" },
  { id: "wallet", label: "Wallets", detail: "Paytm and PhonePe wallet" },
  { id: "cod", label: "Pay on delivery", detail: "Cash or UPI when it arrives" },
  { id: "store", label: "Pay at store", detail: "Reserve now, pay at pickup" },
];

export const GIFT_WRAP_FEE = 99;
export const SETUP_FEE = 299;
export const FREE_EXPRESS_THRESHOLD = 50000;
export const MAX_QTY_PER_LINE = 5;
const GST_RATE = 0.18;

export function warrantyPlan(id: WarrantyPlanId) {
  return WARRANTY_PLANS.find((p) => p.id === id) ?? WARRANTY_PLANS[0];
}

export function deliveryOption(id: DeliveryId) {
  return DELIVERY_OPTIONS.find((d) => d.id === id) ?? DELIVERY_OPTIONS[0];
}

export function paymentOption(id: PaymentId) {
  return PAYMENT_OPTIONS.find((p) => p.id === id) ?? PAYMENT_OPTIONS[0];
}

/** Warranty add-ons only apply to computers, not accessories. */
export function supportsWarranty(line: Pick<CartLine, "category">) {
  return line.category !== "accessory";
}

export function couponDiscount(coupon: Coupon | null, itemsTotal: number) {
  if (!coupon || itemsTotal < coupon.minSubtotal) return 0;
  const raw =
    coupon.type === "percent" ? Math.round((itemsTotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, coupon.maxDiscount ?? raw, itemsTotal);
}

export function couponError(coupon: Coupon, itemsTotal: number): string | null {
  if (itemsTotal < coupon.minSubtotal) {
    return `Add items worth ₹${(coupon.minSubtotal - itemsTotal).toLocaleString("en-IN")} more to use ${coupon.code}.`;
  }
  return null;
}

export function computeTotals(input: {
  lines: Pick<CartLine, "price" | "mrp" | "qty" | "warranty" | "category">[];
  coupon: Coupon | null;
  delivery: DeliveryId;
  giftWrap: boolean;
  setup: boolean;
}): Totals {
  let itemCount = 0;
  let mrpTotal = 0;
  let itemsTotal = 0;
  let warrantyTotal = 0;

  for (const line of input.lines) {
    itemCount += line.qty;
    mrpTotal += Math.max(line.mrp, line.price) * line.qty;
    itemsTotal += line.price * line.qty;
    if (supportsWarranty(line)) warrantyTotal += warrantyPlan(line.warranty).price * line.qty;
  }

  const addOnsTotal =
    itemCount === 0 ? 0 : (input.giftWrap ? GIFT_WRAP_FEE : 0) + (input.setup ? SETUP_FEE : 0);
  const discount = couponDiscount(input.coupon, itemsTotal);

  const option = deliveryOption(input.delivery);
  const expressIsFree = option.id === "express" && itemsTotal >= FREE_EXPRESS_THRESHOLD;
  const deliveryFee = itemCount === 0 || expressIsFree ? 0 : option.fee;

  const total = itemsTotal + warrantyTotal + addOnsTotal - discount + deliveryFee;
  const productSavings = mrpTotal - itemsTotal;

  return {
    itemCount,
    mrpTotal,
    itemsTotal,
    productSavings,
    warrantyTotal,
    addOnsTotal,
    couponDiscount: discount,
    deliveryFee,
    total,
    savings: productSavings + discount,
    gstIncluded: Math.round((total * GST_RATE) / (1 + GST_RATE)),
    emiPerMonth: Math.ceil(total / 12),
  };
}

export function discountPercent(price: number, mrp: number) {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Demo serviceability rules, keyed off the PIN code prefix. */
export function deliveryEstimate(pin: string): { ok: boolean; message: string; days: number } {
  if (!/^[1-9]\d{5}$/.test(pin)) {
    return { ok: false, message: "Enter a valid 6-digit PIN code.", days: 0 };
  }
  if (pin.startsWith("8230")) {
    return { ok: true, message: "Same-day delivery in Gaya, or pick up in 2 hours.", days: 0 };
  }
  if (/^8[0-5]/.test(pin)) {
    return { ok: true, message: "Delivers in 1–2 days across Bihar & Jharkhand.", days: 2 };
  }
  return { ok: true, message: "Delivers in 3–6 days with insured shipping.", days: 5 };
}
