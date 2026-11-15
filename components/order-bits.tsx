"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { submitEnquiryAction } from "@/app/actions";
import { IDLE_FORM } from "@/lib/action-types";
import { cart, useCart, useHydrated } from "@/lib/cart-store";
import type { ProductSummary } from "@/lib/data";
import { cx } from "@/lib/format";
import { toast } from "@/lib/ui-store";
import { CtaLink } from "./motion";
import { BuildingIcon, ChatIcon, HeartIcon, SearchIcon, WrenchIcon } from "./motion-icons";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { CheckGlyph, buttonClass } from "./ui";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          toast("Could not copy. Select the ID and copy it manually.", { tone: "error" });
        }
      }}
      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function TrackForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const cleaned = id.trim().toUpperCase().replace(/\s+/g, "");
        if (!/^LNK-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleaned)) {
          setError("Order IDs look like LNK-AB12-CD34. Check your confirmation message.");
          return;
        }
        router.push(`/order/${cleaned}`);
      }}
    >
      <label htmlFor="track-id" className="text-sm text-fog">
        Order ID
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="track-id"
          value={id}
          onChange={(e) => {
            setId(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="LNK-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "track-error" : undefined}
          className="h-14 flex-1 rounded-full border border-line-strong bg-ink-3 px-6 font-mono text-lg tracking-widest outline-none placeholder:text-mist focus:border-lime"
        />
        <button type="submit" className={buttonClass("primary", "lg")}>
          <SearchIcon size={18} strokeWidth={1.9} /> Track order
        </button>
      </div>
      {error && (
        <p id="track-error" className="mt-3 text-sm text-ember" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function WishlistView({ products }: { products: ProductSummary[] }) {
  const hydrated = useHydrated();
  const { wishlist } = useCart();
  const saved = wishlist
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is ProductSummary => Boolean(p));

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-[36px] border border-line bg-ink-2 px-6 py-20 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full border border-line-strong bg-ink-3 text-ember">
          <HeartIcon size={36} loop />
        </span>
        <p className="mt-6 text-2xl font-medium tracking-tight">No favourites yet</p>
        <p className="mx-auto mt-2 max-w-sm text-fog">
          Tap the heart on any product to keep it here while you decide.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaLink href="/shop">Find something you love</CtaLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-fog">
          {saved.length} saved item{saved.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => {
            saved.forEach((p) => cart.toggleWishlist(p.slug));
            toast("Wishlist cleared", { tone: "info" });
          }}
          className="text-sm text-fog underline-offset-4 hover:text-snow hover:underline"
        >
          Clear wishlist
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {saved.map((product) => (
            <motion.div
              key={product.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

const ENQUIRY_TYPES = [
  { id: "service", label: "Service request", Icon: WrenchIcon, hint: "Model, what is wrong and when it started" },
  { id: "bulk", label: "Bulk buy", Icon: BuildingIcon, hint: "How many machines, your budget and timeline" },
  { id: "general", label: "General enquiry", Icon: ChatIcon, hint: "How can we help?" },
] as const;

type EnquiryType = (typeof ENQUIRY_TYPES)[number]["id"];

const fieldClass =
  "w-full rounded-2xl border border-line-strong bg-ink-3 px-4 outline-none transition-colors placeholder:text-mist focus:border-lime aria-[invalid=true]:border-ember";

export function EnquiryForm() {
  const params = useSearchParams();
  const requested = ENQUIRY_TYPES.find((t) => t.id === params.get("type"))?.id;
  const [picked, setPicked] = useState<EnquiryType | null>(null);
  const type = picked ?? requested ?? "service";
  const [state, action, pending] = useActionState(submitEnquiryAction, IDLE_FORM);
  const active = ENQUIRY_TYPES.find((t) => t.id === type)!;
  const errors = state.fields ?? {};

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-lime/40 bg-lime/[0.06] p-8 text-center"
        role="status"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime text-ink">
          <CheckGlyph size={26} strokeWidth={2.5} />
        </span>
        <p className="mt-5 text-2xl font-semibold tracking-tight">Request received</p>
        <p className="mx-auto mt-2 max-w-md text-fog">{state.message}</p>
        <div className="mt-7 flex justify-center">
          <Link href="/shop" className={buttonClass("ghost", "md")}>
            Back to the shop
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form action={action} noValidate className="rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
      <input type="hidden" name="type" value={type} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="What do you need?">
        {ENQUIRY_TYPES.map(({ id, label, Icon }) => {
          const selected = id === type;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPicked(id)}
              className={cx(
                "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-[15px] font-medium transition-colors",
                selected ? "border-lime bg-lime text-ink" : "border-line-strong text-fog hover:text-snow",
              )}
            >
              <Icon size={20} active={selected} strokeWidth={1.8} /> {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className="mb-1.5 block text-sm text-fog">
            Your name
          </label>
          <input
            id="enq-name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            className={cx(fieldClass, "h-12")}
          />
          {errors.name && <p className="mt-1.5 text-sm text-ember">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="enq-phone" className="mb-1.5 block text-sm text-fog">
            Mobile number
          </label>
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            className={cx(fieldClass, "h-12")}
          />
          {errors.phone && <p className="mt-1.5 text-sm text-ember">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="enq-email" className="mb-1.5 flex justify-between text-sm text-fog">
            Email <span className="text-xs text-mist">Optional</span>
          </label>
          <input
            id="enq-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={cx(fieldClass, "h-12")}
          />
          {errors.email && <p className="mt-1.5 text-sm text-ember">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="enq-device" className="mb-1.5 flex justify-between text-sm text-fog">
            {type === "bulk" ? "Organisation" : "Device"} <span className="text-xs text-mist">Optional</span>
          </label>
          <input
            id="enq-device"
            name="device"
            placeholder={type === "bulk" ? "School, office or institute" : "e.g. HP EliteBook 840 G5"}
            className={cx(fieldClass, "h-12")}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="enq-message" className="mb-1.5 block text-sm text-fog">
            Tell us more
          </label>
          <textarea
            id="enq-message"
            name="message"
            rows={4}
            required
            maxLength={1000}
            placeholder={active.hint}
            aria-invalid={Boolean(errors.message)}
            className={cx(fieldClass, "resize-none py-3")}
          />
          {errors.message && <p className="mt-1.5 text-sm text-ember">{errors.message}</p>}
        </div>
      </div>

      {state.status === "error" && !state.fields && (
        <p className="mt-4 text-sm text-ember" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-6 w-full sm:w-auto")}>
        {pending ? "Sending…" : `Send ${active.label.toLowerCase()}`}
      </button>
    </form>
  );
}

/** Small image tile used on the support page. */
export function ServicePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative block aspect-[4/3] overflow-hidden rounded-3xl border border-line">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
    </span>
  );
}
