"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProductSummary } from "@/lib/data";
import { cx, formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { SearchIcon } from "../motion-icons";
import { ProductCard } from "../product-card";
import { CheckGlyph, CloseGlyph, FilterGlyph, buttonClass } from "../ui";

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORIES = [
  { id: "", label: "Everything" },
  { id: "laptop", label: "Laptops" },
  { id: "desktop", label: "Desktops" },
  { id: "accessory", label: "Accessories" },
] as const;

const USES = [
  { id: "student", label: "Students" },
  { id: "business", label: "Business" },
  { id: "gaming", label: "Gaming" },
  { id: "creator", label: "Creators" },
] as const;

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "discount", label: "Biggest saving" },
  { id: "rating", label: "Top rated" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

interface Filters {
  q: string;
  category: string;
  brands: string[];
  use: string;
  grades: string[];
  max: number | null;
  deal: boolean;
  inStock: boolean;
  sort: SortId;
}

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

function parseFilters(params: URLSearchParams): Filters {
  const max = Number(params.get("max"));
  const sort = SORTS.find((s) => s.id === params.get("sort"))?.id ?? "featured";
  return {
    q: params.get("q") ?? "",
    category: CATEGORIES.find((c) => c.id === params.get("category"))?.id ?? "",
    brands: list(params.get("brand")),
    use: USES.find((u) => u.id === params.get("use"))?.id ?? "",
    grades: list(params.get("grade")),
    max: Number.isFinite(max) && max > 0 ? max : null,
    deal: params.get("deal") === "1",
    inStock: params.get("stock") === "1",
    sort,
  };
}

function toQuery(f: Filters) {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.category) params.set("category", f.category);
  if (f.brands.length) params.set("brand", f.brands.join(","));
  if (f.use) params.set("use", f.use);
  if (f.grades.length) params.set("grade", f.grades.join(","));
  if (f.max) params.set("max", String(f.max));
  if (f.deal) params.set("deal", "1");
  if (f.inStock) params.set("stock", "1");
  if (f.sort !== "featured") params.set("sort", f.sort);
  return params.toString();
}

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function Check({
  checked,
  onChange,
  children,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-[15px] transition-colors hover:bg-white/5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cx(
          "grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime",
          checked ? "border-lime bg-lime text-ink" : "border-line-strong",
        )}
      >
        {checked && <CheckGlyph size={13} strokeWidth={3} />}
      </span>
      <span className={cx("flex-1", checked ? "text-snow" : "text-fog")}>{children}</span>
      {count !== undefined && <span className="text-sm text-mist tabular-nums">{count}</span>}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-3 w-full font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
        {title}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function ShopClient({ products }: { products: ProductSummary[] }) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams)), [searchParams]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // The URL is the single source of truth, so filters are shareable and survive a refresh.
  const update = (patch: Partial<Filters>) => {
    const query = toQuery({ ...filters, ...patch });
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };
  const reset = () => window.history.replaceState(null, "", window.location.pathname);

  const ceiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 1000) / 5000) * 5000,
    [products],
  );

  // Brand and grade options follow the chosen category.
  const scoped = useMemo(
    () => products.filter((p) => !filters.category || p.category === filters.category),
    [products, filters.category],
  );
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of scoped) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [scoped]);
  const hasGrades = scoped.some((p) => p.grade);

  const results = useMemo(() => {
    const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = scoped.filter((p) => {
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.use && !p.useCases.includes(filters.use as ProductSummary["useCases"][number])) return false;
      if (filters.grades.length && (!p.grade || !filters.grades.includes(p.grade))) return false;
      if (filters.max && p.price > filters.max) return false;
      if (filters.deal && !p.deal) return false;
      if (filters.inStock && p.stock <= 0) return false;
      if (terms.length) {
        const haystack =
          `${p.name} ${p.brand} ${p.category} ${p.subcategory ?? ""} ${p.tagline} ${p.variantLabel} ${p.useCases.join(" ")} ${p.highlights.join(" ")}`.toLowerCase();
        if (!terms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });

    const sorters: Record<SortId, (a: ProductSummary, b: ProductSummary) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      discount: (a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp),
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    };
    return matched.sort(sorters[filters.sort]);
  }, [scoped, filters]);

  const chips: { label: string; clear: () => void }[] = [
    ...(filters.q.trim() ? [{ label: `“${filters.q.trim()}”`, clear: () => update({ q: "" }) }] : []),
    ...filters.brands.map((b) => ({
      label: b,
      clear: () => update({ brands: filters.brands.filter((x) => x !== b) }),
    })),
    ...(filters.use
      ? [{ label: USES.find((u) => u.id === filters.use)!.label, clear: () => update({ use: "" }) }]
      : []),
    ...filters.grades.map((g) => ({
      label: `Grade ${g}`,
      clear: () => update({ grades: filters.grades.filter((x) => x !== g) }),
    })),
    ...(filters.max ? [{ label: `Under ${formatINR(filters.max)}`, clear: () => update({ max: null }) }] : []),
    ...(filters.deal ? [{ label: "Deals", clear: () => update({ deal: false }) }] : []),
    ...(filters.inStock ? [{ label: "In stock", clear: () => update({ inStock: false }) }] : []),
  ];

  const panel = (
    <>
      <Group title="Search">
        <label className="flex h-11 items-center gap-2.5 rounded-full border border-line-strong bg-ink-3 px-4 focus-within:border-lime">
          <SearchIcon size={16} className="text-mist" />
          <span className="sr-only">Search within results</span>
          <input
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Model, brand, spec…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-mist"
          />
        </label>
      </Group>

      <Group title="Brand">
        {brands.map(([brand, count]) => (
          <Check
            key={brand}
            checked={filters.brands.includes(brand)}
            onChange={() => update({ brands: toggle(filters.brands, brand) })}
            count={count}
          >
            {brand}
          </Check>
        ))}
      </Group>

      <Group title="Built for">
        <div className="flex flex-wrap gap-2">
          {USES.map((use) => (
            <button
              key={use.id}
              type="button"
              aria-pressed={filters.use === use.id}
              onClick={() => update({ use: filters.use === use.id ? "" : use.id })}
              className={cx(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filters.use === use.id
                  ? "border-lime bg-lime text-ink"
                  : "border-line-strong text-fog hover:text-snow",
              )}
            >
              {use.label}
            </button>
          ))}
        </div>
      </Group>

      {hasGrades && (
        <Group title="Condition">
          {(["A+", "A", "B"] as const).map((grade) => (
            <Check
              key={grade}
              checked={filters.grades.includes(grade)}
              onChange={() => update({ grades: toggle(filters.grades, grade) })}
            >
              Grade {grade}
            </Check>
          ))}
        </Group>
      )}

      <Group title="Budget">
        <div className="px-1">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-fog">Up to</span>
            <span className="text-base font-medium tabular-nums">
              {formatINR(filters.max ?? ceiling)}
            </span>
          </div>
          <input
            type="range"
            aria-label="Maximum price"
            min={5000}
            max={ceiling}
            step={5000}
            value={filters.max ?? ceiling}
            onChange={(e) => {
              const value = Number(e.target.value);
              update({ max: value >= ceiling ? null : value });
            }}
            className="mt-3 w-full accent-lime"
          />
        </div>
      </Group>

      <Group title="Availability">
        <Check checked={filters.deal} onChange={() => update({ deal: !filters.deal })}>
          Deals of the week
        </Check>
        <Check checked={filters.inStock} onChange={() => update({ inStock: !filters.inStock })}>
          In stock only
        </Check>
      </Group>
    </>
  );

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Category">
        {CATEGORIES.map((c) => {
          const active = filters.category === c.id;
          const count = c.id ? products.filter((p) => p.category === c.id).length : products.length;
          return (
            <button
              key={c.id || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => update({ category: c.id, brands: [], grades: [] })}
              className={cx(
                "relative shrink-0 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors",
                active ? "text-ink" : "text-fog hover:text-snow",
              )}
            >
              {active && (
                <motion.span
                  layoutId="shop-category-pill"
                  className="absolute inset-0 rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {c.label} <span className={active ? "text-ink/60" : "text-mist"}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">{panel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-fog" aria-live="polite">
              <span className="font-medium text-snow tabular-nums">{results.length}</span>{" "}
              {results.length === 1 ? "product" : "products"}
            </p>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={buttonClass("dark", "sm", "lg:hidden")}
            >
              <FilterGlyph size={16} /> Filters
              {chips.length > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-lime text-[11px] font-semibold text-ink">
                  {chips.length}
                </span>
              )}
            </button>

            <label className="ml-auto flex items-center gap-2 text-sm text-fog">
              <span className="hidden sm:inline">Sort by</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortId })}
                className="h-10 rounded-full border border-line-strong bg-ink-3 px-4 text-snow outline-none focus:border-lime"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AnimatePresence initial={false}>
                {chips.map((chip) => (
                  <motion.button
                    key={chip.label}
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={chip.clear}
                    aria-label={`Remove filter ${chip.label}`}
                    className="flex items-center gap-1.5 rounded-full border border-lime/40 bg-lime/10 py-1.5 pl-3 pr-2 text-sm text-lime hover:bg-lime/20"
                  >
                    {chip.label} <CloseGlyph size={13} />
                  </motion.button>
                ))}
              </AnimatePresence>
              <button type="button" onClick={reset} className="px-2 text-sm text-fog underline-offset-4 hover:text-snow hover:underline">
                Clear all
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="mt-10 rounded-[32px] border border-line bg-ink-2 px-6 py-20 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full border border-line-strong text-lime">
                <SearchIcon size={28} loop />
              </span>
              <p className="mt-6 text-2xl font-medium tracking-tight">Nothing matches those filters</p>
              <p className="mx-auto mt-2 max-w-sm text-fog">
                Stock changes every day. Loosen a filter, or tell us what you need and we will source it.
              </p>
              <button type="button" onClick={reset} className={buttonClass("primary", "md", "mt-7")}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((product, i) => (
                  <motion.div
                    key={product.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <ProductCard product={product} eager={i < 3} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[32px] border-t border-line-strong bg-ink-2"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className="grid size-10 place-items-center rounded-full border border-line"
                >
                  <CloseGlyph />
                </button>
              </div>
              <div className="overflow-y-auto px-6 py-5">{panel}</div>
              <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
                <button type="button" onClick={reset} className={buttonClass("ghost", "md")}>
                  Clear all
                </button>
                <button type="button" onClick={() => setSheetOpen(false)} className={buttonClass("primary", "md")}>
                  Show {results.length}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
