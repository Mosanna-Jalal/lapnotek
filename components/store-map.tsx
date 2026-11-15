"use client";

import "@maptiler/sdk/dist/maptiler-sdk.css";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { site } from "@/lib/site";
import { MapPinIcon } from "./motion-icons";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();

type Status = "idle" | "ready" | "failed";

/**
 * The store map, powered by MapTiler.
 *
 * The SDK is large, so it is only downloaded once the map is about to scroll
 * into view. Without `NEXT_PUBLIC_MAPTILER_KEY` (or if tiles fail to load) a
 * stylised placeholder is shown instead, so the section never looks broken.
 */
export function StoreMap({ className }: { className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const near = useInView(frame, { once: true, margin: "600px 0px" });
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!MAPTILER_KEY || !near || !canvas.current) return;
    let cancelled = false;
    let map: import("@maptiler/sdk").Map | undefined;

    import("@maptiler/sdk")
      .then((sdk) => {
        if (cancelled || !canvas.current) return;
        sdk.config.apiKey = MAPTILER_KEY;

        const position: [number, number] = [site.geo.lng, site.geo.lat];
        map = new sdk.Map({
          container: canvas.current,
          style: sdk.MapStyle.STREETS.DARK,
          center: position,
          zoom: 15.4,
          pitch: 48,
          bearing: -12,
          navigationControl: "top-right",
          geolocateControl: false,
          // Two-finger / ctrl-scroll to zoom, so the page keeps scrolling normally.
          cooperativeGestures: true,
        });

        const pin = document.createElement("div");
        pin.className = "store-pin";
        pin.setAttribute("role", "img");
        pin.setAttribute("aria-label", `${site.name} store`);
        pin.innerHTML = "<span></span><i></i>";
        new sdk.Marker({ element: pin, anchor: "center" }).setLngLat(position).addTo(map);

        map.on("load", () => {
          if (cancelled) return;
          setStatus("ready");
          map?.easeTo({ zoom: 16, bearing: 8, duration: 4200 });
        });
        map.on("error", (event) => {
          // A bad key or blocked network surfaces here before the style loads.
          if (!cancelled && !map?.isStyleLoaded()) {
            console.warn("[lapnotek] MapTiler could not load the map.", event.error);
            setStatus("failed");
          }
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [near]);

  const showPlaceholder = !MAPTILER_KEY || status === "failed";

  return (
    <div ref={frame} className={cx("relative overflow-hidden bg-ink-3", className)}>
      <div
        ref={canvas}
        className={cx(
          "absolute inset-0 transition-opacity duration-700",
          status === "ready" ? "opacity-100" : "opacity-0",
        )}
      />

      {MAPTILER_KEY && status === "idle" && <div className="skeleton absolute inset-0" />}

      {showPlaceholder && (
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 size-full text-white/[0.07]"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeWidth="26" d="M-20 420 L300 300 L560 340 L820 220" />
            <path strokeWidth="18" d="M240 -20 L300 300 L260 620" />
            <path strokeWidth="14" d="M560 -20 L560 340 L640 620" />
            <path strokeWidth="10" d="M-20 150 L300 190 L560 120 L820 90" />
            <path strokeWidth="8" d="M100 -20 L120 620M420 -20 L400 620M700 -20 L720 620" />
            <path strokeWidth="8" d="M-20 520 L820 480M-20 60 L820 20" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(201_248_90/0.14),transparent_55%)]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="grid size-14 place-items-center rounded-full bg-lime text-ink shadow-[0_0_0_10px_rgb(201_248_90/0.15)]">
              <MapPinIcon size={26} loop strokeWidth={1.9} />
            </span>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <p className="absolute inset-x-4 top-4 rounded-2xl border border-line-strong bg-ink/80 px-4 py-3 text-sm text-fog backdrop-blur">
              {MAPTILER_KEY
                ? "MapTiler could not load. Check that the key is valid and allowed for this origin."
                : "Add NEXT_PUBLIC_MAPTILER_KEY to .env and restart to see the live MapTiler map here."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
