import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { TotalsList } from "@/components/cart/cart-view";
import { CtaLink } from "@/components/motion";
import {
  BoxIcon,
  ChatIcon,
  IconHover,
  MapPinIcon,
  SearchIcon,
  SuccessMark,
  TruckIcon,
} from "@/components/motion-icons";
import { CopyButton } from "@/components/order-bits";
import { CheckGlyph, buttonClass } from "@/components/ui";
import { cx, formatDate, formatDateTime, formatINR } from "@/lib/format";
import { getOrder } from "@/lib/orders";
import { deliveryOption, paymentOption, warrantyPlan } from "@/lib/pricing";
import { fullAddress, site, whatsappUrl } from "@/lib/site";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const DAY = 24 * 60 * 60 * 1000;

function timeline(order: Order) {
  const placed = new Date(order.createdAt).getTime();
  const at = (days: number) => formatDate(new Date(placed + days * DAY).toISOString());

  if (order.delivery === "pickup") {
    return [
      { title: "Order confirmed", note: formatDateTime(order.createdAt), done: true },
      { title: "Tested and packed", note: "Final bench check before handover", done: false },
      { title: "Ready for pickup", note: "We will message you, usually within 2 hours", done: false },
      { title: "Collected", note: `${site.hours.open} – ${site.hours.close} at our store`, done: false },
    ];
  }
  const express = order.delivery === "express";
  return [
    { title: "Order confirmed", note: formatDateTime(order.createdAt), done: true },
    { title: "Tested and packed", note: `Expected ${at(express ? 0 : 1)}`, done: false },
    { title: "Shipped", note: `Expected ${at(express ? 1 : 2)}`, done: false },
    { title: "Delivered", note: `Expected by ${at(express ? 2 : 6)}`, done: false },
  ];
}

function OrderMissing({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-[36px] border border-line bg-ink-2 px-6 py-16 text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full border border-line-strong bg-ink-3 text-lime">
        <SearchIcon size={34} loop />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">We could not find that order</h1>
      <p className="mt-3 text-fog">
        Nothing matches <span className="font-mono text-snow">{id}</span>. Check the ID in your
        confirmation message, or call us and we will look it up.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <CtaLink href="/track">Try another ID</CtaLink>
        <a href={`tel:${site.phones[1].tel}`} className={buttonClass("ghost", "md")}>
          Call support
        </a>
      </div>
    </div>
  );
}

async function OrderContent({ params }: Pick<PageProps<"/order/[id]">, "params">) {
  const { id } = await params;
  const order = await getOrder(decodeURIComponent(id));
  if (!order) return <OrderMissing id={decodeURIComponent(id).slice(0, 40)} />;

  const delivery = deliveryOption(order.delivery);
  const payment = paymentOption(order.payment);
  const steps = timeline(order);
  const firstName = order.customer.name.split(" ")[0];

  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center text-lime">
          <SuccessMark size={104} />
        </div>
        <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Thank you, <span className="accent">{firstName}.</span>
        </h1>
        <p className="mt-4 text-lg text-fog">
          Your order is confirmed and already on its way to our bench for a final check. Keep
          your order ID handy to track it any time.
        </p>
        <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-line-strong bg-ink-2 py-2 pl-5 pr-2">
          <span className="text-sm text-fog">Order ID</span>
          <span className="font-mono text-lg font-medium tracking-wider">{order.id}</span>
          <CopyButton value={order.id} />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold">
              <TruckIcon size={24} className="text-lime" loop /> What happens next
            </h2>
            <ol className="mt-7">
              {steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < steps.length - 1 && (
                    <span
                      className={cx(
                        "absolute left-[13px] top-7 h-full w-px",
                        step.done ? "bg-lime/50" : "bg-line-strong",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cx(
                      "relative grid size-7 shrink-0 place-items-center rounded-full border",
                      step.done ? "border-lime bg-lime text-ink" : "border-line-strong bg-ink-3",
                    )}
                  >
                    {step.done ? (
                      <CheckGlyph size={14} strokeWidth={3} />
                    ) : (
                      <span className="size-1.5 rounded-full bg-mist" />
                    )}
                  </span>
                  <span>
                    <span className={cx("block font-medium", !step.done && "text-fog")}>{step.title}</span>
                    <span className="block text-sm text-mist">{step.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold">
              <BoxIcon size={24} className="text-lime" playOnView /> Items
            </h2>
            <ul className="mt-5 divide-y divide-line">
              {order.items.map((item) => (
                <li key={`${item.slug}:${item.variantId}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-ink-3"
                  >
                    <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.name}</span>
                    <span className="block text-sm text-fog">{item.variantLabel}</span>
                    <span className="block text-sm text-mist">
                      Qty {item.qty}
                      {item.warranty !== "standard" && ` · ${warrantyPlan(item.warranty).label} warranty`}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatINR(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-line-strong bg-ink-2 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Payment summary</h2>
            <div className="mt-5">
              <TotalsList totals={order.totals} couponCode={order.couponCode} />
            </div>
            <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-fog">
              {payment.label} · {order.payment === "cod" || order.payment === "store" ? "pay when you receive it" : "demo order, nothing was charged"}
            </p>
          </section>

          <section className="rounded-[32px] border border-line bg-ink-2 p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 text-xl font-semibold">
              <MapPinIcon size={24} className="text-lime" playOnView />
              {order.delivery === "pickup" ? "Pickup" : "Delivering to"}
            </h2>
            <address className="mt-4 not-italic leading-relaxed text-fog">
              <span className="block font-medium text-snow">{order.customer.name}</span>
              {order.delivery === "pickup" ? (
                <span className="block">{fullAddress}</span>
              ) : (
                <>
                  <span className="block">
                    {order.address.line1}
                    {order.address.line2 && `, ${order.address.line2}`}
                  </span>
                  <span className="block">
                    {order.address.city}, {order.address.state} {order.address.pin}
                  </span>
                </>
              )}
              <span className="mt-2 block tabular-nums">+91 {order.customer.phone}</span>
            </address>
            <p className="mt-4 text-sm text-mist">
              {delivery.label} · {delivery.detail}
            </p>
            {order.note && <p className="mt-3 text-sm text-fog">Note: {order.note}</p>}
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <CtaLink href="/shop" className="w-full">
              Keep shopping
            </CtaLink>
            <IconHover>
              <a
                href={whatsappUrl(`Hi Lapnotek, I have a question about order ${order.id}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("ghost", "md", "w-full")}
              >
                <ChatIcon size={18} className="text-lime" /> Ask about this order
              </a>
            </IconHover>
          </div>
        </div>
      </div>
    </>
  );
}

function OrderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <div className="skeleton size-24 rounded-full" />
        <div className="skeleton h-12 w-4/5 rounded-2xl" />
        <div className="skeleton h-5 w-3/5 rounded-full" />
      </div>
      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="skeleton h-80 rounded-[32px]" />
        <div className="skeleton h-80 rounded-[32px]" />
      </div>
    </div>
  );
}

export default function OrderPage({ params }: PageProps<"/order/[id]">) {
  return (
    <div className="shell pb-8 pt-12 sm:pt-16">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderContent params={params} />
      </Suspense>
    </div>
  );
}
