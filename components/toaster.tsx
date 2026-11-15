"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/lib/format";
import { ui, useUi } from "@/lib/ui-store";
import { CheckGlyph, CloseGlyph } from "./ui";

export function Toaster() {
  const { toasts } = useUi();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-line-strong bg-ink-3/95 py-2 pl-2.5 pr-2 text-sm shadow-xl shadow-black/50 backdrop-blur"
          >
            <span
              className={cx(
                "grid size-7 shrink-0 place-items-center rounded-full",
                t.tone === "error" ? "bg-ember text-ink" : t.tone === "info" ? "bg-white/10 text-snow" : "bg-lime text-ink",
              )}
            >
              {t.tone === "error" ? <CloseGlyph size={14} /> : <CheckGlyph size={14} />}
            </span>
            <span className="min-w-0 truncate">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.run();
                  ui.dismissToast(t.id);
                }}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 font-medium text-lime hover:bg-white/15"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => ui.dismissToast(t.id)}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-full text-mist hover:text-snow"
            >
              <CloseGlyph size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
