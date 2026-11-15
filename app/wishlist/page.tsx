import type { Metadata } from "next";
import { WishlistView } from "@/components/order-bits";
import { Eyebrow } from "@/components/ui";
import { getSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "Products you have saved for later.",
};

export default async function WishlistPage() {
  const products = await getSummaries();
  return (
    <div className="shell pb-8 pt-10 sm:pt-14">
      <Eyebrow>Saved for later</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Your <span className="accent">wishlist</span>
      </h1>
      <div className="mt-10">
        <WishlistView products={products} />
      </div>
    </div>
  );
}
