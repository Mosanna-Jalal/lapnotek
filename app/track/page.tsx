import type { Metadata } from "next";
import { IconHover, PhoneIcon, TruckIcon } from "@/components/motion-icons";
import { TrackForm } from "@/components/order-bits";
import { Eyebrow } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Enter your Lapnotek order ID to see where your laptop is.",
};

export default function TrackPage() {
  return (
    <div className="shell pb-8 pt-12 sm:pt-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Order tracking</Eyebrow>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
          Where is my <span className="accent">laptop?</span>
        </h1>
        <p className="mt-4 text-lg text-fog">
          Enter the order ID from your confirmation screen to see every step, from our bench to your
          door.
        </p>

        <div className="mt-10 rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
          <TrackForm />
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IconHover as="li" className="flex gap-4 rounded-3xl border border-line p-5">
            <TruckIcon size={24} className="mt-0.5 text-lime" />
            <span>
              <span className="block font-medium">Delivery timelines</span>
              <span className="block text-sm text-fog">
                Same day in {site.address.city}, 1–2 days across Bihar and Jharkhand, 3–6 days
                elsewhere.
              </span>
            </span>
          </IconHover>
          <IconHover as="li">
            <a
              href={`tel:${site.phones[1].tel}`}
              className="flex h-full gap-4 rounded-3xl border border-line p-5 transition-colors hover:border-lime/40"
            >
              <PhoneIcon size={24} className="mt-0.5 text-lime" />
              <span>
                <span className="block font-medium">Prefer to talk?</span>
                <span className="block text-sm text-fog">
                  Support {site.phones[1].display}, {site.hours.open} – {site.hours.close}
                </span>
              </span>
            </a>
          </IconHover>
        </ul>
      </div>
    </div>
  );
}
