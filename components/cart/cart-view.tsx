"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { applyCouponAction } from "@/app/actions";
import { cart, useCart, useCartTotals, useHydrated } from "@/lib/cart-store";
import type { ProductSummary } from "@/lib/data";
import { cx, formatINR } from "@/lib/format";
import {
  couponError,
  DELIVERY_OPTIONS,
  deliveryEstimate,
  FREE_EXPRESS_THRESHOLD,
  GIFT_WRAP_FEE,
  SETUP_FEE,
  supportsWarranty,
  WARRANTY_PLANS,
} from "@/lib/pricing";
import type { CartLine, Coupon, Totals } from "@/lib/types";
import { toast } from "@/lib/ui-store";
import { ExpressProgress, removeWithUndo } from "../cart-drawer";
import { CtaLink } from "../motion";
import {
  BoxIcon,
  CartIcon,
  HeartIcon,
  IconHover,
  LockIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
  WrenchIcon,
} from "../motion-icons";
import { AddButton } from "../product-card";
import { BookmarkGlyph, CheckGlyph, CloseGlyph, TrashGlyph, buttonClass } from "../ui";
import { QtyStepper } from "./qty-stepper";

const EASE = [0.16, 1, 0.3, 1] as const;

function LineRow({ line, index }: { line: CartLine; index: number }) {
  const hasSaving = line.mrp > line.price;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="overflow-hidden border-b border-line py-6 first:pt-0"
    >
      <div className="flex gap-4 sm:gap-6">
        <Link
          href={`/product/${line.slug}`}
          className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ink-3 sm:size-32"
        >
          <Image src={line.image} alt="" fill sizes="128px" className="object-cover" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{line.brand}</p>
              <Link
                href={`/product/${line.slug}`}
                className="mt-1 block text-lg font-medium leading-snug tracking-tight hover:text-lime"
              >
                {line.name}
              </Link>
              <p className="mt-0.5 text-sm text-fog">{line.variantLabel}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums">{formatINR(line.price * line.qty)}</p>
              {hasSaving && (
                <p className="text-sm text-mist line-through tabular-nums">
                  {formatINR(line.mrp * line.qty)}
                </p>
              )}
            </div>
          </div>

          {supportsWarranty(line) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-fog">
                <ShieldCheckIcon size={16} className="text-lime" /> Warranty
              </span>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Warranty for ${line.name}`}>
                {WARRANTY_PLANS.map((plan) => {
                  const selected = line.warranty === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => cart.setWarranty(line.key, plan.id)}
                      className={cx(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        selected
                          ? "border-lime bg-lime/10 text-lime"
                          : "border-line-strong text-fog hover:text-snow",
                      )}
                    >
                      {plan.label}
                      {plan.price > 0 && <span className="tabular-nums"> +{formatINR(plan.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <QtyStepper
              value={line.qty}
              stock={line.stock}
              label={line.name}
              onChange={(qty) => cart.setQty(line.key, qty)}
            />
            {line.qty >= line.stock && (
              <span className="text-xs text-ember">Only {line.stock} in stock</span>
            )}
            <div className="ml-auto flex items-center gap-1 text-sm text-fog">
              <button
                type="button"
                onClick={() => {
                  cart.saveForLater(line.key);
                  toast("Saved for later", { tone: "info" });
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-white/5 hover:text-snow"
              >
                <BookmarkGlyph size={15} /> <span className="hidden sm:inline">Save for later</span>
              </button>
              <IconHover as="span">
                <button
                  type="button"
                  onClick={() => {
                    cart.moveToWishlist(line.key);
                    toast("Moved to your wishlist");
                  }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-white/5 hover:text-snow"
                >
                  <HeartIcon size={15} /> <span className="hidden sm:inline">Wishlist</span>
                </button>
              </IconHover>
              <button
                type="button"
                onClick={() => removeWithUndo(line, index)}
                aria-label={`Remove ${line.name}`}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-white/5 hover:text-ember"
              >
                <TrashGlyph size={15} /> <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  note,
  price,
  icon,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  note: string;
  price: number;
  icon: React.ReactNode;
}) {
  return (
    <IconHover>
      <label
        className={cx(
          "flex cursor-pointer items-center gap-4 rounded-3xl border p-5 transition-colors",
          checked ? "border-lime bg-lime/[0.06]" : "border-line hover:border-line-strong",
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-line-strong bg-ink-3 text-lime">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{title}</span>
          <span className="block text-sm text-fog">{note}</span>
        </span>
        <span className="text-sm tabular-nums text-fog">+{formatINR(price)}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cx(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime",
            checked ? "bg-lime" : "bg-white/15",
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
            className={cx(
              "absolute top-1 size-5 rounded-full",
              checked ? "right-1 bg-ink" : "left-1 bg-snow",
            )}
          />
        </span>
      </label>
    </IconHover>
  );
}

function CouponBox({ offers, itemsTotal, coupon }: { offers: Coupon[]; itemsTotal: number; coupon: Coupon | null }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const apply = (raw: string) => {
    const wanted = raw.trim().toUpperCase();
    if (!wanted) {
      setError("Enter a coupon code.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await applyCouponAction(wanted, itemsTotal);
        if (result.ok) {
          cart.applyCoupon(result.coupon);
          setCode("");
          toast(`${result.coupon.code} applied`);
        } else {
          setError(result.error);
        }
      } catch {
        setError("We could not check that code. Please try again.");
      }
    });
  };

  const stale = coupon ? couponError(coupon, itemsTotal) : null;

  return (
    <div>
      <p className="flex items-center gap-2 font-medium">
        <TagIcon size={20} className="text-lime" playOnView /> Coupon
      </p>

      {coupon ? (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-lime/50 bg-lime/[0.06] px-4 py-3">
            <span className="min-w-0">
              <span className="block font-mono text-sm font-semibold tracking-wider text-lime">
                {coupon.code}
              </span>
              <span className="block truncate text-xs text-fog">{coupon.description}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                cart.removeCoupon();
                toast("Coupon removed", { tone: "info" });
              }}
              aria-label={`Remove coupon ${coupon.code}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-fog hover:bg-white/10 hover:text-snow"
            >
              <CloseGlyph size={15} />
            </button>
          </div>
          {stale && <p className="mt-2 text-sm text-ember">{stale}</p>}
        </div>
      ) : (
        <>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              apply(code);
            }}
          >
            <label htmlFor="coupon" className="sr-only">
              Coupon code
            </label>
            <input
              id="coupon"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="Enter code"
              autoComplete="off"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "coupon-error" : undefined}
              className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-ink-3 px-5 font-mono text-sm tracking-wider outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-mist focus:border-lime"
            />
            <button type="submit" disabled={pending} className={buttonClass("dark", "sm", "h-11 px-5")}>
              {pending ? "Checking…" : "Apply"}
            </button>
          </form>
          {error && (
            <p id="coupon-error" className="mt-2 text-sm text-ember" role="alert">
              {error}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {offers.map((offer) => {
              const eligible = itemsTotal >= offer.minSubtotal;
              return (
                <li key={offer.code}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => apply(offer.code)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line px-4 py-2.5 text-left transition-colors hover:border-lime/40"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-xs font-semibold tracking-wider">{offer.code}</span>
                      <span className="block truncate text-xs text-fog">{offer.description}</span>
                    </span>
                    <span className={cx("shrink-0 text-xs font-medium", eligible ? "text-lime" : "text-mist")}>
                      {eligible ? "Apply" : `Add ${formatINR(offer.minSubtotal - itemsTotal)}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function DeliveryPicker({ itemsTotal }: { itemsTotal: number }) {
  const { delivery, pincode } = useCart();
  const estimate = pincode ? deliveryEstimate(pincode) : null;
  return (
    <fieldset>
      <legend className="flex items-center gap-2 font-medium">
        <TruckIcon size={20} className="text-lime" playOnView /> Delivery
      </legend>
      <div className="mt-3 space-y-2">
        {DELIVERY_OPTIONS.map((option) => {
          const selected = delivery === option.id;
          const free = option.fee === 0 || (option.id === "express" && itemsTotal >= FREE_EXPRESS_THRESHOLD);
          return (
            <label
              key={option.id}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                selected ? "border-lime bg-lime/[0.06]" : "border-line hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="delivery"
                value={option.id}
                checked={selected}
                onChange={() => cart.setDelivery(option.id)}
                className="peer sr-only"
              />
              <span
                className={cx(
                  "grid size-5 shrink-0 place-items-center rounded-full border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-lime",
                  selected ? "border-lime bg-lime text-ink" : "border-line-strong",
                )}
              >
                {selected && <CheckGlyph size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">{option.label}</span>
                <span className="block text-xs text-fog">{option.detail}</span>
              </span>
              <span className={cx("text-sm tabular-nums", free && "font-medium text-lime")}>
                {free ? "Free" : formatINR(option.fee)}
              </span>
            </label>
          );
        })}
      </div>
      {estimate?.ok && delivery !== "pickup" && (
        <p className="mt-2 text-xs text-fog">
          To {pincode}: {estimate.message}
        </p>
      )}
    </fieldset>
  );
}

export function TotalsList({ totals, couponCode }: { totals: Totals; couponCode?: string | null }) {
  const rows: { label: string; value: string; tone?: "save" }[] = [
    { label: `Price (${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"})`, value: formatINR(totals.mrpTotal) },
  ];
  if (totals.productSavings > 0)
    rows.push({ label: "Lapnotek discount", value: `− ${formatINR(totals.productSavings)}`, tone: "save" });
  if (totals.couponDiscount > 0)
    rows.push({ label: `Coupon ${couponCode ?? ""}`.trim(), value: `− ${formatINR(totals.couponDiscount)}`, tone: "save" });
  if (totals.warrantyTotal > 0) rows.push({ label: "Care+ warranty", value: formatINR(totals.warrantyTotal) });
  if (totals.addOnsTotal > 0) rows.push({ label: "Add-ons", value: formatINR(totals.addOnsTotal) });
  rows.push({
    label: "Delivery",
    value: totals.deliveryFee === 0 ? "Free" : formatINR(totals.deliveryFee),
    tone: totals.deliveryFee === 0 ? "save" : undefined,
  });

  return (
    <dl className="space-y-3 text-[15px]">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4">
          <dt className="text-fog">{row.label}</dt>
          <dd className={cx("tabular-nums", row.tone === "save" && "text-lime")}>{row.value}</dd>
        </div>
      ))}
      <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
        <dt>
          <span className="block text-lg font-semibold">Total</span>
          <span className="block text-xs text-mist">
            Includes {formatINR(totals.gstIncluded)} GST
          </span>
        </dt>
        <dd className="relative h-9 overflow-hidden text-3xl font-semibold tracking-tight tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={totals.total}
              className="block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {formatINR(totals.total)}
            </motion.span>
          </AnimatePresence>
        </dd>
      </div>
    </dl>
  );
}

function CartSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px]" aria-busy="true">
      <div className="space-y-5">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="skeleton h-36 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton h-[420px] rounded-[32px]" />
    </div>
  );
}

export function CartView({ offers, extras }: { offers: Coupon[]; extras: ProductSummary[] }) {
  const hydrated = useHydrated();
  const state = useCart();
  const totals = useCartTotals();
  const { lines, saved } = state;

  const clearCart = () => {
    const snapshot = lines;
    cart.clear();
    toast("Cart cleared", {
      tone: "info",
      action: { label: "Undo", run: () => cart.replaceLines(snapshot) },
    });
  };

  const inCart = new Set(lines.map((l) => l.slug));
  const suggestions = extras.filter((p) => !inCart.has(p.slug)).slice(0, 4);

  return (
    <div className="shell pb-8 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Your <span className="accent">cart</span>
          </h1>
          {hydrated && lines.length > 0 && (
            <p className="mt-3 text-fog">
              {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} · you are saving{" "}
              <span className="font-medium text-lime">{formatINR(totals.savings)}</span>
            </p>
          )}
        </div>
        {hydrated && lines.length > 0 && (
          <button type="button" onClick={clearCart} className={buttonClass("ghost", "sm")}>
            <TrashGlyph size={15} /> Clear cart
          </button>
        )}
      </div>

      {!hydrated ? (
        <CartSkeleton />
      ) : lines.length === 0 ? (
        <div className="mt-10 rounded-[36px] border border-line bg-ink-2 px-6 py-20 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full border border-line-strong bg-ink-3 text-lime">
            <CartIcon size={36} loop />
          </span>
          <p className="mt-6 text-2xl font-medium tracking-tight">Nothing in here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-fog">
            Browse certified laptops, desktops and accessories. Your cart is saved on this device.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CtaLink href="/shop">Start shopping</CtaLink>
            {state.wishlist.length > 0 && (
              <CtaLink href="/wishlist" variant="ghost">
                View wishlist ({state.wishlist.length})
              </CtaLink>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-14">
          <div>
            <ExpressProgress itemsTotal={totals.itemsTotal} />

            <ul className="mt-6">
              <AnimatePresence initial={false}>
                {lines.map((line, index) => (
                  <LineRow key={line.key} line={line} index={index} />
                ))}
              </AnimatePresence>
            </ul>

            <section className="mt-8" aria-labelledby="extras-heading">
              <h2 id="extras-heading" className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
                Order extras
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Toggle
                  checked={state.setup}
                  onChange={cart.setSetup}
                  title="Ready-to-use setup"
                  note="Updates, drivers and your apps installed"
                  price={SETUP_FEE}
                  icon={<WrenchIcon size={22} />}
                />
                <Toggle
                  checked={state.giftWrap}
                  onChange={cart.setGiftWrap}
                  title="Gift wrap"
                  note="Premium box with a handwritten note"
                  price={GIFT_WRAP_FEE}
                  icon={<BoxIcon size={22} />}
                />
              </div>
              <label htmlFor="order-note" className="mt-5 block text-sm text-fog">
                Note for our team (optional)
              </label>
              <textarea
                id="order-note"
                rows={2}
                maxLength={300}
                value={state.note}
                onChange={(e) => cart.setNote(e.target.value)}
                placeholder="Preferred delivery time, software to install, a gift message…"
                className="mt-2 w-full resize-none rounded-2xl border border-line-strong bg-ink-3 px-5 py-3 outline-none placeholder:text-mist focus:border-lime"
              />
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Order summary">
            <div className="space-y-7 rounded-[32px] border border-line-strong bg-ink-2 p-6 sm:p-7">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <CouponBox offers={offers} itemsTotal={totals.itemsTotal} coupon={state.coupon} />
              <DeliveryPicker itemsTotal={totals.itemsTotal} />
              <div className="border-t border-line pt-6">
                <TotalsList totals={totals} couponCode={state.coupon?.code} />
              </div>

              {totals.savings > 0 && (
                <p className="rounded-2xl bg-lime/10 px-4 py-3 text-center text-sm text-lime">
                  You save {formatINR(totals.savings)} on this order
                </p>
              )}

              <CtaLink href="/checkout" size="lg" className="w-full">
                Proceed to checkout
              </CtaLink>
              <p className="text-center text-xs text-mist">
                or pay about {formatINR(totals.emiPerMonth)}/month with 12-month EMI
              </p>
              <p className="flex items-center justify-center gap-2 text-xs text-fog">
                <LockIcon size={14} className="text-lime" /> Secure checkout · UPI, cards, net banking, pay on delivery
              </p>
            </div>
            <Link href="/shop" className="mt-4 block text-center text-sm text-fog underline-offset-4 hover:text-snow hover:underline">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}

      {hydrated && saved.length > 0 && (
        <section className="mt-16" aria-labelledby="saved-heading">
          <h2 id="saved-heading" className="text-2xl font-semibold tracking-tight">
            Saved for later <span className="text-fog">({saved.length})</span>
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {saved.map((line) => (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex gap-4 rounded-3xl border border-line bg-ink-2 p-4"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-ink-3"
                  >
                    <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{line.name}</p>
                    <p className="truncate text-sm text-fog">{line.variantLabel}</p>
                    <p className="mt-1 font-medium tabular-nums">{formatINR(line.price)}</p>
                    <div className="mt-2 flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          cart.moveToCart(line.key);
                          toast("Moved back to your cart");
                        }}
                        className="font-medium text-lime hover:underline"
                      >
                        Move to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => cart.removeSaved(line.key)}
                        className="text-fog hover:text-ember"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      )}

      {hydrated && lines.length > 0 && suggestions.length > 0 && (
        <section className="mt-16" aria-labelledby="addons-heading">
          <h2 id="addons-heading" className="text-2xl font-semibold tracking-tight">
            Complete your <span className="accent">setup</span>
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((product) => (
              <li
                key={product.slug}
                className="flex items-center gap-4 rounded-3xl border border-line bg-ink-2 p-3 pr-4"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-ink-3"
                >
                  <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-sm tabular-nums text-fog">{formatINR(product.price)}</p>
                </div>
                <AddButton product={product} className="h-10 min-w-10 px-2.5 text-xs" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
