export type Category = "laptop" | "desktop" | "accessory";
export type Grade = "A+" | "A" | "B";
export type UseCase = "student" | "business" | "gaming" | "creator" | "everyday";

export interface Variant {
  id: string;
  label: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: Category;
  subcategory?: string;
  tagline: string;
  description: string;
  images: string[];
  grade?: Grade;
  variants: Variant[];
  specs: [label: string, value: string][];
  highlights: string[];
  useCases: UseCase[];
  rating: number;
  reviews: number;
  badge?: string;
  featured?: boolean;
  deal?: boolean;
  batteryHealth?: number;
  warrantyMonths: number;
  inBox: string[];
  /** Lower numbers are listed first. */
  sort: number;
}

export type WarrantyPlanId = "standard" | "plus12" | "plus24";
export type DeliveryId = "standard" | "express" | "pickup";
export type PaymentId = "upi" | "card" | "netbanking" | "wallet" | "cod" | "store";

export interface CartLine {
  /** `${slug}:${variantId}` */
  key: string;
  slug: string;
  variantId: string;
  name: string;
  brand: string;
  variantLabel: string;
  image: string;
  category: Category;
  price: number;
  mrp: number;
  stock: number;
  qty: number;
  warranty: WarrantyPlanId;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  maxDiscount?: number;
  minSubtotal: number;
  description: string;
}

export interface CartState {
  lines: CartLine[];
  saved: CartLine[];
  wishlist: string[];
  coupon: Coupon | null;
  delivery: DeliveryId;
  pincode: string;
  giftWrap: boolean;
  setup: boolean;
  note: string;
}

export interface Totals {
  itemCount: number;
  mrpTotal: number;
  itemsTotal: number;
  productSavings: number;
  warrantyTotal: number;
  addOnsTotal: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
  savings: number;
  gstIncluded: number;
  emiPerMonth: number;
}

export interface OrderItem {
  slug: string;
  variantId: string;
  name: string;
  variantLabel: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
  warranty: WarrantyPlanId;
}

export type OrderStatus = "confirmed" | "packed" | "shipped" | "out-for-delivery" | "delivered";

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pin: string };
  items: OrderItem[];
  totals: Totals;
  delivery: DeliveryId;
  payment: PaymentId;
  couponCode: string | null;
  giftWrap: boolean;
  setup: boolean;
  note: string;
  gstin: string;
}
