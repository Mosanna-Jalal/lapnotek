"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/lib/format";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { MinusGlyph, PlusGlyph } from "../ui";

/** − 1 + control with a rolling number, capped by stock and the per-order limit. */
export function QtyStepper({
  value,
  stock,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  stock: number;
  onChange: (next: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const max = Math.min(stock, MAX_QTY_PER_LINE);
  const button = cx(
    "grid place-items-center rounded-full text-snow transition-colors hover:bg-white/10 disabled:text-mist disabled:hover:bg-transparent",
    size === "sm" ? "size-7" : "size-9",
  );
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cx(
        "inline-flex items-center rounded-full border border-line-strong bg-ink-3",
        size === "sm" ? "gap-0.5 p-0.5" : "gap-1 p-1",
      )}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusGlyph size={size === "sm" ? 14 : 16} />
      </button>
      <span
        className={cx(
          "relative grid place-items-center overflow-hidden font-medium tabular-nums",
          size === "sm" ? "h-7 w-6 text-sm" : "h-9 w-8",
        )}
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <PlusGlyph size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
}
