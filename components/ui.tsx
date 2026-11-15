import type { ReactNode, SVGProps } from "react";
import { cx, formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import type { Grade } from "@/lib/types";

/* Small, static building blocks that work in Server and Client Components. */

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

function Glyph({ size = 18, children, ...rest }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PlusGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M12 5v14M5 12h14" />
  </Glyph>
);
export const MinusGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M5 12h14" />
  </Glyph>
);
export const CloseGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Glyph>
);
export const CheckGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Glyph>
);
export const ChevronGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M6 9l6 6 6-6" />
  </Glyph>
);
export const MenuGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M4 8h16M4 16h16" />
  </Glyph>
);
export const TrashGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" />
  </Glyph>
);
export const BookmarkGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M6.5 4h11v16.5l-5.5-4-5.5 4z" />
  </Glyph>
);
export const FilterGlyph = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Glyph>
);

export function StarGlyph({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.8l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.8 6.3 20l1.4-6.3L2.9 9.4l6.4-.7z"
      />
    </svg>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-sm text-fog", className)}>
      <StarGlyph className="text-lime" />
      <span className="font-medium text-snow tabular-nums">{value.toFixed(1)}</span>
      {count !== undefined && <span className="tabular-nums">({count.toLocaleString("en-IN")})</span>}
    </span>
  );
}

const GRADE_COPY: Record<Grade, string> = {
  "A+": "Like new",
  A: "Excellent",
  B: "Good",
};

export function GradeBadge({ grade, withLabel = false }: { grade: Grade; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-ink/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-snow backdrop-blur">
      <span className="size-1.5 rounded-full bg-lime" />
      Grade {grade}
      {withLabel && <span className="text-fog">· {GRADE_COPY[grade]}</span>}
    </span>
  );
}

export function PriceTag({
  price,
  mrp,
  size = "md",
  className,
}: {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, mrp);
  const main = size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-xl" : "text-base";
  return (
    <span className={cx("inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cx("font-semibold tracking-tight text-snow tabular-nums", main)}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <span className="text-sm text-mist line-through tabular-nums">{formatINR(mrp)}</span>
          <span className="text-sm font-medium text-lime tabular-nums">{off}% off</span>
        </>
      )}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-lime",
        className,
      )}
    >
      <span className="h-px w-6 bg-lime/60" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cx("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow className={align === "center" ? "justify-center" : undefined}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-pretty text-base leading-relaxed text-fog sm:text-lg">{lead}</p>}
    </div>
  );
}

export const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
  primary: "bg-lime text-ink hover:bg-white",
  ghost: "border border-line-strong text-snow hover:border-snow/40 hover:bg-white/5",
  dark: "border border-line bg-ink-3 text-snow hover:border-line-strong hover:bg-ink-4",
  md: "h-12 px-6 text-[15px]",
  sm: "h-10 px-4 text-sm",
  lg: "h-14 px-8 text-base",
};

export function buttonClass(
  variant: "primary" | "ghost" | "dark" = "primary",
  size: "sm" | "md" | "lg" = "md",
  extra?: string,
) {
  return cx(buttonStyles.base, buttonStyles[variant], buttonStyles[size], extra);
}

/** An endless horizontal ticker. Children are rendered twice for a seamless loop. */
export function Marquee({
  children,
  slow = false,
  className,
}: {
  children: ReactNode;
  slow?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("group/marquee flex overflow-hidden mask-fade-x", className)}>
      <div
        className={cx(
          "flex shrink-0 items-center group-hover/marquee:[animation-play-state:paused]",
          slow ? "animate-marquee-slow" : "animate-marquee",
        )}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Monogram({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-ink-4 text-sm font-medium text-lime",
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
