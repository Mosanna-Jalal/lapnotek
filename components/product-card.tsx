"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cart, useCart } from "@/lib/cart-store";
import type { ProductSummary } from "@/lib/data";
import { cx, formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { toast, ui } from "@/lib/ui-store";
import { CartIcon, HeartIcon, useHover } from "./motion-icons";
import { CheckGlyph, GradeBadge, Rating } from "./ui";

/** Adds the default configuration of a product and confirms with a toast. */
export function quickAdd(product: ProductSummary) {
  const { added, capped } = cart.add({
    slug: product.slug,
    variantId: product.variantId,
    name: product.name,
    brand: product.brand,
    variantLabel: product.variantLabel,
    image: product.image,
    category: product.category,
    price: product.price,
    mrp: product.mrp,
    stock: product.stock,
  });
  if (added === 0) {
    toast(`You already have the last ${product.name} in your cart`, { tone: "info" });
    return false;
  }
  toast(capped ? `Added ${added}. That is all we have in stock` : `${product.name} added to cart`, {
    action: { label: "View cart", run: ui.openCart },
  });
  return true;
}

export function WishlistButton({
  slug,
  name,
  className,
  size = 18,
}: {
  slug: string;
  name: string;
  className?: string;
  size?: number;
}) {
  const { wishlist } = useCart();
  const wished = wishlist.includes(slug);
  const [hovered, bind] = useHover();
  const [burst, setBurst] = useState(false);

  return (
    <button
      type="button"
      {...bind}
      aria-pressed={wished}
      aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(event) => {
        event.preventDefault();
        const listed = cart.toggleWishlist(slug);
        setBurst(true);
        setTimeout(() => setBurst(false), 700);
        toast(listed ? "Saved to your wishlist" : "Removed from wishlist", {
          tone: listed ? "success" : "info",
        });
      }}
      className={cx(
        "grid size-10 place-items-center rounded-full border border-line-strong bg-ink/60 backdrop-blur transition-colors hover:bg-ink",
        wished ? "text-ember" : "text-snow",
        className,
      )}
    >
      <HeartIcon size={size} filled={wished} active={hovered || burst} />
    </button>
  );
}

export function AddButton({ product, className }: { product: ProductSummary; className?: string }) {
  const [hovered, bind] = useHover();
  const [done, setDone] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      {...bind}
      disabled={soldOut}
      onClick={() => {
        if (!quickAdd(product)) return;
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
      className={cx(
        "relative grid h-11 min-w-11 place-items-center overflow-hidden rounded-full px-3 text-sm font-medium transition-colors",
        soldOut
          ? "border border-line text-mist"
          : done
            ? "bg-white text-ink"
            : "bg-lime text-ink hover:bg-white",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {soldOut ? (
          <span key="sold">Sold out</span>
        ) : done ? (
          <motion.span
            key="done"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <CheckGlyph size={18} />
          </motion.span>
        ) : (
          <motion.span
            key="add"
            className="flex items-center gap-1.5"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <CartIcon size={18} active={hovered} strokeWidth={1.9} />
            Add
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function ProductCard({
  product,
  eager = false,
  className,
}: {
  product: ProductSummary;
  eager?: boolean;
  className?: string;
}) {
  const off = discountPercent(product.price, product.mrp);
  const href = `/product/${product.slug}`;

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-ink-2 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong",
        className,
      )}
    >
      <Link
        href={href}
        prefetch
        className="relative block aspect-[4/3] overflow-hidden bg-ink-3"
        aria-label={product.name}
        tabIndex={-1}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 50vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-2/80 to-transparent" />
      </Link>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
        {product.grade && <GradeBadge grade={product.grade} />}
        {product.badge && (
          <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink">
            {product.badge}
          </span>
        )}
      </div>
      <WishlistButton slug={product.slug} name={product.name} className="absolute right-3 top-3" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
            {product.brand}
          </p>
          <Rating value={product.rating} count={product.reviews} className="text-xs" />
        </div>
        <h3 className="mt-2 text-[17px] font-medium leading-snug tracking-tight">
          <Link href={href} prefetch className="hover:text-lime">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-fog">
          {product.variantLabel === "Standard" ? product.tagline : product.variantLabel}
          {product.variantCount > 1 && (
            <span className="text-mist"> · +{product.variantCount - 1} more</span>
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xl font-semibold tracking-tight tabular-nums">
              {formatINR(product.price)}
            </p>
            {off > 0 && (
              <p className="mt-0.5 text-sm tabular-nums">
                <span className="text-mist line-through">{formatINR(product.mrp)}</span>{" "}
                <span className="font-medium text-lime">{off}% off</span>
              </p>
            )}
          </div>
          <AddButton product={product} />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-ink-2">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-5 w-4/5 rounded-full" />
        <div className="skeleton h-4 w-2/3 rounded-full" />
        <div className="skeleton mt-6 h-7 w-28 rounded-full" />
      </div>
    </div>
  );
}
