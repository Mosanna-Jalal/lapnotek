import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/components/product-card";
import { ShopClient } from "@/components/shop/shop-client";
import { Eyebrow } from "@/components/ui";
import { getSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop certified laptops, desktops and accessories",
  description:
    "Browse tested and graded laptops, desktops and accessories from HP, Dell, Lenovo, Apple and more. Filter by brand, budget, condition and use.",
};

function ShopSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-11 w-32 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-9 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Awaiting `searchParams` here renders the grid at request time, so the HTML
 * for a shared link such as /shop?brand=Dell already contains the filtered
 * products. After that, filtering is instant and entirely client-side.
 */
async function ShopResults({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  await searchParams;
  const products = await getSummaries();
  return <ShopClient products={products} />;
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="shell pb-8 pt-10 sm:pt-14">
      <header className="max-w-3xl">
        <Eyebrow>The shelf</Eyebrow>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
          Certified machines, <span className="accent">ready today.</span>
        </h1>
        <p className="mt-4 text-lg text-fog">
          Every listing is a real unit that has passed our bench. Filter by what matters to you.
        </p>
      </header>
      <div className="mt-10">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
