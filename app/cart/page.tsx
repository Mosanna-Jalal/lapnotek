import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getPublicCoupons, getSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your cart, apply coupons, choose delivery and add warranty cover.",
};

export default async function CartPage() {
  const [offers, products] = await Promise.all([getPublicCoupons(), getSummaries()]);
  const extras = products.filter((product) => product.category === "accessory");
  return <CartView offers={offers} extras={extras} />;
}
