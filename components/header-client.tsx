"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { ProductSummary } from "@/lib/data";
import { cx, formatINR } from "@/lib/format";
import { site } from "@/lib/site";
import { ui, useUi } from "@/lib/ui-store";
import {
  ArrowIcon,
  CartIcon,
  HeartIcon,
  LaptopIcon,
  PhoneIcon,
  SearchIcon,
  useHover,
} from "./motion-icons";
import { CloseGlyph, MenuGlyph } from "./ui";

const NAV = [
  { label: "Laptops", href: "/shop?category=laptop" },
  { label: "Desktops", href: "/shop?category=desktop" },
  { label: "Accessories", href: "/shop?category=accessory" },
  { label: "Deals", href: "/shop?deal=1" },
  { label: "Service", href: "/support" },
  { label: "Visit us", href: "/#store" },
];

const POPULAR = ["MacBook", "ThinkPad", "Dell Latitude", "Gaming", "Monitor"];

export function Logo({ onClick }: { onClick?: () => void }) {
  const [hovered, bind] = useHover();
  return (
    <Link
      href="/"
      {...bind}
      onClick={onClick}
      className="flex items-center gap-2.5"
      aria-label={`${site.name} home`}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink">
        <LaptopIcon active={hovered} size={20} strokeWidth={1.9} />
      </span>
      <span className="text-[19px] font-semibold tracking-tight">
        lapnotek<span className="text-lime">.</span>
      </span>
    </Link>
  );
}

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: (hovered: boolean) => React.ReactNode;
  className?: string;
}) {
  const [hovered, bind] = useHover();
  return (
    <button
      type="button"
      {...bind}
      onClick={onClick}
      aria-label={label}
      className={cx(
        "relative grid size-11 place-items-center rounded-full border border-line text-snow transition-colors hover:border-line-strong hover:bg-white/5",
        className,
      )}
    >
      {children(hovered)}
    </button>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 22 }}
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[11px] font-semibold text-ink tabular-nums"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ index }: { index: ProductSummary[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const close = () => {
    ui.closeSearch();
    setQuery("");
  };

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return index.filter((p) => p.featured).slice(0, 5);
    return index
      .filter((p) => {
        const haystack =
          `${p.name} ${p.brand} ${p.category} ${p.subcategory ?? ""} ${p.tagline} ${p.useCases.join(" ")} ${p.highlights.join(" ")}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 7);
  }, [query, index]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    close();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-md"
        onClick={close}
      />
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line-strong bg-ink-2 shadow-2xl shadow-black/60"
        initial={{ y: -24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-5">
          <SearchIcon size={20} className="text-fog" loop />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search laptops, brands, accessories…"
            aria-label="Search products"
            className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-mist"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-fog hover:text-snow"
          >
            ESC
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!query && (
            <div className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-fog transition-colors hover:border-lime/50 hover:text-snow"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
          <p className="px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular right now"}
          </p>
          {results.length === 0 ? (
            <p className="px-2 py-8 text-center text-fog">
              Nothing matches “{query}”. Try a brand like HP or Dell.
            </p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/product/${p.slug}`}
                    prefetch
                    onClick={close}
                    className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                      <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block truncate text-sm text-fog">{p.variantLabel}</span>
                    </span>
                    <span className="font-medium tabular-nums">{formatINR(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileMenu() {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-8 pt-24 lg:hidden"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <nav aria-label="Mobile">
        <ul>
          {NAV.map((item, i) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
              className="border-b border-line"
            >
              <Link
                href={item.href}
                onClick={ui.closeMenu}
                className="flex items-center justify-between py-4 text-2xl font-medium tracking-tight"
              >
                {item.label}
                <ArrowIcon size={20} className="text-fog" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto space-y-2 text-fog">
        <Link href="/track" onClick={ui.closeMenu} className="block py-1 text-snow">
          Track an order
        </Link>
        <a href={`tel:${site.phones[0].tel}`} className="flex items-center gap-2 py-1">
          <PhoneIcon size={18} className="text-lime" /> {site.phones[0].display}
        </a>
        <p className="text-sm">
          {site.hours.label}, {site.hours.open} – {site.hours.close}
        </p>
      </div>
    </motion.div>
  );
}

export function HeaderClient({ index }: { index: ProductSummary[] }) {
  const { lines, wishlist } = useCart();
  const { searchOpen, menuOpen, cartOpen } = useUi();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 16));
  useLockBody(searchOpen || menuOpen || cartOpen);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        ui.closeAll();
        return;
      }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement)?.tagName ?? "");
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        ui.openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cx(
          "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300",
          scrolled || menuOpen ? "glass border-line" : "border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-[72px] items-center gap-6">
          <Logo onClick={ui.closeAll} />

          <nav aria-label="Main" className="ml-4 hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-full px-3.5 py-2 text-[15px] text-fog transition-colors hover:bg-white/5 hover:text-snow"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={ui.openSearch}
              className="hidden h-11 items-center gap-3 rounded-full border border-line pl-4 pr-3 text-sm text-fog transition-colors hover:border-line-strong hover:text-snow md:flex"
            >
              <SearchIcon size={18} />
              <span>Search</span>
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px]">/</kbd>
            </button>
            <IconButton label="Search" onClick={ui.openSearch} className="md:hidden">
              {(hovered) => <SearchIcon active={hovered} size={20} />}
            </IconButton>

            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} item${wishlist.length === 1 ? "" : "s"}`}
              className="relative hidden size-11 place-items-center rounded-full border border-line transition-colors hover:border-line-strong hover:bg-white/5 sm:grid"
            >
              <HeartIcon size={20} />
              <CountBadge count={wishlist.length} />
            </Link>

            <IconButton label={`Open cart, ${count} item${count === 1 ? "" : "s"}`} onClick={ui.openCart}>
              {(hovered) => (
                <>
                  <CartIcon active={hovered} size={20} />
                  <CountBadge count={count} />
                </>
              )}
            </IconButton>

            <button
              type="button"
              onClick={menuOpen ? ui.closeMenu : ui.openMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="grid size-11 place-items-center rounded-full border border-line lg:hidden"
            >
              {menuOpen ? <CloseGlyph size={20} /> : <MenuGlyph size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>{menuOpen && <MobileMenu key="menu" />}</AnimatePresence>
      <AnimatePresence>{searchOpen && <SearchOverlay key="search" index={index} />}</AnimatePresence>
    </>
  );
}
