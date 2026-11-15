"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cart } from "@/lib/cart-store";
import { cx, formatINR } from "@/lib/format";
import {
  deliveryEstimate,
  discountPercent,
  WARRANTY_PLANS,
  warrantyPlan,
} from "@/lib/pricing";
import { site } from "@/lib/site";
import type { Product, WarrantyPlanId } from "@/lib/types";
import { toast, ui } from "@/lib/ui-store";
import { QtyStepper } from "../cart/qty-stepper";
import {
  BatteryIcon,
  BoltIcon,
  CartIcon,
  IconHover,
  LockIcon,
  RenewIcon,
  ShieldCheckIcon,
  TruckIcon,
  useHover,
} from "../motion-icons";
import { WishlistButton } from "../product-card";
import { CheckGlyph, GradeBadge, PriceTag, Rating, buttonClass } from "../ui";

const EASE = [0.16, 1, 0.3, 1] as const;

function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const images = product.images;

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-line bg-ink-3">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[index]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Image
              src={images[index]}
              alt={`${product.name}, photo ${index + 1} of ${images.length}`}
              fill
              preload={index === 0}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
          {product.grade && <GradeBadge grade={product.grade} withLabel />}
          {product.badge && (
            <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold tracking-wide text-ink">
              {product.badge}
            </span>
          )}
        </div>
        <WishlistButton
          slug={product.slug}
          name={product.name}
          size={20}
          className="absolute right-4 top-4 size-11"
        />
        {images.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 font-mono text-xs text-fog backdrop-blur">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="group" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={cx(
                "relative aspect-[4/3] overflow-hidden rounded-2xl border bg-ink-3 transition-[border-color,opacity]",
                i === index ? "border-lime" : "border-line opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="(min-width: 1024px) 14vw, 25vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<ReturnType<typeof deliveryEstimate> | null>(null);

  return (
    <div className="rounded-3xl border border-line bg-ink-2 p-5">
      <p className="flex items-center gap-2.5 font-medium">
        <TruckIcon size={22} className="text-lime" playOnView /> Check delivery to your PIN code
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const estimate = deliveryEstimate(pin);
          setResult(estimate);
          if (estimate.ok) cart.setPincode(pin);
        }}
      >
        <label htmlFor="pincode" className="sr-only">
          PIN code
        </label>
        <input
          id="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setResult(null);
          }}
          placeholder="e.g. 823001"
          className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-ink-3 px-5 tabular-nums outline-none placeholder:text-mist focus:border-lime"
        />
        <button type="submit" className={buttonClass("dark", "sm", "h-11 px-5")}>
          Check
        </button>
      </form>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cx("overflow-hidden text-sm", result.ok ? "text-lime" : "text-ember")}
            role="status"
          >
            <span className="block pt-3">{result.message}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductView({ product }: { product: Product }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [warranty, setWarranty] = useState<WarrantyPlanId>("standard");
  const [qty, setQty] = useState(1);
  const [cartHover, bindCart] = useHover();
  const [showBar, setShowBar] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setShowBar(y > 640));

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const isComputer = product.category !== "accessory";
  const plan = warrantyPlan(isComputer ? warranty : "standard");
  const off = discountPercent(variant.price, variant.mrp);
  const soldOut = variant.stock <= 0;
  const unitTotal = variant.price + plan.price;

  const addToCart = () => {
    const { added, capped } = cart.add({
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      brand: product.brand,
      variantLabel: variant.label,
      image: product.images[0],
      category: product.category,
      price: variant.price,
      mrp: variant.mrp,
      stock: variant.stock,
      qty,
      warranty: plan.id,
    });
    if (added === 0) {
      toast("You already have every unit we have in your cart", { tone: "info" });
      return false;
    }
    if (capped) toast(`Only ${added} more available, added those`, { tone: "info" });
    return true;
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <Gallery product={product} />

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            {product.brand} · {product.sku}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-fog">{product.tagline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Rating value={product.rating} count={product.reviews} />
            {soldOut ? (
              <span className="text-sm text-ember">Sold out</span>
            ) : variant.stock <= 3 ? (
              <span className="flex items-center gap-2 text-sm text-ember">
                <span className="size-1.5 rounded-full bg-ember" /> Only {variant.stock} left
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-lime">
                <span className="size-1.5 rounded-full bg-lime" /> In stock, ships today
              </span>
            )}
          </div>

          <div className="mt-7 border-y border-line py-6">
            <PriceTag price={variant.price} mrp={variant.mrp} size="lg" />
            <p className="mt-2 text-sm text-fog">
              Inclusive of GST
              {off > 0 && (
                <>
                  {" "}
                  · You save <span className="font-medium text-lime">{formatINR(variant.mrp - variant.price)}</span>
                </>
              )}
              {variant.price >= 10000 && (
                <> · EMI from {formatINR(Math.ceil(variant.price / 12))}/month</>
              )}
            </p>
          </div>

          {product.variants.length > 1 && (
            <fieldset className="mt-7">
              <legend className="text-sm font-medium text-fog">Configuration</legend>
              <div className="mt-3 grid grid-cols-1 gap-2.5">
                {product.variants.map((v) => {
                  const selected = v.id === variant.id;
                  return (
                    <label
                      key={v.id}
                      className={cx(
                        "relative flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-colors",
                        selected ? "border-lime bg-lime/[0.06]" : "border-line-strong hover:border-snow/30",
                        v.stock <= 0 && "opacity-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="variant"
                        value={v.id}
                        checked={selected}
                        onChange={() => {
                          setVariantId(v.id);
                          setQty(1);
                        }}
                        className="peer sr-only"
                      />
                      <span className="flex items-center gap-3">
                        <span
                          className={cx(
                            "grid size-5 shrink-0 place-items-center rounded-full border peer-focus-visible:outline",
                            selected ? "border-lime bg-lime text-ink" : "border-line-strong",
                          )}
                        >
                          {selected && <CheckGlyph size={12} strokeWidth={3} />}
                        </span>
                        <span>
                          <span className="block font-medium">{v.label}</span>
                          {v.stock <= 0 && <span className="text-sm text-ember">Sold out</span>}
                        </span>
                      </span>
                      <span className="font-medium tabular-nums">{formatINR(v.price)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {isComputer && (
            <fieldset className="mt-7">
              <legend className="flex items-center gap-2 text-sm font-medium text-fog">
                <ShieldCheckIcon size={18} className="text-lime" /> Warranty
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {WARRANTY_PLANS.map((p) => {
                  const selected = p.id === warranty;
                  return (
                    <label
                      key={p.id}
                      className={cx(
                        "cursor-pointer rounded-2xl border px-4 py-3.5 text-center transition-colors",
                        selected ? "border-lime bg-lime/[0.06]" : "border-line-strong hover:border-snow/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="warranty"
                        value={p.id}
                        checked={selected}
                        onChange={() => setWarranty(p.id)}
                        className="sr-only"
                      />
                      <span className="block font-medium">{p.label}</span>
                      <span className="block text-xs text-fog">{p.detail}</span>
                      <span className={cx("mt-1 block text-sm tabular-nums", selected && "text-lime")}>
                        {p.price === 0 ? "Free" : `+ ${formatINR(p.price)}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} stock={Math.max(variant.stock, 1)} label={product.name} onChange={setQty} />
            <button
              type="button"
              {...bindCart}
              disabled={soldOut}
              onClick={() => {
                if (addToCart()) ui.openCart();
              }}
              className={buttonClass("primary", "lg", "min-w-[200px] flex-1")}
            >
              <CartIcon size={20} active={cartHover} strokeWidth={1.9} />
              {soldOut ? "Sold out" : `Add to cart · ${formatINR(unitTotal * qty)}`}
            </button>
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              if (addToCart()) router.push("/checkout");
            }}
            className={buttonClass("ghost", "lg", "mt-3 w-full")}
          >
            <BoltIcon size={18} className="text-lime" /> Buy it now
          </button>

          <div className="mt-6">
            <PincodeCheck />
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line text-sm">
            {[
              { Icon: ShieldCheckIcon, title: `${product.warrantyMonths}-month warranty`, note: "By our own technicians" },
              { Icon: RenewIcon, title: `${site.policies.replacementDays}-day replacement`, note: "If it is not as described" },
              { Icon: TruckIcon, title: "Insured delivery", note: "Free across India" },
              { Icon: LockIcon, title: "Secure checkout", note: "UPI, cards, pay on delivery" },
            ].map(({ Icon, title, note }) => (
              <IconHover as="li" key={title} className="flex items-start gap-3 bg-ink p-4">
                <Icon size={22} className="mt-0.5 text-lime" />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-fog">{note}</span>
                </span>
              </IconHover>
            ))}
          </ul>

          {product.batteryHealth && (
            <div className="mt-6 rounded-3xl border border-line bg-ink-2 p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2.5 font-medium">
                  <BatteryIcon size={24} className="text-lime" playOnView /> Battery health
                </p>
                <p className="text-2xl font-semibold tabular-nums text-lime">{product.batteryHealth}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-lime"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${product.batteryHealth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE }}
                />
              </div>
              <p className="mt-2.5 text-sm text-fog">
                Measured on our bench. Every unit ships with its own printed battery report.
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showBar && !soldOut && (
          <motion.div
            className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line-strong lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="shell flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fog">{variant.label}</p>
                <p className="font-semibold tabular-nums">{formatINR(unitTotal * qty)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (addToCart()) ui.openCart();
                }}
                className={buttonClass("primary", "md")}
              >
                Add to cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
