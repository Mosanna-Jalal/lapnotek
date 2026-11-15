import type { Coupon, Grade, Product, UseCase, Variant } from "./types";

/**
 * Demo catalogue. `npm run seed` copies this into the `products` and `coupons`
 * collections of the lapnotek database; until MongoDB is connected the site
 * serves it straight from this file.
 *
 * Keep this file free of runtime imports so the seed script can load it with
 * plain `node`.
 */

const img = (...names: string[]) => names.map((n) => `/media/products/${n}.jpg`);

const v = (id: string, label: string, price: number, mrp: number, stock: number): Variant => ({
  id,
  label,
  price,
  mrp,
  stock,
});

interface ComputerInput {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  images: string[];
  grade: Grade;
  variants: Variant[];
  specs: [string, string][];
  highlights: string[];
  useCases: UseCase[];
  rating: number;
  reviews: number;
  badge?: string;
  featured?: boolean;
  deal?: boolean;
  batteryHealth?: number;
}

let order = 0;

function laptop(input: ComputerInput): Product {
  order += 1;
  return {
    ...input,
    sku: `LNK-L${String(order).padStart(3, "0")}`,
    category: "laptop",
    warrantyMonths: 6,
    inBox: ["Laptop", "Original-spec charger", "Warranty card", "GST invoice"],
    sort: order,
  };
}

function desktop(input: ComputerInput): Product {
  order += 1;
  return {
    ...input,
    sku: `LNK-D${String(order).padStart(3, "0")}`,
    category: "desktop",
    warrantyMonths: 6,
    inBox: ["Desktop unit", "Power cable", "Warranty card", "GST invoice"],
    sort: order,
  };
}

function accessory(input: {
  slug: string;
  name: string;
  brand: string;
  subcategory: string;
  tagline: string;
  description: string;
  image: string;
  price: number;
  mrp: number;
  stock: number;
  specs: [string, string][];
  rating: number;
  reviews: number;
}): Product {
  order += 1;
  return {
    slug: input.slug,
    sku: `LNK-A${String(order).padStart(3, "0")}`,
    name: input.name,
    brand: input.brand,
    category: "accessory",
    subcategory: input.subcategory,
    tagline: input.tagline,
    description: input.description,
    images: img(input.image),
    variants: [v("default", "Standard", input.price, input.mrp, input.stock)],
    specs: input.specs,
    highlights: [],
    useCases: ["everyday"],
    rating: input.rating,
    reviews: input.reviews,
    warrantyMonths: 3,
    inBox: [input.name, "GST invoice"],
    sort: order,
  };
}

