import { Hero } from "@/components/home/hero";
import {
  BrandStrip,
  Categories,
  DealBand,
  FaqSection,
  Featured,
  Grades,
  Newsletter,
  Process,
  PromiseGrid,
  Reviews,
  Services,
  Store,
} from "@/components/home/sections";
import { getSummaries } from "@/lib/data";
import { fullAddress, site } from "@/lib/site";

function StoreJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phones[0].tel,
    email: site.emails[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pin,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHours: "Mo-Su 11:00-19:00",
    paymentAccepted: site.payments.join(", "),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}

export default async function HomePage() {
  const products = await getSummaries();
  const deal = products.find((p) => p.deal) ?? products[0] ?? null;

  return (
    <>
      <Hero deal={deal} />
      <BrandStrip />
      <PromiseGrid />
      <Categories products={products} />
      <Featured products={products} />
      {deal && <DealBand deal={deal} />}
      <Process />
      <Grades />
      <Services />
      <Reviews />
      <Store />
      <FaqSection />
      <Newsletter />
      <StoreJsonLd />
    </>
  );
}
