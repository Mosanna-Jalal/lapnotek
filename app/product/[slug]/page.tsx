import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { ProductView } from "@/components/product/product-view";
import { CheckGlyph, SectionHeading } from "@/components/ui";
import { getProduct, getProducts, getRelatedProducts, summarize } from "@/lib/data";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

type Props = PageProps<"/product/[slug]">;

/** Every catalogue page is prerendered; new slugs are rendered on first visit. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const price = product.variants[0].price.toLocaleString("en-IN");
  return {
    title: product.name,
    description: `${product.tagline}. Certified by ${site.name} from ₹${price} with a ${product.warrantyMonths}-month warranty.`,
    openGraph: { title: product.name, description: product.tagline, images: [product.images[0]] },
  };
}

const CATEGORY_LABEL: Record<Product["category"], string> = {
  laptop: "Laptops",
  desktop: "Desktops",
  accessory: "Accessories",
};

function ProductJsonLd({ product }: { product: Product }) {
  const prices = product.variants.map((v) => v.price);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((src) => `${site.url}${src}`),
    itemCondition: "https://schema.org/RefurbishedCondition",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

async function ProductContent({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await getRelatedProducts(product)).map(summarize);

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-fog">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-snow">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/shop?category=${product.category}`} className="hover:text-snow">
              {CATEGORY_LABEL[product.category]}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-snow" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6">
        <ProductView key={product.slug} product={product} />
      </div>

      <section className="mt-20 grid grid-cols-1 gap-12 border-t border-line pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why you will <span className="accent">like it</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fog">{product.description}</p>
          {product.highlights.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-full border border-line-strong px-4 py-2 text-sm"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            In the box
          </h3>
          <ul className="mt-4 space-y-2.5">
            {product.inBox.map((item) => (
              <li key={item} className="flex items-center gap-3 text-fog">
                <span className="grid size-5 place-items-center rounded-full bg-lime text-ink">
                  <CheckGlyph size={12} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tech specs</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {product.specs.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="text-fog">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-fog">Warranty</dt>
              <dd>{product.warrantyMonths} months, extendable with Care+</dd>
            </div>
          </dl>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <SectionHeading
              eyebrow="Keep looking"
              title={
                <>
                  You might also <span className="accent">like</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </Reveal>
        </section>
      )}

      <ProductJsonLd product={product} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <div className="skeleton h-4 w-64 rounded-full" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div className="skeleton aspect-[4/3] rounded-[32px]" />
        <div className="space-y-5">
          <div className="skeleton h-3 w-32 rounded-full" />
          <div className="skeleton h-12 w-4/5 rounded-2xl" />
          <div className="skeleton h-5 w-3/5 rounded-full" />
          <div className="skeleton h-16 w-56 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="shell pb-8 pt-8 sm:pt-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
