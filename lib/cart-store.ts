"use client";

import { useMemo, useSyncExternalStore } from "react";
import { computeTotals, MAX_QTY_PER_LINE } from "./pricing";
import type { CartLine, CartState, Coupon, DeliveryId, WarrantyPlanId } from "./types";

/**
 * The cart lives in the browser (localStorage), outside React, and is read
 * with useSyncExternalStore. That keeps every page statically prerendered,
 * syncs across tabs and survives reloads without an account.
 */

const STORAGE_KEY = "lapnotek.cart.v1";

const EMPTY: CartState = {
  lines: [],
  saved: [],
  wishlist: [],
  coupon: null,
  delivery: "standard",
  pincode: "",
  giftWrap: false,
  setup: false,
  note: "",
};

let state: CartState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      ...EMPTY,
      ...parsed,
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
    };
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = read();
}

function commit(next: CartState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full disk: the cart still works for this tab.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  state = read();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

const getServerSnapshot = () => EMPTY;

const clampQty = (qty: number, stock: number) =>
  Math.max(1, Math.min(Math.floor(qty), stock, MAX_QTY_PER_LINE));

function update(recipe: (current: CartState) => CartState) {
  ensureLoaded();
  commit(recipe(state));
}

export type NewLine = Omit<CartLine, "key" | "qty" | "warranty"> & {
  qty?: number;
  warranty?: WarrantyPlanId;
};

export const cart = {
  /** Adds a line, or tops up the quantity when it is already in the cart. */
  add(input: NewLine): { added: number; capped: boolean } {
    const key = `${input.slug}:${input.variantId}`;
    const wanted = input.qty ?? 1;
    let added = wanted;
    let capped = false;
    update((s) => {
      const existing = s.lines.find((l) => l.key === key);
      if (existing) {
        const qty = clampQty(existing.qty + wanted, input.stock);
        added = qty - existing.qty;
        capped = added < wanted;
        return {
          ...s,
          lines: s.lines.map((l) =>
            l.key === key
              ? { ...l, ...input, key, qty, warranty: input.warranty ?? l.warranty }
              : l,
          ),
        };
      }
      const qty = clampQty(wanted, input.stock);
      added = qty;
      capped = qty < wanted;
      const line: CartLine = { ...input, key, qty, warranty: input.warranty ?? "standard" };
      return { ...s, lines: [...s.lines, line], saved: s.saved.filter((l) => l.key !== key) };
    });
    return { added, capped };
  },

  setQty(key: string, qty: number) {
    update((s) => ({
      ...s,
      lines: s.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty, l.stock) } : l)),
    }));
  },

  setWarranty(key: string, warranty: WarrantyPlanId) {
    update((s) => ({
      ...s,
      lines: s.lines.map((l) => (l.key === key ? { ...l, warranty } : l)),
    }));
  },

  remove(key: string) {
    update((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) }));
  },

  /** Puts a removed line back where it was (used by the undo toast). */
  restore(line: CartLine, index: number) {
    update((s) => {
      if (s.lines.some((l) => l.key === line.key)) return s;
      const lines = [...s.lines];
      lines.splice(Math.min(index, lines.length), 0, line);
      return { ...s, lines };
    });
  },

  saveForLater(key: string) {
    update((s) => {
      const line = s.lines.find((l) => l.key === key);
      if (!line) return s;
      return {
        ...s,
        lines: s.lines.filter((l) => l.key !== key),
        saved: [line, ...s.saved.filter((l) => l.key !== key)],
      };
    });
  },

  moveToCart(key: string) {
    update((s) => {
      const line = s.saved.find((l) => l.key === key);
      if (!line) return s;
      return {
        ...s,
        saved: s.saved.filter((l) => l.key !== key),
        lines: s.lines.some((l) => l.key === key) ? s.lines : [...s.lines, line],
      };
    });
  },

  removeSaved(key: string) {
    update((s) => ({ ...s, saved: s.saved.filter((l) => l.key !== key) }));
  },

  /** Returns true when the product is now on the wishlist. */
  toggleWishlist(slug: string): boolean {
    let nowListed = false;
    update((s) => {
      nowListed = !s.wishlist.includes(slug);
      return {
        ...s,
        wishlist: nowListed ? [slug, ...s.wishlist] : s.wishlist.filter((w) => w !== slug),
      };
    });
    return nowListed;
  },

  moveToWishlist(key: string) {
    update((s) => {
      const line = s.lines.find((l) => l.key === key);
      if (!line) return s;
      return {
        ...s,
        lines: s.lines.filter((l) => l.key !== key),
        wishlist: s.wishlist.includes(line.slug) ? s.wishlist : [line.slug, ...s.wishlist],
      };
    });
  },

  applyCoupon(coupon: Coupon) {
    update((s) => ({ ...s, coupon }));
  },
  removeCoupon() {
    update((s) => ({ ...s, coupon: null }));
  },
  setDelivery(delivery: DeliveryId) {
    update((s) => ({ ...s, delivery }));
  },
  setPincode(pincode: string) {
    update((s) => ({ ...s, pincode }));
  },
  setGiftWrap(giftWrap: boolean) {
    update((s) => ({ ...s, giftWrap }));
  },
  setSetup(setup: boolean) {
    update((s) => ({ ...s, setup }));
  },
  setNote(note: string) {
    update((s) => ({ ...s, note: note.slice(0, 300) }));
  },

  /** Empties the cart lines but keeps the wishlist and saved items. */
  clear() {
    update((s) => ({ ...s, lines: [], coupon: null, giftWrap: false, setup: false, note: "" }));
  },
  replaceLines(lines: CartLine[]) {
    update((s) => ({ ...s, lines }));
  },
};

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartTotals() {
  const s = useCart();
  return useMemo(
    () =>
      computeTotals({
        lines: s.lines,
        coupon: s.coupon,
        delivery: s.delivery,
        giftWrap: s.giftWrap,
        setup: s.setup,
      }),
    [s.lines, s.coupon, s.delivery, s.giftWrap, s.setup],
  );
}

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
