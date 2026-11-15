"use client";

import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  type Variants,
} from "motion/react";
import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { ArrowIcon, useHover } from "./motion-icons";
import { buttonClass } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Respects the visitor's reduced-motion setting everywhere. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={staggerChild}>
      {children}
    </Tag>
  );
}

/** Counts up to `value` when it scrolls into view. */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);

  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: EASE });
    const stop = count.on("change", (latest) => {
      if (ref.current) ref.current.textContent = format(latest);
    });
    return () => {
      controls.stop();
      stop();
    };
    // `format` only depends on the props listed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, decimals, prefix, suffix, count]);

  // The final value is rendered on the server, so it reads correctly without JS.
  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {format(value)}
    </span>
  );
}

type CtaProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: "primary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

/** A pill link whose arrow nudges forward on hover. */
export function CtaLink({
  variant = "primary",
  size = "md",
  arrow = true,
  className,
  children,
  ...link
}: CtaProps) {
  const [hovered, bind] = useHover();
  return (
    <Link {...link} {...bind} className={buttonClass(variant, size, className)}>
      {children}
      {arrow && <ArrowIcon active={hovered} size={18} />}
    </Link>
  );
}

/** A looping, muted background video that only plays while it is on screen. */
export function AmbientVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.15 });

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (inView) {
      video.play().catch(() => {
        // Autoplay can be blocked (data saver, low power); the poster stays up.
      });
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