export const CATALOG: Product[] = [
  laptop({
    slug: "dell-latitude-3410",
    name: "Dell Latitude 3410",
    brand: "Dell",
    tagline: "The office favourite, at a third of the price",
    description:
      "A tough, no-nonsense 14-inch business laptop with a 10th Gen Core i5, a bright Full HD panel and a keyboard built for long days. Every unit gets a fresh SSD image, new thermal paste and a full battery report before it leaves our bench.",
    images: img("dell-latitude-1", "dell-latitude-2", "dell-latitude-3"),
    grade: "A",
    variants: [
      v("8-256", "8GB · 256GB SSD", 19040, 68000, 9),
      v("16-512", "16GB · 512GB SSD", 23540, 78000, 4),
    ],
    specs: [
      ["Processor", "Intel Core i5-10210U (4 cores, up to 4.2 GHz)"],
      ["Display", "14″ Full HD (1920 × 1080) anti-glare"],
      ["Graphics", "Intel UHD Graphics"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "Up to 7 hours · health 88%+"],
      ["Ports", "USB-C, 2 × USB-A, HDMI, RJ45, microSD"],
      ["Weight", "1.6 kg"],
    ],
    highlights: ["10th Gen Core i5", "Full HD display", "Windows 11 Pro", "Backlit keyboard"],
    useCases: ["business", "student", "everyday"],
    rating: 4.8,
    reviews: 318,
    badge: "Bestseller",
    featured: true,
    deal: true,
    batteryHealth: 88,
  }),
  laptop({
    slug: "apple-macbook-air-m1",
    name: "Apple MacBook Air 13″ (M1, 2020)",
    brand: "Apple",
    tagline: "Silent, all-day and still shockingly fast",
    description:
      "The fanless MacBook Air that changed everything. Apple's M1 chip, a Retina display and battery life that comfortably clears a full day of classes or meetings. Cosmetically graded A+ with battery health above 90%.",
    images: img("macbook-air-m1-1", "macbook-air-m1-2", "macbook-air-m1-3", "macbook-air-m1-4"),
    grade: "A+",
    variants: [
      v("8-256", "8GB · 256GB SSD", 46990, 92900, 6),
      v("8-512", "8GB · 512GB SSD", 54990, 112900, 3),
      v("16-512", "16GB · 512GB SSD", 62990, 132900, 2),
    ],
    specs: [
      ["Processor", "Apple M1 (8-core CPU, 7-core GPU)"],
      ["Display", "13.3″ Retina (2560 × 1600), True Tone"],
      ["Operating system", "macOS Sequoia"],
      ["Battery", "Up to 15 hours · health 91%+"],
      ["Ports", "2 × Thunderbolt / USB 4, headphone jack"],
      ["Weight", "1.29 kg"],
    ],
    highlights: ["Apple M1", "Retina display", "15-hour battery", "Fanless"],
    useCases: ["student", "creator", "everyday"],
    rating: 4.9,
    reviews: 212,
    badge: "Top rated",
    featured: true,
    batteryHealth: 91,
  }),
  laptop({
    slug: "lenovo-thinkpad-t14-gen-2",
    name: "Lenovo ThinkPad T14 Gen 2",
    brand: "Lenovo",
    tagline: "The keyboard everyone else is measured against",
    description:
      "A military-grade chassis, the legendary ThinkPad keyboard and an 11th Gen Core processor. The T14 is the laptop IT departments trust, and ours comes with a fresh SSD and a spotless service history.",
    images: img("thinkpad-t14-1", "thinkpad-t14-2", "thinkpad-t14-3"),
    grade: "A",
    variants: [
      v("i5-16-512", "Core i5 · 16GB · 512GB", 28990, 124000, 7),
      v("i7-16-512", "Core i7 · 16GB · 512GB", 34990, 145000, 3),
    ],
    specs: [
      ["Processor", "Intel Core i5-1135G7 / i7-1165G7"],
      ["Display", "14″ Full HD IPS, 300 nits"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "Up to 9 hours · health 86%+"],
      ["Ports", "2 × USB-C (Thunderbolt 4), 2 × USB-A, HDMI, RJ45"],
      ["Weight", "1.47 kg"],
    ],
    highlights: ["11th Gen Intel", "MIL-STD tested", "Thunderbolt 4", "Fingerprint reader"],
    useCases: ["business", "student"],
    rating: 4.8,
    reviews: 187,
    featured: true,
    batteryHealth: 86,
  }),
  laptop({
    slug: "hp-elitebook-840-g8",
    name: "HP EliteBook 840 G8",
    brand: "HP",
    tagline: "Aluminium, light and built for business",
    description:
      "An all-aluminium 14-inch ultrabook with Iris Xe graphics, Bang & Olufsen speakers and a privacy camera shutter. Light enough to carry daily, strong enough to last years.",
    images: img("hp-elitebook-1", "hp-elitebook-2", "hp-elitebook-3"),
    grade: "A",
    variants: [
      v("i5-16-256", "Core i5 · 16GB · 256GB", 27990, 118000, 8),
      v("i7-16-512", "Core i7 · 16GB · 512GB", 33990, 139000, 4),
    ],
    specs: [
      ["Processor", "Intel Core i5-1135G7 / i7-1165G7"],
      ["Display", "14″ Full HD IPS, 400 nits"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "Up to 10 hours · health 87%+"],
      ["Ports", "2 × Thunderbolt 4, 2 × USB-A, HDMI"],
      ["Weight", "1.32 kg"],
    ],
    highlights: ["Aluminium body", "B&O audio", "Thunderbolt 4", "1.32 kg"],
    useCases: ["business", "everyday"],
    rating: 4.8,
    reviews: 241,
    badge: "Bestseller",
    featured: true,
    batteryHealth: 87,
  }),
  laptop({
    slug: "dell-xps-13-9310",
    name: "Dell XPS 13 (9310)",
    brand: "Dell",
    tagline: "Edge-to-edge display in a 1.2 kg body",
    description:
      "The XPS 13 is the Windows ultrabook to beat: a machined aluminium shell, a carbon-fibre palm rest and a nearly borderless 16:10 display. Graded A+ and indistinguishable from new.",
    images: img("dell-xps-13-1", "dell-xps-13-2", "dell-xps-13-3", "dell-xps-13-4"),
    grade: "A+",
    variants: [
      v("i5-8-256", "Core i5 · 8GB · 256GB", 42990, 109990, 4),
      v("i7-16-512", "Core i7 · 16GB · 512GB", 52990, 149990, 3),
    ],
    specs: [
      ["Processor", "Intel Core i5-1135G7 / i7-1165G7"],
      ["Display", "13.4″ FHD+ (1920 × 1200) InfinityEdge"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 11 hours · health 90%+"],
      ["Ports", "2 × Thunderbolt 4, microSD, headphone jack"],
      ["Weight", "1.2 kg"],
    ],
    highlights: ["InfinityEdge display", "Machined aluminium", "1.2 kg", "Intel Evo"],
    useCases: ["business", "creator"],
    rating: 4.8,
    reviews: 74,
    featured: true,
    batteryHealth: 90,
  }),
  laptop({
    slug: "asus-tuf-gaming-f15",
    name: "ASUS TUF Gaming F15",
    brand: "ASUS",
    tagline: "144 Hz and an RTX card without the new-laptop bill",
    description:
      "An 11th Gen H-series processor, RTX graphics and a 144 Hz panel in a chassis that survives LAN parties. Repasted, dusted and stress-tested for an hour before it earns our grade.",
    images: img("asus-tuf-1", "asus-tuf-2", "asus-tuf-3", "asus-tuf-4"),
    grade: "A",
    variants: [
      v("i5-3050", "Core i5 · 16GB · 512GB · RTX 3050", 46990, 84990, 5),
      v("i7-3060", "Core i7 · 16GB · 1TB · RTX 3060", 58990, 109990, 2),
    ],
    specs: [
      ["Processor", "Intel Core i5-11400H / i7-11800H"],
      ["Display", "15.6″ Full HD IPS, 144 Hz"],
      ["Graphics", "NVIDIA GeForce RTX 3050 / 3060"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "90 Wh · health 85%+"],
      ["Ports", "Thunderbolt 4, 3 × USB-A, HDMI 2.0, RJ45"],
      ["Weight", "2.3 kg"],
    ],
    highlights: ["RTX graphics", "144 Hz display", "RGB keyboard", "Dual-fan cooling"],
    useCases: ["gaming", "creator"],
    rating: 4.7,
    reviews: 88,
    badge: "Gamer pick",
    featured: true,
    batteryHealth: 85,
  }),
  laptop({
    slug: "hp-15s-du",
    name: "HP 15s (11th Gen Core i3)",
    brand: "HP",
    tagline: "A big screen for study, at a pocket-money price",
    description:
      "A dependable 15.6-inch everyday laptop for classes, office work and streaming. Light cosmetic wear on the lid, flawless where it counts, and upgraded to SSD storage for a quick start-up.",
    images: img("hp-15s-1", "hp-15s-2"),
    grade: "B",
    variants: [
      v("8-256", "8GB · 256GB SSD", 16013, 42140, 11),
      v("8-512", "8GB · 512GB SSD", 18490, 46990, 5),
    ],
    specs: [
      ["Processor", "Intel Core i3-1115G4 (up to 4.1 GHz)"],
      ["Display", "15.6″ Full HD anti-glare"],
      ["Graphics", "Intel UHD Graphics"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 6 hours · health 82%+"],
      ["Ports", "USB-C, 2 × USB-A, HDMI, SD card"],
      ["Weight", "1.69 kg"],
    ],
    highlights: ["15.6″ Full HD", "SSD storage", "Windows 11", "Numeric keypad"],
    useCases: ["student", "everyday"],
    rating: 4.5,
    reviews: 164,
    badge: "Budget pick",
    deal: true,
    batteryHealth: 82,
  }),
  laptop({
    slug: "apple-macbook-pro-13-m1",
    name: "Apple MacBook Pro 13″ (M1, 2020)",
    brand: "Apple",
    tagline: "M1 power with a fan for the long renders",
    description:
      "Everything great about the M1 Air plus active cooling, a brighter display and the longest battery life of any Mac of its generation. A favourite of developers and video editors.",
    images: img("macbook-pro-13-1", "macbook-pro-13-2", "macbook-pro-13-3", "macbook-pro-13-4"),
    grade: "A",
    variants: [
      v("8-256", "8GB · 256GB SSD", 54990, 122900, 4),
      v("16-512", "16GB · 512GB SSD", 69990, 162900, 2),
    ],
    specs: [
      ["Processor", "Apple M1 (8-core CPU, 8-core GPU)"],
      ["Display", "13.3″ Retina, 500 nits, P3 colour"],
      ["Operating system", "macOS Sequoia"],
      ["Battery", "Up to 17 hours · health 89%+"],
      ["Ports", "2 × Thunderbolt / USB 4, headphone jack"],
      ["Weight", "1.4 kg"],
    ],
    highlights: ["Apple M1", "500-nit Retina", "17-hour battery", "Touch Bar"],
    useCases: ["creator", "business"],
    rating: 4.8,
    reviews: 96,
    batteryHealth: 89,
  }),
  laptop({
    slug: "lenovo-thinkpad-x1-carbon-gen-9",
    name: "Lenovo ThinkPad X1 Carbon Gen 9",
    brand: "Lenovo",
    tagline: "The flagship: 1.13 kg of carbon fibre",
    description:
      "Lenovo's best business laptop, with a 16:10 display, Dolby Atmos speakers and a carbon-fibre shell that weighs barely more than a kilo. These units come from a single corporate lease and look it.",
    images: img("thinkpad-x1-1", "thinkpad-x1-2", "thinkpad-t14-2"),
    grade: "A+",
    variants: [
      v("i7-16-512", "Core i7 · 16GB · 512GB", 48990, 189000, 3),
      v("i7-16-1tb", "Core i7 · 16GB · 1TB", 54990, 205000, 2),
    ],
    specs: [
      ["Processor", "Intel Core i7-1165G7 (Intel Evo)"],
      ["Display", "14″ WUXGA (1920 × 1200) IPS, 400 nits"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "Up to 12 hours · health 90%+"],
      ["Ports", "2 × Thunderbolt 4, 2 × USB-A, HDMI 2.0"],
      ["Weight", "1.13 kg"],
    ],
    highlights: ["Carbon fibre", "16:10 display", "1.13 kg", "Dolby Atmos"],
    useCases: ["business"],
    rating: 4.9,
    reviews: 66,
    badge: "Flagship",
    batteryHealth: 90,
  }),
  laptop({
    slug: "lenovo-legion-5",
    name: "Lenovo Legion 5 (15ACH6)",
    brand: "Lenovo",
    tagline: "Ryzen muscle, understated looks",
    description:
      "A Ryzen 5000 H-series processor and RTX 30-series graphics behind a clean, grown-up design. The cooling is among the best in its class, and we re-verify it with a 60-minute stress run.",
    images: img("legion-5-1", "legion-5-2", "legion-5-3"),
    grade: "A+",
    variants: [
      v("r5-3050ti", "Ryzen 5 · 16GB · 512GB · RTX 3050 Ti", 49990, 94990, 4),
      v("r7-3060", "Ryzen 7 · 16GB · 1TB · RTX 3060", 62990, 124990, 2),
    ],
    specs: [
      ["Processor", "AMD Ryzen 5 5600H / Ryzen 7 5800H"],
      ["Display", "15.6″ Full HD IPS, 165 Hz, 100% sRGB"],
      ["Graphics", "NVIDIA GeForce RTX 3050 Ti / 3060"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "80 Wh · health 88%+"],
      ["Ports", "2 × USB-C, 4 × USB-A, HDMI 2.1, RJ45"],
      ["Weight", "2.4 kg"],
    ],
    highlights: ["165 Hz display", "RTX graphics", "Ryzen 5000", "Coldfront cooling"],
    useCases: ["gaming", "creator"],
    rating: 4.8,
    reviews: 71,
    batteryHealth: 88,
  }),
  laptop({
    slug: "microsoft-surface-laptop-4",
    name: "Microsoft Surface Laptop 4 13.5″",
    brand: "Microsoft",
    tagline: "A 3:2 touchscreen that makes documents feel bigger",
    description:
      "A minimal aluminium laptop with a tall PixelSense touchscreen, a superb trackpad and instant Windows Hello sign-in. Light, quiet and lovely to type on.",
    images: img("surface-laptop-1", "surface-laptop-2", "surface-laptop-3", "surface-laptop-4"),
    grade: "A+",
    variants: [
      v("i5-8-512", "Core i5 · 8GB · 512GB", 38990, 102999, 4),
      v("i7-16-512", "Core i7 · 16GB · 512GB", 48990, 151999, 2),
    ],
    specs: [
      ["Processor", "Intel Core i5-1135G7 / i7-1185G7"],
      ["Display", "13.5″ PixelSense touch (2256 × 1504)"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 14 hours · health 89%+"],
      ["Ports", "USB-C, USB-A, Surface Connect, headphone jack"],
      ["Weight", "1.27 kg"],
    ],
    highlights: ["3:2 touchscreen", "Windows Hello", "1.27 kg", "Alcantara option"],
    useCases: ["student", "business"],
    rating: 4.7,
    reviews: 45,
    featured: true,
    batteryHealth: 89,
  }),
  laptop({
    slug: "hp-spectre-x360-14",
    name: "HP Spectre x360 14",
    brand: "HP",
    tagline: "A gem-cut 2-in-1 with an OLED you will stare at",
    description:
      "HP's most beautiful laptop: a 3:2 OLED touchscreen that folds flat into a tablet, gem-cut edges and a pen in the box. Graded A+ with a pristine display.",
    images: img("hp-spectre-1", "hp-spectre-2", "hp-spectre-3", "hp-spectre-4"),
    grade: "A+",
    variants: [v("i7-16-512", "Core i7 · 16GB · 512GB · OLED", 62990, 169999, 2)],
    specs: [
      ["Processor", "Intel Core i7-1165G7 (Intel Evo)"],
      ["Display", "13.5″ 3K2K OLED touch, 400 nits"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 10 hours · health 90%+"],
      ["Ports", "2 × Thunderbolt 4, USB-A, microSD"],
      ["Weight", "1.34 kg"],
    ],
    highlights: ["OLED touchscreen", "360° hinge", "Pen included", "Gem-cut design"],
    useCases: ["creator", "business"],
    rating: 4.8,
    reviews: 37,
    badge: "Premium",
    batteryHealth: 90,
  }),
  laptop({
    slug: "dell-xps-13-2-in-1",
    name: "Dell XPS 13 2-in-1 (Frost White)",
    brand: "Dell",
    tagline: "Laptop, tent, tablet: one machined-aluminium body",
    description:
      "The convertible XPS in arctic white woven glass fibre. A 16:10 touch display, a 360-degree hinge and the same build quality that made the XPS famous.",
    images: img("dell-xps-2in1-1", "dell-xps-2in1-2", "dell-xps-2in1-3", "dell-xps-2in1-4"),
    grade: "A",
    variants: [v("i7-16-512", "Core i7 · 16GB · 512GB · Touch", 57990, 164990, 3)],
    specs: [
      ["Processor", "Intel Core i7-1165G7 (Intel Evo)"],
      ["Display", "13.4″ FHD+ touch, 500 nits, Gorilla Glass"],
      ["Graphics", "Intel Iris Xe"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 10 hours · health 88%+"],
      ["Ports", "2 × Thunderbolt 4, microSD"],
      ["Weight", "1.32 kg"],
    ],
    highlights: ["360° hinge", "500-nit touch display", "Frost white", "Intel Evo"],
    useCases: ["creator", "business"],
    rating: 4.7,
    reviews: 41,
    batteryHealth: 88,
  }),
  laptop({
    slug: "apple-macbook-pro-16-2019",
    name: "Apple MacBook Pro 16″ (2019)",
    brand: "Apple",
    tagline: "The big-screen Mac for editing on the move",
    description:
      "A 16-inch Retina display, six-speaker sound and the Magic Keyboard. Still a superb machine for Final Cut, Logic and anything that needs screen space, at a fraction of its launch price.",
    images: img("macbook-pro-16-1", "macbook-pro-16-2", "macbook-pro-16-3", "macbook-pro-16-4"),
    grade: "A",
    variants: [
      v("i7-16-512", "Core i7 · 16GB · 512GB", 64990, 199900, 3),
      v("i9-16-1tb", "Core i9 · 16GB · 1TB", 74990, 239900, 1),
    ],
    specs: [
      ["Processor", "Intel Core i7 6-core / i9 8-core"],
      ["Display", "16″ Retina (3072 × 1920), 500 nits"],
      ["Graphics", "AMD Radeon Pro 5300M / 5500M"],
      ["Operating system", "macOS Sequoia"],
      ["Battery", "100 Wh · health 86%+"],
      ["Ports", "4 × Thunderbolt 3, headphone jack"],
      ["Weight", "2.0 kg"],
    ],
    highlights: ["16″ Retina", "Six-speaker audio", "Radeon Pro", "Magic Keyboard"],
    useCases: ["creator"],
    rating: 4.7,
    reviews: 58,
    batteryHealth: 86,
  }),
  laptop({
    slug: "lenovo-thinkbook-14-g4",
    name: "Lenovo ThinkBook 14 G4",
    brand: "Lenovo",
    tagline: "Modern, metal and sensibly priced",
    description:
      "A slim dual-tone aluminium laptop with a Ryzen 5 processor, a fingerprint power button and plenty of ports. An easy recommendation for college and first jobs.",
    images: img("thinkbook-1", "thinkbook-2"),
    grade: "A",
    variants: [
      v("r5-8-512", "Ryzen 5 · 8GB · 512GB", 27990, 64990, 6),
      v("r5-16-512", "Ryzen 5 · 16GB · 512GB", 30990, 69990, 4),
    ],
    specs: [
      ["Processor", "AMD Ryzen 5 5625U (6 cores)"],
      ["Display", "14″ Full HD IPS, 300 nits"],
      ["Graphics", "AMD Radeon Graphics"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 8 hours · health 90%+"],
      ["Ports", "2 × USB-C, 2 × USB-A, HDMI, RJ45, SD card"],
      ["Weight", "1.4 kg"],
    ],
    highlights: ["Ryzen 5", "Aluminium lid", "Fingerprint reader", "RJ45 built in"],
    useCases: ["student", "business"],
    rating: 4.6,
    reviews: 52,
    batteryHealth: 90,
  }),
  laptop({
    slug: "asus-zenbook-pro-duo-15",
    name: "ASUS ZenBook Pro Duo 15 OLED",
    brand: "ASUS",
    tagline: "Two screens. One very unusual laptop.",
    description:
      "A 4K OLED main display with a second tilting touchscreen above the keyboard for timelines, palettes and chat. A rare find on the refurbished market, in excellent condition.",
    images: img("zenbook-duo-1", "zenbook-duo-2"),
    grade: "A",
    variants: [v("i7-3070", "Core i7 · 16GB · 1TB · RTX 3070", 94990, 239990, 1)],
    specs: [
      ["Processor", "Intel Core i7-10870H (8 cores)"],
      ["Display", "15.6″ 4K OLED touch + 14″ ScreenPad Plus"],
      ["Graphics", "NVIDIA GeForce RTX 3070"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "92 Wh · health 84%+"],
      ["Ports", "Thunderbolt 3, 2 × USB-A, HDMI 2.1"],
      ["Weight", "2.34 kg"],
    ],
    highlights: ["Dual screen", "4K OLED", "RTX 3070", "Pen included"],
    useCases: ["creator", "gaming"],
    rating: 4.7,
    reviews: 19,
    badge: "Rare find",
    batteryHealth: 84,
  }),
  laptop({
    slug: "asus-vivobook-15",
    name: "ASUS VivoBook 15 (X515)",
    brand: "ASUS",
    tagline: "Everything a first laptop should be",
    description:
      "A light 15.6-inch laptop with thin bezels, a comfortable keyboard and SSD storage. Ideal for online classes, assignments and family use.",
    images: img("vivobook-1", "vivobook-2"),
    grade: "B",
    variants: [
      v("i3-8-256", "Core i3 · 8GB · 256GB", 17990, 41990, 8),
      v("i5-8-512", "Core i5 · 8GB · 512GB", 24990, 57990, 5),
    ],
    specs: [
      ["Processor", "Intel Core i3-1115G4 / i5-1135G7"],
      ["Display", "15.6″ Full HD anti-glare"],
      ["Graphics", "Intel UHD / Iris Xe"],
      ["Operating system", "Windows 11 Home (activated)"],
      ["Battery", "Up to 6 hours · health 83%+"],
      ["Ports", "USB-C, 3 × USB-A, HDMI, microSD"],
      ["Weight", "1.8 kg"],
    ],
    highlights: ["Thin bezels", "SSD storage", "1.8 kg", "Fingerprint reader"],
    useCases: ["student", "everyday"],
    rating: 4.4,
    reviews: 133,
    batteryHealth: 83,
  }),
  laptop({
    slug: "hp-elite-x2-g4",
    name: "HP Elite x2 G4 2-in-1",
    brand: "HP",
    tagline: "A tablet that does real work",
    description:
      "A detachable 13-inch tablet with a kickstand and a backlit keyboard cover. Brilliant for field work, lectures and signing documents on the go.",
    images: img("hp-elite-x2-1", "hp-elite-x2-2"),
    grade: "A",
    variants: [v("i5-8-256", "Core i5 · 8GB · 256GB · Keyboard", 24990, 135000, 3)],
    specs: [
      ["Processor", "Intel Core i5-8265U"],
      ["Display", "13″ 3K2K touch, Gorilla Glass 5"],
      ["Graphics", "Intel UHD 620"],
      ["Operating system", "Windows 11 Pro (activated)"],
      ["Battery", "Up to 9 hours · health 85%+"],
      ["Ports", "2 × Thunderbolt 3, USB-C"],
      ["Weight", "0.83 kg tablet · 1.2 kg with keyboard"],
    ],
    highlights: ["Detachable keyboard", "3K2K touchscreen", "Kickstand", "Pen support"],
    useCases: ["business", "student"],
    rating: 4.5,
    reviews: 28,
    batteryHealth: 85,
  }),
  desktop({
    slug: "lapnotek-ryzen-5-gaming-pc",
    name: "Lapnotek Custom Ryzen 5 Gaming PC",
    brand: "Lapnotek",
    tagline: "Built on our bench, tuned for 1080p",
    description:
      "Assembled in-store with certified components, tidy cable management and a 48-hour burn-in. Tell us your games and budget and we will tune the build to match.",
    images: img("ryzen-pc-1", "ryzen-pc-2", "ryzen-pc-3", "ryzen-pc-4"),
    grade: "A+",
    variants: [
      v("1660s", "Ryzen 5 · 16GB · 500GB · GTX 1660 Super", 42990, 64990, 4),
      v("3060", "Ryzen 5 · 16GB · 1TB · RTX 3060", 58990, 84990, 3),
    ],
    specs: [
      ["Processor", "AMD Ryzen 5 5600 (6 cores, 12 threads)"],
      ["Graphics", "GTX 1660 Super 6GB / RTX 3060 12GB"],
      ["Memory", "16GB DDR4 3200 MHz (2 × 8GB)"],
      ["Storage", "NVMe SSD"],
      ["Cooling", "Tower air cooler, 4 × ARGB fans"],
      ["Operating system", "Windows 11 Home (activated)"],
    ],
    highlights: ["Ryzen 5 5600", "RTX graphics", "ARGB airflow case", "48-hour burn-in"],
    useCases: ["gaming", "creator"],
    rating: 4.8,
    reviews: 47,
    badge: "Built in Gaya",
    featured: true,
  }),
  desktop({
    slug: "apple-imac-21-4k-2017",
    name: "Apple iMac 21.5″ 4K (2017)",
    brand: "Apple",
    tagline: "A gorgeous 4K display with a Mac built in",
    description:
      "The all-in-one that tidies any desk. A colour-accurate 4K Retina display, quiet operation and macOS, ready for the family room, a studio or a reception desk.",
    images: img("imac-3", "imac-1", "imac-2"),
    grade: "A",
    variants: [v("i5-8-1tb", "Core i5 · 8GB · 1TB Fusion", 32990, 107900, 3)],
    specs: [
      ["Processor", "Intel Core i5 quad-core 3.0 GHz"],
      ["Display", "21.5″ Retina 4K (4096 × 2304), P3"],
      ["Graphics", "AMD Radeon Pro 555 2GB"],
      ["Operating system", "macOS Ventura"],
      ["Ports", "2 × Thunderbolt 3, 4 × USB-A, SDXC, Ethernet"],
      ["In the box", "Magic Keyboard and Magic Mouse"],
    ],
    highlights: ["4K Retina", "All-in-one", "Keyboard & mouse included", "P3 colour"],
    useCases: ["creator", "everyday"],
    rating: 4.6,
    reviews: 33,
  }),
  desktop({
    slug: "dell-alienware-aurora-r10",
    name: "Dell Alienware Aurora R10",
    brand: "Dell",
    tagline: "The spaceship, minus the launch price",
    description:
      "Alienware's unmistakable desktop with a Ryzen 7 and RTX 3060. Tool-less upgrades, liquid cooling and AlienFX lighting, fully serviced and stress-tested.",
    images: img("alienware-1", "alienware-2"),
    grade: "A",
    variants: [v("r7-3060", "Ryzen 7 · 16GB · 1TB · RTX 3060", 84990, 169990, 1)],
    specs: [
      ["Processor", "AMD Ryzen 7 5800 (8 cores, 16 threads)"],
      ["Graphics", "NVIDIA GeForce RTX 3060 12GB"],
      ["Memory", "16GB HyperX DDR4"],
      ["Storage", "1TB NVMe SSD"],
      ["Cooling", "Liquid-cooled CPU"],
      ["Operating system", "Windows 11 Home (activated)"],
    ],
    highlights: ["Ryzen 7 5800", "RTX 3060", "Liquid cooling", "AlienFX lighting"],
    useCases: ["gaming"],
    rating: 4.8,
    reviews: 14,
    badge: "Rare find",
  }),
  accessory({
    slug: "usb-c-laptop-charger-65w",
    name: "65W USB-C Laptop Charger",
    brand: "Lapnotek",
    subcategory: "Chargers",
    tagline: "One charger for your laptop, phone and tablet",
    description:
      "A compact 65W Power Delivery charger with a 1.8 m cable. Works with most USB-C laptops from HP, Dell, Lenovo and Apple.",
    image: "acc-charger",
    price: 1299,
    mrp: 2499,
    stock: 40,
    specs: [
      ["Output", "65W USB-C Power Delivery"],
      ["Cable", "1.8 m detachable"],
      ["Protection", "Over-voltage and surge"],
    ],
    rating: 4.6,
    reviews: 211,
  }),
  accessory({
    slug: "wireless-over-ear-headphones",
    name: "Wireless Over-Ear Headphones",
    brand: "Lapnotek",
    subcategory: "Headphones",
    tagline: "Calls, classes and playlists for 30 hours",
    description:
      "Soft memory-foam cushions, a clear boom-less microphone and Bluetooth 5.3 with a 30-hour battery. Folds flat into your bag.",
    image: "acc-headphones",
    price: 1799,
    mrp: 3999,
    stock: 25,
    specs: [
      ["Connectivity", "Bluetooth 5.3 and 3.5 mm"],
      ["Battery", "30 hours"],
      ["Microphone", "Dual-mic noise reduction"],
    ],
    rating: 4.5,
    reviews: 148,
  }),
  accessory({
    slug: "24-inch-full-hd-ips-monitor",
    name: "24″ Full HD IPS Monitor",
    brand: "Lapnotek",
    subcategory: "Display",
    tagline: "A second screen doubles what you get done",
    description:
      "A certified refurbished 24-inch IPS panel with slim bezels, HDMI and VGA inputs and a tilt stand. Zero dead pixels, guaranteed.",
    image: "acc-monitor",
    price: 6490,
    mrp: 13999,
    stock: 12,
    specs: [
      ["Panel", "23.8″ IPS, 1920 × 1080, 75 Hz"],
      ["Inputs", "HDMI, VGA"],
      ["Stand", "Tilt, VESA 100 mount"],
    ],
    rating: 4.7,
    reviews: 93,
  }),
  accessory({
    slug: "1tb-internal-hard-drive",
    name: "1TB Internal Hard Drive",
    brand: "Lapnotek",
    subcategory: "Disk",
    tagline: "Room for every project and photo",
    description:
      "A tested 1TB 2.5-inch SATA drive with a clean health report. We will fit it and move your data across for free in store.",
    image: "acc-disk",
    price: 1890,
    mrp: 3999,
    stock: 30,
    specs: [
      ["Capacity", "1TB"],
      ["Interface", "SATA III, 2.5″"],
      ["Health", "100% SMART pass"],
    ],
    rating: 4.6,
    reviews: 76,
  }),
  accessory({
    slug: "compact-mechanical-keyboard",
    name: "Compact Mechanical Keyboard",
    brand: "Lapnotek",
    subcategory: "Keyboards",
    tagline: "Typing that actually feels like something",
    description:
      "A 75% layout with hot-swappable tactile switches, white backlighting and both Bluetooth and USB-C. Works with Windows and macOS.",
    image: "acc-keyboard-mech",
    price: 2490,
    mrp: 4999,
    stock: 18,
    specs: [
      ["Layout", "75%, 84 keys"],
      ["Switches", "Tactile, hot-swappable"],
      ["Connectivity", "Bluetooth 5.1 and USB-C"],
    ],
    rating: 4.7,
    reviews: 64,
  }),
  accessory({
    slug: "wireless-optical-mouse",
    name: "Wireless Optical Mouse",
    brand: "Lapnotek",
    subcategory: "Mice",
    tagline: "Quiet clicks, 12-month battery",
    description:
      "An ambidextrous 2.4 GHz mouse with silent switches and a nano receiver that stores inside the body.",
    image: "acc-mouse",
    price: 449,
    mrp: 999,
    stock: 60,
    specs: [
      ["Sensor", "1600 DPI optical"],
      ["Connectivity", "2.4 GHz nano receiver"],
      ["Battery", "1 × AA, up to 12 months"],
    ],
    rating: 4.4,
    reviews: 302,
  }),
  accessory({
    slug: "laptop-backpack-15",
    name: "15.6″ Laptop Backpack",
    brand: "Lapnotek",
    subcategory: "Bags",
    tagline: "Padded, water-resistant, college-proof",
    description:
      "A 22-litre backpack with a padded laptop sleeve, a hidden back pocket and a water-repellent shell.",
    image: "acc-backpack",
    price: 799,
    mrp: 1999,
    stock: 35,
    specs: [
      ["Fits", "Laptops up to 15.6″"],
      ["Capacity", "22 litres"],
      ["Material", "Water-repellent polyester"],
    ],
    rating: 4.5,
    reviews: 187,
  }),
  accessory({
    slug: "slim-wireless-keyboard",
    name: "Slim Wireless Keyboard",
    brand: "Lapnotek",
    subcategory: "Keyboards",
    tagline: "A full-size layout that disappears into a bag",
    description:
      "A low-profile scissor-switch keyboard with a numeric keypad and rechargeable battery. Pairs with three devices.",
    image: "acc-keyboard",
    price: 1190,
    mrp: 2499,
    stock: 22,
    specs: [
      ["Layout", "Full size with numpad"],
      ["Connectivity", "Bluetooth, 3 devices"],
      ["Battery", "Rechargeable via USB-C"],
    ],
    rating: 4.3,
    reviews: 58,
  }),
];

export const COUPONS: Coupon[] = [
  {
    code: "WELCOME500",
    type: "flat",
    value: 500,
    minSubtotal: 10000,
    description: "₹500 off your first order above ₹10,000",
  },
  {
    code: "STUDENT5",
    type: "percent",
    value: 5,
    maxDiscount: 2500,
    minSubtotal: 15000,
    description: "5% off for students, up to ₹2,500",
  },
  {
    code: "GAYA10",
    type: "percent",
    value: 10,
    maxDiscount: 4000,
    minSubtotal: 30000,
    description: "10% off up to ₹4,000 on orders above ₹30,000",
  },
];
