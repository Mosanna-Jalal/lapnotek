import type { Coupon, DeliveryId, PaymentId, WarrantyPlanId } from "./types";

export interface PlaceOrderInput {
  lines: { slug: string; variantId: string; qty: number; warranty: WarrantyPlanId }[];
  couponCode: string | null;
  delivery: DeliveryId;
  payment: PaymentId;
  giftWrap: boolean;
  setup: boolean;
  note: string;
  gstin: string;
  customer: { name: string; phone: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pin: string };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; fields?: Record<string, string> };

export type CouponResult = { ok: true; coupon: Coupon } | { ok: false; error: string };

export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  fields?: Record<string, string>;
}

export const IDLE_FORM: FormState = { status: "idle", message: "" };
