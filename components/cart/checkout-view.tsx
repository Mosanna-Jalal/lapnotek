"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrderAction } from "@/app/actions";
import { cart, useCart, useCartTotals, useHydrated } from "@/lib/cart-store";
import { cx, formatINR } from "@/lib/format";
import {
  DELIVERY_OPTIONS,
  FREE_EXPRESS_THRESHOLD,
  PAYMENT_OPTIONS,
  supportsWarranty,
  warrantyPlan,
} from "@/lib/pricing";
import { fullAddress, site } from "@/lib/site";
import type { PaymentId } from "@/lib/types";
import { CtaLink } from "../motion";
import { CartIcon, LockIcon, MapPinIcon, ShieldCheckIcon } from "../motion-icons";
import { CheckGlyph, buttonClass } from "../ui";
import { TotalsList } from "./cart-view";

const STATES = [
  "Bihar",
  "Jharkhand",
  "Uttar Pradesh",
  "West Bengal",
  "Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Chandigarh",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
];

const inputClass =
  "h-12 w-full rounded-2xl border border-line-strong bg-ink-3 px-4 outline-none transition-colors placeholder:text-mist focus:border-lime aria-[invalid=true]:border-ember";

function Field({
  label,
  name,
  error,
  optional,
  className,
  ...input
}: {
  label: string;
  name: string;
  error?: string;
  optional?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={`co-${name}`} className="mb-1.5 flex items-baseline justify-between text-sm text-fog">
        {label}
        {optional && <span className="text-xs text-mist">Optional</span>}
      </label>
      <input
        id={`co-${name}`}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `co-${name}-error` : undefined}
        className={inputClass}
        {...input}
      />
      {error && (
        <p id={`co-${name}-error`} className="mt-1.5 text-sm text-ember" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
      <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
        <span className="grid size-8 place-items-center rounded-full bg-lime font-mono text-sm text-ink">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  detail,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
  aside?: React.ReactNode;
}) {
  return (
    <label
      className={cx(
        "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors",
        checked ? "border-lime bg-lime/[0.06]" : "border-line-strong hover:border-snow/30",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cx(
          "grid size-5 shrink-0 place-items-center rounded-full border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-lime",
          checked ? "border-lime bg-lime text-ink" : "border-line-strong",
        )}
      >
        {checked && <CheckGlyph size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-fog">{detail}</span>
      </span>
      {aside}
    </label>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const state = useCart();
  const totals = useCartTotals();
  const [pending, startTransition] = useTransition();
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [wantsGst, setWantsGst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState(false);

  const pickup = state.delivery === "pickup";
  const payments = PAYMENT_OPTIONS.filter((p) => (pickup ? p.id !== "cod" : p.id !== "store"));
  const chosenPayment = payments.some((p) => p.id === payment) ? payment : payments[0].id;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "");
    setError(null);
    setFields({});

    startTransition(async () => {
      try {
        const result = await placeOrderAction({
          lines: state.lines.map((l) => ({
            slug: l.slug,
            variantId: l.variantId,
            qty: l.qty,
            warranty: l.warranty,
          })),
          couponCode: totals.couponDiscount > 0 ? (state.coupon?.code ?? null) : null,
          delivery: state.delivery,
          payment: chosenPayment,
          giftWrap: state.giftWrap,
          setup: state.setup,
          note: state.note,
          gstin: wantsGst ? value("gstin") : "",
          customer: { name: value("name"), phone: value("phone"), email: value("email") },
          address: {
            line1: value("line1"),
            line2: value("line2"),
            city: value("city"),
            state: value("state"),
            pin: value("pin"),
          },
        });

        if (result.ok) {
          setPlaced(true);
          router.push(`/order/${result.orderId}`);
          cart.clear();
          return;
        }
        setError(result.error);
        setFields(result.fields ?? {});
        const first = result.fields && Object.keys(result.fields)[0];
        if (first) document.getElementById(`co-${first}`)?.focus();
      } catch {
        setError("We could not place your order. Check your connection and try again.");
      }
    });
  };

  if (!hydrated) {
    return (
      <div className="shell grid grid-cols-1 gap-10 pb-8 pt-14 lg:grid-cols-[minmax(0,1fr)_420px]" aria-busy="true">
        <h1 className="sr-only">Checkout</h1>
        <div className="space-y-5">
          <div className="skeleton h-64 rounded-[32px]" />
          <div className="skeleton h-80 rounded-[32px]" />
        </div>
        <div className="skeleton h-[480px] rounded-[32px]" />
      </div>
    );
  }

  if (state.lines.length === 0) {
    return (
      <div className="shell pb-8 pt-14">
        <div className="rounded-[36px] border border-line bg-ink-2 px-6 py-20 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full border border-line-strong bg-ink-3 text-lime">
            <CartIcon size={36} loop />
          </span>
          <h1 className="mt-6 text-2xl font-medium tracking-tight">
            {placed ? "Placing your order…" : "Your cart is empty"}
          </h1>
          {!placed && (
            <>
              <p className="mx-auto mt-2 max-w-sm text-fog">Add something to your cart before checking out.</p>
              <div className="mt-8 flex justify-center">
                <CtaLink href="/shop">Browse the shop</CtaLink>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-8 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Check<span className="accent">out</span>
        </h1>
        <p className="rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          Demo checkout: no payment is taken
        </p>
      </div>

      <form
        onSubmit={submit}
        onChange={(event) => {
          // Change events bubble up from whichever field was edited.
          const field: EventTarget = event.target;
          const name =
            field instanceof HTMLInputElement || field instanceof HTMLSelectElement ? field.name : "";
          if (error) setError(null);
          if (name && fields[name]) {
            setFields((current) => {
              const next = { ...current };
              delete next[name];
              return next;
            });
          }
        }}
        noValidate
        className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-14"
      >
        <div className="space-y-5">
          <Step number={1} title="Your details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" autoComplete="name" required error={fields.name} className="sm:col-span-2" />
              <Field
                label="Mobile number"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile"
                required
                error={fields.phone}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="For your invoice"
                required
                error={fields.email}
              />
            </div>
          </Step>

          <Step number={2} title="Delivery">
            <div className="grid grid-cols-1 gap-2.5">
              {DELIVERY_OPTIONS.map((option) => {
                const free =
                  option.fee === 0 ||
                  (option.id === "express" && totals.itemsTotal >= FREE_EXPRESS_THRESHOLD);
                return (
                  <Choice
                    key={option.id}
                    name="delivery"
                    value={option.id}
                    checked={state.delivery === option.id}
                    onChange={() => cart.setDelivery(option.id)}
                    title={option.label}
                    detail={option.detail}
                    aside={
                      <span className={cx("text-sm tabular-nums", free && "font-medium text-lime")}>
                        {free ? "Free" : formatINR(option.fee)}
                      </span>
                    }
                  />
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {pickup ? (
                <motion.div
                  key="pickup"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-5 flex gap-4 rounded-2xl border border-line bg-ink-3 p-5"
                >
                  <MapPinIcon size={24} className="mt-0.5 text-lime" loop />
                  <div>
                    <p className="font-medium">Collect from {site.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fog">{fullAddress}</p>
                    <p className="mt-1 text-sm text-fog">
                      {site.hours.label}, {site.hours.open} – {site.hours.close}. We will message you when it is ready.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <Field
                    label="House no. and street"
                    name="line1"
                    autoComplete="address-line1"
                    required
                    error={fields.line1}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Area or landmark"
                    name="line2"
                    autoComplete="address-line2"
                    optional
                    className="sm:col-span-2"
                  />
                  <Field label="City" name="city" autoComplete="address-level2" required error={fields.city} />
                  <div>
                    <label htmlFor="co-state" className="mb-1.5 block text-sm text-fog">
                      State
                    </label>
                    <select
                      id="co-state"
                      name="state"
                      defaultValue="Bihar"
                      autoComplete="address-level1"
                      aria-invalid={Boolean(fields.state)}
                      className={inputClass}
                    >
                      {STATES.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <Field
                    label="PIN code"
                    name="pin"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    defaultValue={state.pincode}
                    required
                    error={fields.pin}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Step>

          <Step number={3} title="Payment">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {payments.map((option) => (
                <Choice
                  key={option.id}
                  name="payment"
                  value={option.id}
                  checked={chosenPayment === option.id}
                  onChange={() => setPayment(option.id)}
                  title={option.label}
                  detail={option.detail}
                />
              ))}
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 text-[15px]">
              <input
                type="checkbox"
                checked={wantsGst}
                onChange={(e) => setWantsGst(e.target.checked)}
                className="size-5 accent-lime"
              />
              I need a GST invoice for my business
            </label>
            <AnimatePresence initial={false}>
              {wantsGst && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Field
                    label="GSTIN"
                    name="gstin"
                    placeholder="e.g. 10ABCDE1234F1Z5"
                    maxLength={15}
                    autoCapitalize="characters"
                    error={fields.gstin}
                    className="pt-4"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Step>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Order summary">
          <div className="rounded-[32px] border border-line-strong bg-ink-2 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your order</h2>
              <Link href="/cart" className="text-sm text-lime underline-offset-4 hover:underline">
                Edit cart
              </Link>
            </div>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {state.lines.map((line) => (
                <li key={line.key} className="flex gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                    <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
                    <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink/80 px-1 text-[11px] font-medium tabular-nums">
                      {line.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{line.name}</span>
                    <span className="block truncate text-sm text-fog">{line.variantLabel}</span>
                    {supportsWarranty(line) && line.warranty !== "standard" && (
                      <span className="flex items-center gap-1 text-xs text-lime">
                        <ShieldCheckIcon size={12} /> {warrantyPlan(line.warranty).label}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[15px] font-medium tabular-nums">
                    {formatINR(line.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-6">
              <TotalsList totals={totals} couponCode={state.coupon?.code} />
            </div>

            {error && (
              <p className="mt-5 rounded-2xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending || placed} className={buttonClass("primary", "lg", "mt-6 w-full")}>
              {pending || placed ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                  Placing your order…
                </>
              ) : (
                <>
                  <LockIcon size={18} strokeWidth={1.9} /> Place order · {formatINR(totals.total)}
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs leading-relaxed text-mist">
              By placing this order you agree to our warranty and replacement terms.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
