import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatIcon, ClockIcon, IconHover, MapPinIcon, PhoneIcon } from "@/components/motion-icons";
import { EnquiryForm, ServicePhoto } from "@/components/order-bits";
import { StoreMap } from "@/components/store-map";
import { Eyebrow, buttonClass } from "@/components/ui";
import { fullAddress, mapsUrl, site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service, bulk orders and support",
  description:
    "Book a laptop or desktop repair, request a bulk quote for your office or institute, or ask the Lapnotek team a question.",
};

export default function SupportPage() {
  return (
    <div className="shell pb-8 pt-10 sm:pt-14">
      <header className="max-w-3xl">
        <Eyebrow>Service desk</Eyebrow>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
          Tell us what you need. <span className="accent">We will sort it.</span>
        </h1>
        <p className="mt-4 text-lg text-fog">
          Repairs, upgrades, bulk orders or a simple question. A technician reads every request and
          calls you back during store hours.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <Suspense fallback={<div className="skeleton h-[560px] rounded-[32px]" />}>
            <EnquiryForm />
          </Suspense>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <ServicePhoto src="/media/site/lab-1.jpg" alt="Technician repairing a laptop" />
            <ServicePhoto src="/media/site/lab-3.jpg" alt="Laptop internals and battery" />
            <ServicePhoto src="/media/site/lab-2.jpg" alt="Laptop being opened with a screwdriver" />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[32px] border border-line-strong">
            <StoreMap className="h-64" />
            <div className="space-y-5 bg-ink-2 p-6 sm:p-7">
              <p className="text-xl font-semibold tracking-tight">
                {site.name} store and service centre
              </p>
              <ul className="space-y-4 text-[15px]">
                <IconHover as="li" className="flex gap-3">
                  <MapPinIcon size={20} className="mt-0.5 text-lime" />
                  <span className="leading-relaxed text-fog">{fullAddress}</span>
                </IconHover>
                <IconHover as="li" className="flex gap-3">
                  <ClockIcon size={20} className="mt-0.5 text-lime" />
                  <span className="text-fog">
                    {site.hours.label}, {site.hours.open} – {site.hours.close}
                  </span>
                </IconHover>
                {site.phones.map((phone) => (
                  <IconHover as="li" key={phone.tel}>
                    <a href={`tel:${phone.tel}`} className="flex gap-3 hover:text-lime">
                      <PhoneIcon size={20} className="mt-0.5 text-lime" />
                      <span>
                        <span className="text-fog">{phone.label}</span>{" "}
                        <span className="tabular-nums">{phone.display}</span>
                      </span>
                    </a>
                  </IconHover>
                ))}
              </ul>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("primary", "md")}
                >
                  Get directions
                </a>
                <IconHover>
                  <a
                    href={whatsappUrl("Hi Lapnotek, I need help with my laptop.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("ghost", "md", "w-full")}
                  >
                    <ChatIcon size={18} className="text-lime" /> WhatsApp
                  </a>
                </IconHover>
              </div>
            </div>
          </div>
          <p className="px-2 text-sm text-mist">
            Email{" "}
            {site.emails.map((email, i) => (
              <span key={email}>
                {i > 0 && " or "}
                <a href={`mailto:${email}`} className="text-fog hover:text-snow">
                  {email}
                </a>
              </span>
            ))}
          </p>
        </aside>
      </div>
    </div>
  );
}
