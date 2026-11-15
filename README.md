# Lapnotek

A storefront for Lapnotek, the laptop and desktop store and service centre in
Gewal Bigha, Gaya. Built with Next.js 16 (App Router, Cache Components),
Tailwind CSS 4, Motion and MongoDB.

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The site works straight away on the built-in demo
catalogue; connect MongoDB and MapTiler when you are ready.

## Connect the database

1. Copy `.env.example` to `.env` (it is git-ignored) and paste your Atlas
   connection string:

   ```bash
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/"
   MONGODB_DB=lapnotek
   ```

2. Load the catalogue into the `lapnotek` database:

   ```bash
   npm run seed            # upsert products and coupons, safe to re-run
   npm run seed -- --reset # wipe products and coupons first
   ```

3. Restart `npm run dev`. In development the footer shows
   **Catalogue: MongoDB** once the site is reading from the database.

| Collection    | Written by                    | Holds                                  |
| ------------- | ----------------------------- | -------------------------------------- |
| `products`    | `npm run seed`                | Catalogue, variants, prices, stock     |
| `coupons`     | `npm run seed`                | Coupon rules (`active: false` to stop) |
| `orders`      | Checkout                      | Orders with server-calculated totals   |
| `enquiries`   | Service / bulk / contact form | Requests with a reference number       |
| `subscribers` | Newsletter form               | Email addresses                        |

Catalogue reads are cached with a one-minute lifetime (`cacheLife("minutes")` in
`lib/data.ts`), so an edit made in Compass should appear once the cache
refreshes, without a redeploy. If the database is not configured or cannot be
reached, the site falls back to the demo catalogue and keeps orders in memory
until the server restarts.

The MongoDB code has been type-checked and reviewed but not yet run against the
live cluster, so run `npm run seed`, place a test order and confirm it appears
in the `orders` collection.

## Connect the map

Create a free key at <https://cloud.maptiler.com/account/keys/> and add it to
`.env`:

```bash
NEXT_PUBLIC_MAPTILER_KEY=your_key
```

Restrict the key to your domain in the MapTiler dashboard. Set the exact pin in
`lib/site.ts` (`geo.lat` / `geo.lng`); the current value is an approximation of
the Gewal Bigha area.

## Where things live

| Path                         | What it is                                                     |
| ---------------------------- | -------------------------------------------------------------- |
| `lib/site.ts`                | Business details: address, phones, hours, rating, policy copy  |
| `lib/catalog.ts`             | Demo products and coupons (the seed source)                    |
| `lib/pricing.ts`             | Warranty plans, delivery options, fees and the totals maths    |
| `lib/data.ts`                | Cached catalogue reads from MongoDB                            |
| `lib/cart-store.ts`          | Cart, saved-for-later and wishlist, persisted in the browser   |
| `app/actions.ts`             | Server actions: coupons, place order, enquiries, newsletter    |
| `components/motion-icons.tsx`| The animated icon set                                          |
| `public/media/`              | Placeholder photos and video (see `CREDITS.md`)                |

## What is real and what is demo

Real, taken from lapnotek.com and the Google Business listing: the name,
address, phone numbers, email addresses, store hours, payment methods and the
Google rating.

Demo content to replace before launch: the product catalogue, prices and stock
(two listings mirror the live site), all photos and video, the customer quotes,
the warranty, replacement and delivery terms in `lib/site.ts` and
`lib/pricing.ts`, the coupons, and the map pin. Checkout records the order but
does not take payment; a gateway such as Razorpay still needs to be added.

## Scripts

| Command             | Does                                  |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the development server          |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run seed`      | Load the catalogue into MongoDB       |
| `npm run typecheck` | Generate route types and run `tsc`    |
| `npm run lint`      | ESLint                                |
