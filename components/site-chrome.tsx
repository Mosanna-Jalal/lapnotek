import Link from "next/link";
import { getDataSource, getSummaries } from "@/lib/data";
import { fullAddress, mapsUrl, site, whatsappUrl } from "@/lib/site";
import { HeaderClient, Logo } from "./header-client";
import {
  ChatIcon,
  ClockIcon,
  HeadsetIcon,
  IconHover,
  MapPinIcon,
  PhoneIcon,
  RenewIcon,
  RupeeIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "./motion-icons";
import { Marquee, StarGlyph } from "./ui";

export function AnnouncementBar() {
  const items = [
    { Icon: TruckIcon, text: "Free insured delivery across India" },
    { Icon: ShieldCheckIcon, text: `${site.policies.warrantyMonths}-month warranty on every device` },
    { Icon: RenewIcon, text: `${site.policies.replacementDays}-day easy replacement` },
    { Icon: RupeeIcon, text: `Save up to ${site.policies.maxSavings}% against new` },
    { Icon: MapPinIcon, text: `Visit us at Gewal Bigha, ${site.address.city}` },
    { Icon: HeadsetIcon, text: `Sales ${site.phones[0].display}` },
  ];
  return (
    <div className="relative z-50 border-b border-line bg-ink-2 text-[13px] text-fog">
      <Marquee>
        {items.map(({ Icon, text }) => (
          <span key={text} className="flex items-center gap-2 whitespace-nowrap px-7 py-2.5">
            <Icon size={16} className="text-lime" loop />
            {text}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

export async function Header() {
  const index = await getSummaries();
  return <HeaderClient index={index} />;
}

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "Laptops", href: "/shop?category=laptop" },
      { label: "Desktops", href: "/shop?category=desktop" },
      { label: "Accessories", href: "/shop?category=accessory" },
      { label: "Deals of the week", href: "/shop?deal=1" },
      { label: "Gaming", href: "/shop?use=gaming" },
      { label: "For students", href: "/shop?use=student" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track an order", href: "/track" },
      { label: "Service request", href: "/support?type=service" },
      { label: "Bulk buy for offices", href: "/support?type=bulk" },
      { label: "How we refurbish", href: "/#process" },
      { label: "Grades explained", href: "/#grades" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
];

async function DataSourceNote() {
  const source = await getDataSource();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
      <span className={source === "mongodb" ? "size-1.5 rounded-full bg-lime" : "size-1.5 rounded-full bg-ember"} />
      {source === "mongodb" ? "Catalogue: MongoDB" : "Catalogue: demo data"}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-2">
      <div className="shell grid grid-cols-1 gap-12 py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fog">
            {site.address.city}&apos;s trusted store for certified pre-owned laptops, desktops and
            accessories, with a service desk that actually picks up the phone.
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent("LAPNOTEK Reviews")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-line px-4 py-3 transition-colors hover:border-line-strong"
          >
            <span className="text-2xl font-semibold tabular-nums">{site.rating.value}</span>
            <span>
              <span className="flex gap-0.5 text-lime">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarGlyph key={i} size={13} />
                ))}
              </span>
              <span className="mt-0.5 block text-xs text-fog">
                {site.rating.count} {site.rating.source} reviews
              </span>
            </span>
          </a>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
              {group.title}
            </h2>
            <ul className="mt-5 space-y-3 text-[15px]">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-fog transition-colors hover:text-snow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">Visit the store</h2>
          <ul className="mt-5 space-y-4 text-[15px] text-fog">
            <IconHover as="li">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 transition-colors hover:text-snow"
              >
                <MapPinIcon size={20} className="mt-0.5 text-lime" />
                <span>{fullAddress}</span>
              </a>
            </IconHover>
            <IconHover as="li" className="flex gap-3">
              <ClockIcon size={20} className="mt-0.5 text-lime" />
              <span>
                {site.hours.label}, {site.hours.open} – {site.hours.close}
              </span>
            </IconHover>
            {site.phones.map((phone) => (
              <IconHover as="li" key={phone.tel}>
                <a href={`tel:${phone.tel}`} className="flex gap-3 transition-colors hover:text-snow">
                  <PhoneIcon size={20} className="mt-0.5 text-lime" />
                  <span>
                    <span className="text-mist">{phone.label}</span> {phone.display}
                  </span>
                </a>
              </IconHover>
            ))}
            <IconHover as="li">
              <a
                href={whatsappUrl("Hi Lapnotek, I have a question about a laptop.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 transition-colors hover:text-snow"
              >
                <ChatIcon size={20} className="mt-0.5 text-lime" />
                <span>Chat on WhatsApp</span>
              </a>
            </IconHover>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {site.year} {site.name}. All rights reserved. ·{" "}
            {site.emails.map((email, i) => (
              <span key={email}>
                {i > 0 && " · "}
                <a href={`mailto:${email}`} className="hover:text-snow">
                  {email}
                </a>
              </span>
            ))}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {site.payments.map((method) => (
              <span key={method} className="rounded-md border border-line px-2 py-1 text-[11px] text-fog">
                {method}
              </span>
            ))}
            {process.env.NODE_ENV !== "production" && <DataSourceNote />}
          </div>
        </div>
      </div>
    </footer>
  );
}
