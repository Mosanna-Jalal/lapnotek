"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { subscribeAction } from "@/app/actions";
import { IDLE_FORM } from "@/lib/action-types";
import type { ProductSummary } from "@/lib/data";
import { cx, formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { ProductCard } from "../product-card";
import { CheckGlyph, ChevronGlyph, buttonClass } from "../ui";

const EASE = [0.16, 1, 0.3, 1] as const;

const TABS = [
  { id: "bestsellers", label: "Bestsellers" },
  { id: "deals", label: "Biggest savings" },
  { id: "student", label: "For students" },
  { id: "gaming", label: "Gaming" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Tabbed product rail with a sliding pill and a re-flowing grid. */
export function FeaturedTabs({ products }: { products: ProductSummary[] }) {
  const [tab, setTab] = useState<TabId>("bestsellers");

  const visible = useMemo(() => {
    const computers = products.filter((p) => p.category !== "accessory");
    const pick = {
      bestsellers: () => computers.filter((p) => p.featured),
      deals: () =>
        [...computers].sort(
          (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
        ),
      student: () => computers.filter((p) => p.useCases.includes("student")),
      gaming: () => computers.filter((p) => p.useCases.includes("gaming")),
    }[tab];
    return pick().slice(0, 8);
  }, [products, tab]);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Featured collections"
        className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "relative shrink-0 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors",
              tab === t.id ? "text-ink" : "text-fog hover:text-snow",
            )}
          >
            {tab === t.id && (
              <motion.span
                layoutId="featured-pill"
                className="absolute inset-0 rounded-full bg-lime"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((product, i) => (
            <motion.div
              key={`${tab}-${product.slug}`}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: EASE }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Milliseconds until the end of the coming Sunday (Monday 00:00, India time). */
function untilWeekEnd(now: number) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now + IST_OFFSET);
  const daysLeft = (8 - ist.getUTCDay()) % 7 || 7;
  const end = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + daysLeft);
  return end - IST_OFFSET - now;
}

/** Ticks down to the end of the week. Renders dashes until it has mounted. */
export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(untilWeekEnd(Date.now()));
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const total = left === null ? null : Math.max(0, Math.floor(left / 1000));
  const parts = [
    { label: "Days", value: total === null ? null : Math.floor(total / 86400) },
    { label: "Hours", value: total === null ? null : Math.floor((total % 86400) / 3600) },
    { label: "Mins", value: total === null ? null : Math.floor((total % 3600) / 60) },
    { label: "Secs", value: total === null ? null : total % 60 },
  ];

  return (
    <div className="flex gap-2" role="timer" aria-label="Time left on this deal">
      {parts.map((part) => (
        <div
          key={part.label}
          className="w-16 rounded-2xl border border-line-strong bg-ink/60 py-2.5 text-center backdrop-blur"
        >
          <div className="relative h-8 overflow-hidden text-2xl font-semibold tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={part.value ?? "–"}
                className="absolute inset-0"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {part.value === null ? "––" : String(part.value).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
            {part.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Two bars that grow into view to compare the new price with ours. */
export function SavingsBars({ price, mrp }: { price: number; mrp: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const ratio = Math.max(0.12, price / mrp);

  return (
    <div ref={ref} className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-fog">
          <span>Brand new</span>
          <span className="tabular-nums line-through">{formatINR(mrp)}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-white/35"
            initial={{ width: 0 }}
            animate={{ width: inView ? "100%" : 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-lime">Lapnotek certified</span>
          <span className="font-semibold tabular-nums">{formatINR(price)}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-lime"
            initial={{ width: 0 }}
            animate={{ width: inView ? `${ratio * 100}%` : 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          />
        </div>
      </div>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-button-${i}`}
              className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight transition-colors hover:text-lime sm:text-xl"
            >
              {item.q}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={cx(
                  "grid size-9 shrink-0 place-items-center rounded-full border",
                  isOpen ? "border-lime bg-lime text-ink" : "border-line-strong text-snow",
                )}
              >
                <ChevronGlyph size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 leading-relaxed text-fog">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeAction, IDLE_FORM);

  if (state.status === "success") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-full border border-lime/40 bg-lime/10 px-5 py-4 text-lime"
        role="status"
      >
        <span className="grid size-7 place-items-center rounded-full bg-lime text-ink">
          <CheckGlyph size={14} />
        </span>
        {state.message}
      </motion.p>
    );
  }

  return (
    <form action={action} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "newsletter-error" : undefined}
          className="h-14 flex-1 rounded-full border border-line-strong bg-ink/60 px-6 outline-none transition-colors placeholder:text-mist focus:border-lime"
        />
        <button type="submit" disabled={pending} className={buttonClass("primary", "lg")}>
          {pending ? "Adding you…" : "Notify me"}
        </button>
      </div>
      {state.status === "error" && (
        <p id="newsletter-error" className="mt-3 pl-6 text-sm text-ember" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
