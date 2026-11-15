"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { cart, useCart, useCartTotals } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { FREE_EXPRESS_THRESHOLD } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";
import { toast, ui, useUi } from "@/lib/ui-store";
import { QtyStepper } from "./cart/qty-stepper";
import { CtaLink } from "./motion";
import { CartIcon, LockIcon, TruckIcon } from "./motion-icons";
import { CloseGlyph, TrashGlyph, buttonClass } from "./ui";

/** Removes a line and offers a one-tap undo. Shared by the drawer and cart page. */
export function removeWithUndo(line: CartLine, index: number) {
  cart.remove(line.key);
  toast(`Removed ${line.name}`, {
    tone: "info",
    action: { label: "Undo", run: () => cart.restore(line, index) },
  });
}

export function ExpressProgress({ itemsTotal }: { itemsTotal: number }) {
  const remaining = Math.max(0, FREE_EXPRESS_THRESHOLD - itemsTotal);
  const progress = Math.min(1, itemsTotal / FREE_EXPRESS_THRESHOLD);
  return (
    <div className="rounded-2xl border border-line bg-ink-3 p-4">
      <p className="flex items-center gap-2 text-sm">
        <TruckIcon size={20} className="text-lime" loop={remaining > 0} active={remaining === 0} />
        {remaining > 0 ? (
          <span>
            Add <span className="font-semibold text-snow">{formatINR(remaining)}</span> more for free
            express delivery
          </span>
        ) : (
          <span className="font-medium text-lime">You have unlocked free express delivery</span>
        )}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-lime"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

function DrawerLine({ line, index }: { line: CartLine; index: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 overflow-hidden border-b border-line py-4"
    >
      <Link
        href={`/product/${line.slug}`}
        onClick={ui.closeCart}
        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-ink-3"
      >
        <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${line.slug}`}
            onClick={ui.closeCart}
            className="line-clamp-2 text-[15px] font-medium leading-snug hover:text-lime"
          >
            {line.name}
          </Link>
          <span className="shrink-0 font-medium tabular-nums">{formatINR(line.price * line.qty)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-fog">{line.variantLabel}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <QtyStepper
            size="sm"
            value={line.qty}
            stock={line.stock}
            label={line.name}
            onChange={(qty) => cart.setQty(line.key, qty)}
          />
          <button
            type="button"
            onClick={() => removeWithUndo(line, index)}
            aria-label={`Remove ${line.name}`}
            className="grid size-8 place-items-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-ember"
          >
            <TrashGlyph size={16} />
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export function CartDrawer() {
  const { cartOpen } = useUi();
  const { lines } = useCart();
  const totals = useCartTotals();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Your cart">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
            onClick={ui.closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-line-strong bg-ink-2 shadow-2xl shadow-black"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2.5 text-lg font-semibold">
                <CartIcon size={22} className="text-lime" playOnView />
                Your cart
                <span className="text-fog">({totals.itemCount})</span>
              </h2>
              <button
                type="button"
                autoFocus
                onClick={ui.closeCart}
                aria-label="Close cart"
                className="grid size-10 place-items-center rounded-full border border-line hover:border-line-strong"
              >
                <CloseGlyph />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid size-20 place-items-center rounded-full border border-line bg-ink-3 text-lime">
                  <CartIcon size={34} loop />
                </span>
                <p className="text-xl font-medium">Your cart is empty</p>
                <p className="text-fog">
                  Certified laptops from ₹16,013 are waiting. Pick one and it lands here.
                </p>
                <CtaLink href="/shop" onClick={ui.closeCart}>
                  Start shopping
                </CtaLink>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  <div className="pt-5">
                    <ExpressProgress itemsTotal={totals.itemsTotal} />
                  </div>
                  <ul className="mt-1">
                    <AnimatePresence initial={false}>
                      {lines.map((line, index) => (
                        <DrawerLine key={line.key} line={line} index={index} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="space-y-4 border-t border-line bg-ink-2 px-6 py-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-fog">Subtotal</p>
                      {totals.productSavings > 0 && (
                        <p className="text-sm text-lime">
                          You save {formatINR(totals.productSavings)}
                        </p>
                      )}
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">{formatINR(totals.itemsTotal)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/cart"
                      onClick={ui.closeCart}
                      className={buttonClass("ghost", "md")}
                    >
                      View cart
                    </Link>
                    <CtaLink href="/checkout" onClick={ui.closeCart}>
                      Checkout
                    </CtaLink>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-xs text-mist">
                    <LockIcon size={14} /> Coupons, delivery and add-ons on the next step
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
