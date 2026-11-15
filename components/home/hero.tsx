"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { ProductSummary } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { site } from "@/lib/site";
import { AmbientVideo, Counter, CtaLink } from "../motion";
import {
  ArrowIcon,
  BatteryIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparkleIcon,
  useHover,
} from "../motion-icons";
import { StarGlyph } from "../ui";

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 28 },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.08 * i, ease: EASE },
  }),
};

function DealChip({ deal }: { deal: ProductSummary }) {
  const [hovered, bind] = useHover();
  return (
    <Link
      href={`/product/${deal.slug}`}
      prefetch
      {...bind}
      className="glass flex items-center gap-3 rounded-3xl border border-line-strong p-2.5 pr-4 transition-colors hover:border-lime/50"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-ink-3">
        <Image src={deal.image} alt="" fill sizes="64px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-lime">
          Deal of the week
        </span>
        <span className="block truncate font-medium">{deal.name}</span>
        <span className="block text-sm text-fog">
          <span className="font-semibold text-snow tabular-nums">{formatINR(deal.price)}</span>{" "}
          <span className="line-through tabular-nums">{formatINR(deal.mrp)}</span>{" "}
          <span className="text-lime">{discountPercent(deal.price, deal.mrp)}% off</span>
        </span>
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime text-ink">
        <ArrowIcon size={18} active={hovered} />
      </span>
    </Link>
  );
}

export function Hero({ deal }: { deal: ProductSummary | null }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -140]);

  return (
    <section ref={ref} className="relative -mt-[72px] overflow-hidden pt-[72px]">
      <div
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-lime/15 blur-[140px]"
        aria-hidden="true"
      />

      <div className="shell relative grid grid-cols-1 items-center gap-12 pb-20 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-28 lg:pt-20">
        <motion.div initial="hidden" animate="shown">
          <motion.a
            variants={rise}
            custom={0}
            href={`https://www.google.com/search?q=${encodeURIComponent("LAPNOTEK Reviews")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] py-1.5 pl-2 pr-4 text-sm text-fog transition-colors hover:border-lime/40"
          >
            <span className="flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 font-semibold text-ink">
              <StarGlyph size={12} /> {site.rating.value}
            </span>
            {site.rating.count} Google reviews · {site.address.city}, {site.address.state}
          </motion.a>

          <motion.h1
            variants={rise}
            custom={1}
            className="mt-7 text-[clamp(2.9rem,7.4vw,6rem)] font-semibold leading-[0.96] tracking-[-0.035em]"
          >
            Tested. Certified.
            <br />
            <span className="accent">Yours for less.</span>
          </motion.h1>

          <motion.p
            variants={rise}
            custom={2}
            className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-fog"
          >
            HP, Dell, Lenovo and Apple laptops that pass a {site.policies.checkpoints}-point check on
            our own service bench in {site.address.city}, then ship with a{" "}
            {site.policies.warrantyMonths}-month warranty at up to {site.policies.maxSavings}% off the
            new price.
          </motion.p>

          <motion.div variants={rise} custom={3} className="mt-9 flex flex-wrap gap-3">
            <CtaLink href="/shop?category=laptop" size="lg">
              Shop laptops
            </CtaLink>
            <Link
              href="/#store"
              className="inline-flex h-14 items-center gap-2 rounded-full border border-line-strong px-7 font-medium transition-colors hover:border-snow/40 hover:bg-white/5"
            >
              <MapPinIcon size={20} className="text-lime" loop />
              Visit the store
            </Link>
          </motion.div>

          <motion.dl
            variants={rise}
            custom={4}
            className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-line border-t border-line pt-6"
          >
            <div className="pr-4">
              <dt className="text-sm text-fog">Happy customers</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {site.customers}
              </dd>
            </div>
            <div className="px-4">
              <dt className="text-sm text-fog">Google rating</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                <Counter value={site.rating.value} decimals={1} />
                <span className="text-lime">★</span>
              </dd>
            </div>
            <div className="pl-4">
              <dt className="text-sm text-fog">Quality checks</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                <Counter value={site.policies.checkpoints} suffix="-point" />
              </dd>
            </div>
          </motion.dl>
        </motion.div>

        <motion.div
          style={{ y: mediaY }}
          initial={{ opacity: 0, scale: 0.94, clipPath: "inset(12% 12% 12% 12% round 36px)" }}
          animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 36px)" }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] border border-line-strong bg-ink-3 sm:aspect-[5/4] lg:aspect-[4/5]">
            <AmbientVideo
              src="/media/video/hero.mp4"
              poster="/media/video/hero.jpg"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/30" />

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
              className="glass absolute left-4 top-4 flex items-center gap-2.5 rounded-full border border-line-strong py-2 pl-3 pr-4 text-sm sm:left-6 sm:top-6"
            >
              <BatteryIcon size={22} className="text-lime" loop />
              Battery health <span className="font-semibold text-lime">91%</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
              className="glass absolute right-4 top-[22%] hidden items-center gap-2.5 rounded-full border border-line-strong py-2 pl-3 pr-4 text-sm animate-float sm:flex sm:right-6"
            >
              <ShieldCheckIcon size={20} className="text-lime" loop />
              {site.policies.warrantyMonths}-month warranty
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25, duration: 0.8, ease: EASE }}
              className="glass absolute left-4 top-[40%] hidden items-center gap-2.5 rounded-full border border-line-strong py-2 pl-3 pr-4 text-sm sm:left-6 md:flex"
            >
              <SparkleIcon size={20} className="text-lime" loop />
              Grade A+ certified
            </motion.div>

            {deal && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.35, duration: 0.8, ease: EASE }}
                className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6"
              >
                <DealChip deal={deal} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
