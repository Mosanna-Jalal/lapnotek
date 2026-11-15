/**
 * Single source of truth for everything business-specific.
 *
 * Contact details, address and store hours are taken from the live
 * lapnotek.com contact page and the Google Business listing. Everything under
 * `policies` is sample copy for the demo and should be confirmed with the
 * owner before launch.
 */
export const site = {
  name: "Lapnotek",
  tagline: "Laptop & desktop store · Sales and service",
  description:
    "Certified pre-owned laptops, desktops and accessories from HP, Dell, Lenovo and Apple. Tested, graded and backed by warranty, from Gaya's most trusted computer store.",
  url: "https://www.lapnotek.com",
  year: 2026,

  address: {
    line1: "H55, Ground Floor, Gewal Bigha",
    line2: "Beside Munni Masjid",
    city: "Gaya",
    state: "Bihar",
    pin: "823001",
    country: "India",
  },

  /**
   * Map pin. This is an approximation of the Gewal Bigha / Church Road area,
   * so drop the exact coordinates from Google Maps in here before going live.
   */
  geo: { lat: 24.7874, lng: 84.9938 },
  mapsQuery: "Lapnotek, Gewal Bigha, Gaya, Bihar 823001",

  hours: { label: "Open daily", open: "11:00 am", close: "7:00 pm" },

  phones: [
    { label: "Sales", display: "+91 8750 5000 88", tel: "+918750500088" },
    { label: "Support", display: "+91 8750 5000 99", tel: "+918750500099" },
    { label: "Enquiry", display: "+91 88777 87271", tel: "+918877787271" },
  ],
  whatsapp: "918750500088",
  emails: ["hello@lapnotek.com", "lapnotek@gmail.com"],

  rating: { value: 4.9, count: 254, source: "Google" },
  customers: "1,00,000+",

  brands: ["HP", "Dell", "Lenovo", "Apple", "ASUS", "Microsoft"],
  payments: ["UPI", "PhonePe", "Paytm", "Credit card", "Debit card", "Net banking"],

  /** Sample policy copy for the demo. */
  policies: {
    warrantyMonths: 6,
    replacementDays: 7,
    checkpoints: 40,
    maxSavings: 72,
  },
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.state} ${site.address.pin}`;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
