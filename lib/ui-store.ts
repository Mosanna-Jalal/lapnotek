"use client";

import { useSyncExternalStore } from "react";

/** Tiny global UI state: cart drawer, search overlay, mobile menu and toasts. */

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "error";
  action?: { label: string; run: () => void };
}

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
}

const INITIAL: UiState = { cartOpen: false, searchOpen: false, menuOpen: false, toasts: [] };

let state = INITIAL;
let nextToastId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function set(patch: Partial<UiState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const ui = {
  openCart: () => set({ cartOpen: true, searchOpen: false, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  openMenu: () => set({ menuOpen: true, cartOpen: false, searchOpen: false }),
  closeMenu: () => set({ menuOpen: false }),
  closeAll: () => set({ cartOpen: false, searchOpen: false, menuOpen: false }),

  dismissToast(id: number) {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    set({ toasts: state.toasts.filter((t) => t.id !== id) });
  },
};

export function toast(
  message: string,
  options: { tone?: Toast["tone"]; action?: Toast["action"]; duration?: number } = {},
) {
  const id = nextToastId++;
  const entry: Toast = { id, message, tone: options.tone ?? "success", action: options.action };
  set({ toasts: [...state.toasts.slice(-2), entry] });
  timers.set(
    id,
    setTimeout(() => ui.dismissToast(id), options.duration ?? (options.action ? 6000 : 3200)),
  );
  return id;
}

export function useUi() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
