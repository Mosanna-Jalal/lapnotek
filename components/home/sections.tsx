import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/pricing";
import { fullAddress, mapsUrl, site, whatsappUrl } from "@/lib/site";
import { AmbientVideo, CtaLink, Reveal, Stagger, StaggerItem } from "../motion";
import {
  ArrowIcon,
  AwardIcon,
  BoltIcon,
  BuildingIcon,
  ChatIcon,
  ClockIcon,
  CpuIcon,
  DesktopIcon,
  IconHover,
  LaptopIcon,
  LeafIcon,
  MapPinIcon,
  PhoneIcon,
  PlugIcon,
  RenewIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TruckIcon,
  WrenchIcon,
  type MotionIconProps,
} from "../motion-icons";
import { StoreMap } from "../store-map";
import { Eyebrow, Marquee, Monogram, SectionHeading, StarGlyph, buttonClass } from "../ui";
import { Countdown, Faq, FeaturedTabs, NewsletterForm, SavingsBars } from "./interactive";

type IconType = (props: MotionIconProps) => React.ReactNode;

export function BrandStrip() {
  return (
    <section aria-label="Brands we stock" className="border-y border-line py-7">
      <Marquee slow>
        {site.brands.map((brand) => (
          <span key={brand} className="flex items-center gap-10 pl-10">
            <span className="text-3xl font-semibold tracking-tight text-white/25 sm:text-4xl">
              {brand}
            </span>
            <SparkleIcon size={18} className="text-lime/60" loop />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

const PROMISES: { Icon: IconType; title: string; body: string }[] = [
  {
    Icon: AwardIcon,
    title: `${site.policies.checkpoints}-point certified`,
    body: "Battery, display, keyboard, ports, storage and thermals are tested and logged before a device is listed.",
  },
  {
    Icon: ShieldCheckIcon,
    title: `${site.policies.warrantyMonths}-month warranty`,
    body: "Covered by our own service desk, with Care+ plans that extend protection to 30 months.",
  },
  {
    Icon: RenewIcon,
    title: `${site.policies.replacementDays}-day replacement`,
    body: "Not what you expected? Swap it within a week, with no awkward questions.",
  },
  {
    Icon: TruckIcon,
    title: "Insured doorstep delivery",
    body: "Same day in Gaya, 1–2 days across Bihar and Jharkhand, and anywhere in India within a week.",
  },
  {
    Icon: WrenchIcon,
    title: "Service under one roof",
    body: "Repairs, upgrades and data transfer from the same people who sold you the machine.",
  },
  {
    Icon: LeafIcon,
    title: "Kinder to the planet",
    body: "Giving a good laptop a second life keeps e-waste out of landfill and skips the cost of building a new one.",
  },
];

export function PromiseGrid() {
  return (
    <section className="shell py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="The Lapnotek promise"
          title={
            <>
              Every device <span className="accent">earns</span> its place on our shelf.
            </>
          }
          lead="We are a service centre first. That is why we only sell machines we would be happy to repair, and rarely have to."
        />
      </Reveal>
      <Stagger as="ul" className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[32px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {PROMISES.map(({ Icon, title, body }) => (
          <StaggerItem as="li" key={title} className="bg-ink">
            <IconHover className="group h-full p-8 transition-colors duration-300 hover:bg-ink-2 sm:p-10">
              <span className="grid size-14 place-items-center rounded-2xl border border-line-strong bg-ink-3 text-lime transition-colors duration-300 group-hover:border-lime/50 group-hover:bg-lime group-hover:text-ink">
                <Icon size={28} playOnView />
              </span>
              <h3 className="mt-7 text-xl font-medium tracking-tight">{title}</h3>
              <p className="mt-2.5 leading-relaxed text-fog">{body}</p>
            </IconHover>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CategoryTile({
  href,
  image,
  label,
  note,
  Icon,
  className,
  sizes,
}: {
  href: string;
  image: string;
  label: string;
  note: string;
  Icon: IconType;
  className?: string;
  sizes: string;
}) {
  return (
    <IconHover className={className}>
      <Link
        href={href}
        className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-[28px] border border-line bg-ink-3 p-6 transition-colors hover:border-lime/40"
      >
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover opacity-70 transition-[transform,opacity] duration-700 ease-out-expo group-hover:scale-105 group-hover:opacity-90"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-line-strong bg-ink/60 text-lime backdrop-blur">
          <Icon size={22} />
        </span>
        <span className="relative flex items-end justify-between gap-4">
          <span>
            <span className="block text-2xl font-semibold tracking-tight">{label}</span>
            <span className="mt-1 block text-sm text-fog">{note}</span>
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-lime group-hover:text-ink">
            <ArrowIcon size={18} />
          </span>
        </span>
      </Link>
    </IconHover>
  );
}

export function Categories({ products }: { products: ProductSummary[] }) {
  const count = (category: ProductSummary["category"]) =>
    products.filter((p) => p.category === category).length;
  const from = (category: ProductSummary["category"]) => {
    const prices = products.filter((p) => p.category === category).map((p) => p.price);
    return prices.length ? formatINR(Math.min(...prices)) : "new stock soon";
  };

  return (
    <section className="shell pb-24 sm:pb-32">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Shop by category"
          title={
            <>
              Find the right machine in <span className="accent">two clicks.</span>
            </>
          }
        />
        <CtaLink href="/shop" variant="ghost">
          Browse everything
        </CtaLink>
      </Reveal>

      <Reveal className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-2">
        <CategoryTile
          href="/shop?category=laptop"
          image="/media/products/dell-xps-13-1.jpg"
          label="Laptops"
          note={`${count("laptop")} models · from ${from("laptop")}`}
          Icon={LaptopIcon}
          className="min-h-[300px] lg:col-span-3 lg:row-span-2"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <CategoryTile
          href="/shop?category=desktop"
          image="/media/products/ryzen-pc-1.jpg"
          label="Desktops"
          note={`${count("desktop")} models · from ${from("desktop")}`}
          Icon={DesktopIcon}
          className="lg:col-span-3"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <CategoryTile
          href="/shop?category=accessory"
          image="/media/products/acc-headphones.jpg"
          label="Accessories"
          note={`Chargers, displays and more · from ${from("accessory")}`}
          Icon={PlugIcon}
          className="lg:col-span-3"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </Reveal>

      <Stagger className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { use: "student", label: "Students", note: "Light, long-lasting", image: "cat-students", Icon: SparkleIcon },
          { use: "business", label: "Business", note: "Secure and durable", image: "cat-business", Icon: BuildingIcon },
          { use: "gaming", label: "Gaming", note: "RTX and high refresh", image: "cat-gaming", Icon: BoltIcon },
          { use: "creator", label: "Creators", note: "Colour-accurate power", image: "cat-creators", Icon: CpuIcon },
        ].map((tile) => (
          <StaggerItem key={tile.use}>
            <CategoryTile
              href={`/shop?use=${tile.use}`}
              image={`/media/site/${tile.image}.jpg`}
              label={tile.label}
              note={tile.note}
              Icon={tile.Icon}
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Featured({ products }: { products: ProductSummary[] }) {
  return (
    <section className="shell pb-24 sm:pb-32">
      <Reveal>
        <SectionHeading
          eyebrow="Fresh on the shelf"
          title={
            <>
              This week&apos;s <span className="accent">most wanted.</span>
            </>
          }
          lead="Stock changes daily. Every listing below is a real, single unit that has already passed our checks."
        />
      </Reveal>
      <Reveal className="mt-10" delay={0.1}>
        <FeaturedTabs products={products} />
      </Reveal>
    </section>
  );
}

export function DealBand({ deal }: { deal: ProductSummary }) {
  const off = discountPercent(deal.price, deal.mrp);
  return (
    <section className="shell pb-24 sm:pb-32">
      <Reveal className="relative overflow-hidden rounded-[40px] border border-line-strong bg-ink-2">
        <AmbientVideo
          src="/media/video/circuit.mp4"
          poster="/media/video/circuit.jpg"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />

        <div className="relative grid grid-cols-1 items-center gap-10 p-7 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <Eyebrow>Deal of the week</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              {deal.name} at <span className="accent">{off}% off.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-fog">{deal.tagline}. Ends Sunday midnight or when the last unit goes.</p>

            <div className="mt-8">
              <Countdown />
            </div>

            <div className="mt-8 max-w-md">
              <SavingsBars price={deal.price} mrp={deal.mrp} />
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <CtaLink href={`/product/${deal.slug}`} prefetch size="lg">
                Grab it for {formatINR(deal.price)}
              </CtaLink>
              <p className="text-sm text-fog">
                You keep <span className="font-semibold text-lime">{formatINR(deal.mrp - deal.price)}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/product/${deal.slug}`}
            prefetch
            className="group relative block aspect-[4/3] overflow-hidden rounded-[32px] border border-line-strong"
          >
            <Image
              src={deal.image}
              alt={deal.name}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
            <span className="absolute left-5 top-5 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink">
              Save {formatINR(deal.mrp - deal.price)}
            </span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

const STEPS: { Icon: IconType; title: string; body: string }[] = [
  {
    Icon: SearchIcon,
    title: "Inspect",
    body: "Machines arrive from corporate leases and trusted trade-ins. Each one is opened up and inspected inside and out.",
  },
  {
    Icon: WrenchIcon,
    title: "Restore",
    body: "Fresh thermal paste, a deep clean, new SSDs where needed and genuine parts for anything that shows wear.",
  },
  {
    Icon: CpuIcon,
    title: "Stress-test",
    body: `A ${site.policies.checkpoints}-point checklist and a full-load burn-in catch what a quick power-on never would.`,
  },
  {
    Icon: SparkleIcon,
    title: "Grade and pack",
    body: "We grade honestly, photograph the real unit and pack it to survive the journey to your door.",
  },
];

export function Process() {
  const lab = ["lab-1", "lab-3", "lab-2", "lab-6", "lab-4", "lab-7", "lab-5"];
  return (
    <section id="process" className="relative border-y border-line bg-ink-2 py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHeading
              eyebrow="Inside the lab"
              title={
                <>
                  Refurbished is a <span className="accent">process,</span> not a label.
                </>
              }
              lead="Anyone can wipe a laptop and call it refurbished. Ours go through the same bench our service customers trust with their own machines."
            />
          </Reveal>
          <Reveal delay={0.1} className="relative mt-10">
            <div className="relative aspect-video overflow-hidden rounded-[28px] border border-line-strong">
              <AmbientVideo
                src="/media/video/lab.mp4"
                poster="/media/video/lab.jpg"
                className="absolute inset-0 size-full object-cover"
              />
              <span className="glass absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 text-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-lime" />
                </span>
                Board-level diagnostics
              </span>
            </div>
            <div className="absolute -bottom-8 -right-3 hidden aspect-video w-52 overflow-hidden rounded-2xl border border-line-strong shadow-2xl shadow-black/60 sm:block">
              <AmbientVideo
                src="/media/video/workshop.mp4"
                poster="/media/video/workshop.jpg"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </Reveal>
        </div>

        <Stagger as="ol" className="space-y-4">
          {STEPS.map(({ Icon, title, body }, i) => (
            <StaggerItem as="li" key={title}>
              <IconHover className="group flex gap-6 rounded-[28px] border border-line bg-ink p-7 transition-colors hover:border-lime/40 sm:p-8">
                <span className="flex flex-col items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl bg-lime text-ink">
                    <Icon size={26} playOnView strokeWidth={1.8} />
                  </span>
                  <span className="font-mono text-xs text-mist">0{i + 1}</span>
                </span>
                <span>
                  <h3 className="text-2xl font-medium tracking-tight">{title}</h3>
                  <p className="mt-2 leading-relaxed text-fog">{body}</p>
                </span>
              </IconHover>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="mt-20">
        <Marquee>
          {lab.map((name) => (
            <span
              key={name}
              className="relative ml-4 block aspect-[4/3] w-72 shrink-0 overflow-hidden rounded-3xl border border-line sm:w-96"
            >
              <Image
                src={`/media/site/${name}.jpg`}
                alt="Technician working on a laptop at the service bench"
                fill
                sizes="384px"
                className="object-cover"
              />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

const GRADES = [
  {
    grade: "A+",
    name: "Like new",
    body: "No visible marks on the lid, deck or screen. Hard to tell apart from a sealed box.",
    battery: "90%+",
    look: 5,
  },
  {
    grade: "A",
    name: "Excellent",
    body: "Faint signs of careful use that disappear at arm's length. Our most popular grade.",
    battery: "85%+",
    look: 4,
  },
  {
    grade: "B",
    name: "Good",
    body: "Light marks on the lid or base and a flawless screen. Identical performance, best value.",
    battery: "80%+",
    look: 3,
  },
];

export function Grades() {
  return (
    <section id="grades" className="shell py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Grades, explained"
          title={
            <>
              The only difference is <span className="accent">skin-deep.</span>
            </>
          }
          lead="Every grade passes the same performance tests and carries the same warranty. The grade only describes how the device looks."
        />
      </Reveal>
      <Stagger className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {GRADES.map((g) => (
          <StaggerItem key={g.grade}>
            <article className="group h-full rounded-[32px] border border-line bg-ink-2 p-8 transition-colors hover:border-lime/40 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="text-7xl font-semibold tracking-tighter text-lime">{g.grade}</span>
                <Link
                  href={`/shop?grade=${encodeURIComponent(g.grade)}`}
                  className="rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-lime hover:text-lime"
                >
                  Shop grade {g.grade}
                </Link>
              </div>
              <h3 className="mt-6 text-2xl font-medium tracking-tight">{g.name}</h3>
              <p className="mt-2 leading-relaxed text-fog">{g.body}</p>
              <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-fog">Cosmetic condition</dt>
                  <dd className="flex gap-1" aria-label={`${g.look} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={i < g.look ? "h-1.5 w-6 rounded-full bg-lime" : "h-1.5 w-6 rounded-full bg-white/10"}
                      />
                    ))}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-fog">Battery health</dt>
                  <dd className="font-medium">{g.battery}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-fog">Performance and warranty</dt>
                  <dd className="font-medium">Identical</dd>
                </div>
              </dl>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

const SERVICES: { Icon: IconType; title: string; body: string; href: string; cta: string }[] = [
  {
    Icon: WrenchIcon,
    title: "Repair and service",
    body: "Screens, keyboards, batteries, motherboards and liquid damage, for laptops and desktops of every brand.",
    href: "/support?type=service",
    cta: "Book a service",
  },
  {
    Icon: BoltIcon,
    title: "Upgrades and data transfer",
    body: "More RAM, a faster SSD, a fresh Windows install, and everything from your old machine moved across.",
    href: "/support?type=service",
    cta: "Plan an upgrade",
  },
  {
    Icon: BuildingIcon,
    title: "Bulk buy for teams",
    body: "Offices, schools and coaching centres get matched fleets, GST invoices and on-site support.",
    href: "/support?type=bulk",
    cta: "Get a bulk quote",
  },
];

export function Services() {
  return (
    <section className="shell pb-24 sm:pb-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="More than a store"
            title={
              <>
                A service desk that <span className="accent">picks up.</span>
              </>
            }
            lead="Lapnotek started as a laptop and desktop service provider. That bench is still the heart of the shop."
          />
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[28px] border border-line">
            <Image
              src="/media/site/bulk.jpg"
              alt="A team working on laptops in an office"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <p className="absolute inset-x-6 bottom-6 text-lg font-medium">
              Fleets of 5 to 500, configured and delivered together.
            </p>
          </div>
        </Reveal>

        <Stagger className="space-y-4">
          {SERVICES.map(({ Icon, title, body, href, cta }) => (
            <StaggerItem key={title}>
              <IconHover>
                <Link
                  href={href}
                  className="group flex flex-col gap-6 rounded-[28px] border border-line bg-ink-2 p-7 transition-colors hover:border-lime/40 sm:flex-row sm:items-center sm:p-8"
                >
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-line-strong bg-ink-3 text-lime transition-colors group-hover:bg-lime group-hover:text-ink">
                    <Icon size={30} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-2xl font-medium tracking-tight">{title}</span>
                    <span className="mt-1.5 block leading-relaxed text-fog">{body}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-lime">
                    {cta} <ArrowIcon size={18} />
                  </span>
                </Link>
              </IconHover>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/*
 * Sample testimonials for the demo. Replace these with real Google reviews
 * (with the reviewers' permission) before the site goes live.
 */
const REVIEWS = [
  {
    name: "Aditya Raj",
    place: "Gaya",
    text: "Bought a ThinkPad for my coding classes. It looked brand new and the battery easily lasts my whole day at college.",
  },
  {
    name: "Sneha Kumari",
    place: "Bodh Gaya",
    text: "They showed me the battery report and test results before I paid. Nobody else in the market does that.",
  },
  {
    name: "Imran Ansari",
    place: "Patna",
    text: "Ordered online and it reached Patna the next day, packed like a new laptop. Setup was already done.",
  },
  {
    name: "Priyanka Singh",
    place: "Nawada",
    text: "We bought twelve Dell Latitudes for our coaching centre. One GST invoice, one delivery, zero problems.",
  },
  {
    name: "Rahul Verma",
    place: "Aurangabad",
    text: "My old HP was dead and another shop said to bin it. Lapnotek repaired it in two days for a fair price.",
  },
  {
    name: "Neha Gupta",
    place: "Gaya",
    text: "A MacBook Air at half the price with a warranty. I was nervous about refurbished and now I recommend it to everyone.",
  },
];

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <figure className="ml-5 w-[340px] shrink-0 rounded-[28px] border border-line bg-ink-2 p-7 sm:w-[400px]">
      <div className="flex gap-1 text-lime" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }, (_, i) => (
          <StarGlyph key={i} size={15} />
        ))}
      </div>
      <blockquote className="mt-4 text-lg leading-relaxed">“{review.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Monogram name={review.name} />
        <span>
          <span className="block font-medium">{review.name}</span>
          <span className="block text-sm text-fog">{review.place}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  return (
    <section className="border-y border-line bg-ink-2 py-24 sm:py-32">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Word of mouth"
            title={
              <>
                Rated <span className="accent">{site.rating.value}</span> by the people who matter.
              </>
            }
          />
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent("LAPNOTEK Reviews")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-3xl border border-line-strong bg-ink px-6 py-4 transition-colors hover:border-lime/40"
          >
            <span className="text-5xl font-semibold tracking-tighter">{site.rating.value}</span>
            <span>
              <span className="flex gap-1 text-lime">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarGlyph key={i} size={16} />
                ))}
              </span>
              <span className="mt-1 block text-sm text-fog">
                {site.rating.count} reviews on {site.rating.source}
              </span>
            </span>
          </a>
        </Reveal>
      </div>
      <div className="mt-14 space-y-5">
        <Marquee slow>
          {REVIEWS.slice(0, 3).map((r) => (
            <ReviewCard key={r.name} review={r} />
          ))}
        </Marquee>
        <Marquee>
          {REVIEWS.slice(3).map((r) => (
            <ReviewCard key={r.name} review={r} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

export function Store() {
  return (
    <section id="store" className="shell py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Visit us"
          title={
            <>
              See it, hold it, <span className="accent">test it</span> in person.
            </>
          }
          lead={`Our store and service bench are in Gewal Bigha, ${site.address.city}. Walk in, try any laptop on the shelf and leave with it the same day.`}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid grid-cols-1 overflow-hidden rounded-[36px] border border-line-strong lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <StoreMap className="min-h-[360px] lg:min-h-[520px]" />

        <div className="flex flex-col gap-7 bg-ink-2 p-8 sm:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">Store and service centre</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{site.name}</p>
          </div>

          <ul className="space-y-5">
            <IconHover as="li" className="flex gap-4">
              <MapPinIcon size={22} className="mt-0.5 text-lime" />
              <span className="leading-relaxed text-fog">{fullAddress}</span>
            </IconHover>
            <IconHover as="li" className="flex gap-4">
              <ClockIcon size={22} className="mt-0.5 text-lime" />
              <span className="text-fog">
                {site.hours.label}
                <span className="block text-snow">
                  {site.hours.open} – {site.hours.close}
                </span>
              </span>
            </IconHover>
            {site.phones.map((phone) => (
              <IconHover as="li" key={phone.tel}>
                <a href={`tel:${phone.tel}`} className="flex gap-4 hover:text-lime">
                  <PhoneIcon size={22} className="mt-0.5 text-lime" />
                  <span>
                    <span className="block text-sm text-fog">{phone.label}</span>
                    <span className="tabular-nums">{phone.display}</span>
                  </span>
                </a>
              </IconHover>
            ))}
          </ul>

          <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md")}>
              Get directions
            </a>
            <IconHover>
              <a
                href={whatsappUrl("Hi Lapnotek, I would like to visit the store.")}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("ghost", "md", "w-full")}
              >
                <ChatIcon size={18} className="text-lime" /> WhatsApp us
              </a>
            </IconHover>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FAQS = [
  {
    q: "What exactly does “certified pre-owned” mean at Lapnotek?",
    a: `Every device is opened, cleaned and tested against a ${site.policies.checkpoints}-point checklist on our own service bench. Worn parts are replaced, storage is wiped and reinstalled, and the battery is measured. Only machines that pass are graded and listed.`,
  },
  {
    q: "What warranty do I get?",
    a: `Every laptop and desktop comes with a ${site.policies.warrantyMonths}-month Lapnotek warranty handled by our own technicians. You can add Care+ at checkout to extend cover by 12 or 24 months. Accessories carry a 3-month warranty.`,
  },
  {
    q: "Can I return or replace a device?",
    a: `Yes. If the device is not as described, tell us within ${site.policies.replacementDays} days of delivery and we will replace it or refund you. Just keep the original packing.`,
  },
  {
    q: "How long does delivery take, and is it safe?",
    a: "Orders within Gaya are delivered the same day, or you can pick up from the store in about two hours. Bihar and Jharkhand take 1–2 days with express, and the rest of India 3–6 days. Every shipment is insured and packed in impact foam.",
  },
  {
    q: "How can I pay?",
    a: `We accept ${site.payments.join(", ")}. Pay on delivery is available for delivery orders, and you can also reserve online and pay at the store.`,
  },
  {
    q: "Do you buy or service laptops as well?",
    a: "We do. Raise a service request for repairs and upgrades, or bring your old machine in for a valuation. Offices and institutes can ask for a bulk quote with GST invoicing.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="shell pb-24 sm:pb-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-20">
        <Reveal>
          <SectionHeading
            eyebrow="Good questions"
            title={
              <>
                Answers, <span className="accent">straight.</span>
              </>
            }
            lead="Still unsure? Call or WhatsApp us and talk to a technician, not a call centre."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${site.phones[0].tel}`} className={buttonClass("dark", "md")}>
              <PhoneIcon size={18} className="text-lime" /> {site.phones[0].display}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Faq items={FAQS} />
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="shell">
      <Reveal className="relative overflow-hidden rounded-[40px] border border-line-strong bg-ink-2 px-7 py-14 sm:px-14 sm:py-20">
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-lime/15 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              The best units sell in <span className="accent">hours.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-fog">
              Get a short message when fresh stock and price drops land. No spam, unsubscribe any time.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </Reveal>
    </section>
  );
}
