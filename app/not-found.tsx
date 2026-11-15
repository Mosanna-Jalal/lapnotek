import { CtaLink } from "@/components/motion";
import { SearchIcon } from "@/components/motion-icons";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid size-20 place-items-center rounded-full border border-line-strong bg-ink-2 text-lime">
          <SearchIcon size={34} loop />
        </span>
        <p className="mt-8 font-mono text-sm tracking-[0.3em] text-mist">404</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          This page has been <span className="accent">sold.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-fog">
          The link is broken or the product has found a new home. Plenty more on the shelf.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CtaLink href="/shop">Browse the shop</CtaLink>
          <CtaLink href="/" variant="ghost" arrow={false}>
            Back home
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
