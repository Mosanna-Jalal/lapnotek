"use client";

import {
  motion,
  useInView,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

/*
 * Lapnotek motion icons.
 *
 * A hand-drawn 24px icon set where every glyph has its own little animation.
 * An icon plays:
 *   - while it (or an <IconHover> ancestor) is hovered or focused,
 *   - once when it scrolls into view, with `playOnView`,
 *   - continuously while on screen, with `loop`,
 *   - or whenever you pass `active`.
 */

export interface MotionIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Force the animation on or off (overrides hover). */
  active?: boolean;
  /** Keep replaying while the icon is on screen. */
  loop?: boolean;
  /** Play once the first time the icon scrolls into view. */
  playOnView?: boolean;
}

const HoverContext = createContext<boolean | null>(null);

/** Hover or focus anywhere inside this block plays every motion icon in it. */
export function IconHover({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState(false);
  return (
    <Tag
      className={className}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <HoverContext.Provider value={active}>{children}</HoverContext.Provider>
    </Tag>
  );
}

/** For client components that want to drive an icon from their own element. */
export function useHover() {
  const [hovered, setHovered] = useState(false);
  const bind = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };
  return [hovered, bind] as const;
}

const SETTLE: Transition = { duration: 0.35, ease: "easeOut" };

/** Builds the rest / active / loop variants for one animated part. */
function play(
  to: TargetAndTransition,
  rest: TargetAndTransition,
  transition: Transition = {},
  loopDelay = 1.6,
): Variants {
  const t: Transition = { duration: 0.8, ease: "easeInOut", ...transition };
  return {
    rest: { ...rest, transition: SETTLE },
    active: { ...to, transition: t },
    loop: { ...to, transition: { ...t, repeat: Infinity, repeatDelay: loopDelay } },
  };
}

function Icon({
  size = 24,
  className,
  strokeWidth = 1.6,
  active,
  loop,
  playOnView,
  children,
}: MotionIconProps & { children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const inherited = useContext(HoverContext);
  const [hovered, setHovered] = useState(false);
  const [played, setPlayed] = useState(false);
  const visible = useInView(ref, { amount: 0.6 });

  const autoplay = Boolean(playOnView) && visible && !played;
  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setPlayed(true), 1500);
    return () => clearTimeout(timer);
  }, [autoplay]);

  const controlled = active ?? inherited;
  const on = controlled ?? hovered;
  const state = loop && visible ? "loop" : on || autoplay ? "active" : "rest";
  const selfHover = controlled === null || controlled === undefined;

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={false}
      animate={state}
      className={className}
      style={{ overflow: "visible", flexShrink: 0 }}
      aria-hidden="true"
      focusable="false"
      onPointerEnter={selfHover ? () => setHovered(true) : undefined}
      onPointerLeave={selfHover ? () => setHovered(false) : undefined}
    >
      {children}
    </motion.svg>
  );
}

const draw = (delay = 0, duration = 0.6) =>
  play({ pathLength: [0, 1], opacity: [0.2, 1] }, { pathLength: 1, opacity: 1 }, { duration, delay });

/** Doorstep delivery: the truck surges forward and throws speed lines. */
export function TruckIcon(props: MotionIconProps) {
  const lines: [string, number][] = [
    ["M1.5 8.5h3.2", 0],
    ["M.6 12h3.6", 0.1],
    ["M2 15.5h2.4", 0.2],
  ];
  return (
    <Icon {...props}>
      <motion.g variants={play({ x: [0, 1.8, 0] }, { x: 0 }, { duration: 0.9 })}>
        <path d="M8.4 15.5H7v-9h8v9h-3.4" />
        <path d="M15 9.5h3l2.5 3v3h-1.4M15 15.5h.9" />
        <circle cx="10" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </motion.g>
      {lines.map(([d, delay]) => (
        <motion.path
          key={d}
          d={d}
          variants={play(
            { pathLength: [0, 1, 1], opacity: [0, 1, 0], x: [2, 0, -1.5] },
            { pathLength: 1, opacity: 0.4, x: 0 },
            { duration: 0.9, delay },
          )}
        />
      ))}
    </Icon>
  );
}

/** Warranty: the shield swells and the tick draws itself. */
export function ShieldCheckIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M12 3l7 2.7v5.5c0 4.3-2.8 7.7-7 9.3-4.2-1.6-7-5-7-9.3V5.7L12 3z"
        variants={play({ scale: [1, 1.08, 1] }, { scale: 1 }, { duration: 0.7 })}
      />
      <motion.path d="M8.8 12.1l2.3 2.3 4.2-4.6" variants={draw(0.15, 0.5)} />
    </Icon>
  );
}

/** Battery health: cells charge up one by one. */
export function BatteryIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="7.5" width="17" height="9" rx="2.2" />
      <path d="M21.5 10.5v3" />
      {[5.3, 9.4, 13.5].map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y="10"
          width="2.6"
          height="4"
          rx="0.6"
          fill="currentColor"
          stroke="none"
          variants={play(
            { opacity: [0.15, 1], scaleY: [0.4, 1] },
            { opacity: 1, scaleY: 1 },
            { duration: 0.35, delay: 0.1 + i * 0.22 },
          )}
        />
      ))}
    </Icon>
  );
}

/** Renewed / refurbished: the arrows complete half a turn. */
export function RenewIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ rotate: [0, 180] }, { rotate: 0 }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })}
      >
        <path d="M20 11.5A8 8 0 0 0 5.6 7.2L4 9" />
        <path d="M4 4.8V9h4.2" />
        <path d="M4 12.5a8 8 0 0 0 14.4 4.3L20 15" />
        <path d="M20 19.2V15h-4.2" />
      </motion.g>
    </Icon>
  );
}

/** Performance: pins light up and the core pulses. */
export function CpuIcon(props: MotionIconProps) {
  const pins = ["M9 3v3", "M15 3v3", "M21 9h-3", "M21 15h-3", "M15 21v-3", "M9 21v-3", "M3 15h3", "M3 9h3"];
  return (
    <Icon {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2.2" />
      <motion.rect
        x="9.6"
        y="9.6"
        width="4.8"
        height="4.8"
        rx="1"
        variants={play({ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }, { scale: 1, opacity: 1 }, { duration: 0.7 })}
      />
      {pins.map((d, i) => (
        <motion.path key={d} d={d} variants={draw(i * 0.06, 0.3)} />
      ))}
    </Icon>
  );
}

/** Certified quality: the medal swings and its tick redraws. */
export function AwardIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ rotate: [0, -10, 8, 0] }, { rotate: 0 }, { duration: 0.9 })}
        style={{ originX: 0.5, originY: 0 }}
      >
        <circle cx="12" cy="9.5" r="6" />
        <path d="M8.6 14.5L7.2 21l4.8-2.6 4.8 2.6-1.4-6.5" />
        <motion.path d="M9.6 9.6l1.7 1.7 3.2-3.4" variants={draw(0.3, 0.4)} />
      </motion.g>
    </Icon>
  );
}

/** Savings: the coin flips. */
export function RupeeIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ scaleX: [1, 0.08, 1], y: [0, -2, 0] }, { scaleX: 1, y: 0 }, { duration: 0.8 })}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.8 7.8h6.6M8.8 10.8h6.6M8.8 7.8h2.4a3 3 0 0 1 0 6H8.8l4.8 4.4" />
      </motion.g>
    </Icon>
  );
}

/** Support: the headset nods and the mic arm draws in. */
export function HeadsetIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ y: [0, -1.2, 0], rotate: [0, -4, 4, 0] }, { y: 0, rotate: 0 }, { duration: 0.9 })}>
        <path d="M4.5 13.5V12a7.5 7.5 0 0 1 15 0v1.5" />
        <rect x="3" y="13" width="4" height="6" rx="1.6" />
        <rect x="17" y="13" width="4" height="6" rx="1.6" />
      </motion.g>
      <motion.path d="M19 19v.4a2.6 2.6 0 0 1-2.6 2.6H13" variants={draw(0.25, 0.45)} />
    </Icon>
  );
}

/** Less e-waste: the leaf sways on its stem. */
export function LeafIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ rotate: [0, -9, 6, 0] }, { rotate: 0 }, { duration: 1.1 })}
        style={{ originX: 0, originY: 1 }}
      >
        <path d="M5 20c-.6-8 4.4-14.4 15-15 .6 9.4-4.4 15-11.4 15-1.3 0-2.5-.2-3.6 0z" />
        <motion.path d="M5 20c2.8-4.4 6.1-7.2 10-9" variants={draw(0.2, 0.6)} />
      </motion.g>
    </Icon>
  );
}

/** Cart: rolls forward while an item drops in. */
export function CartIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ x: [0, 2.2, -0.8, 0], rotate: [0, -5, 2, 0] }, { x: 0, rotate: 0 }, { duration: 0.7 })}>
        <path d="M2.5 4h2.3l2.4 10.5h9.9L19.5 7H6" />
        <circle cx="9" cy="18.6" r="1.4" />
        <circle cx="16" cy="18.6" r="1.4" />
      </motion.g>
      <motion.path
        d="M10 9.8h5"
        variants={play({ y: [-6, 0], opacity: [0, 1] }, { y: 0, opacity: 1 }, { duration: 0.45, delay: 0.1 })}
      />
    </Icon>
  );
}

/** Wishlist: a heartbeat. Pass `filled` once saved. */
export function HeartIcon({ filled, ...props }: MotionIconProps & { filled?: boolean }) {
  return (
    <Icon {...props}>
      <motion.path
        d="M12 20.3s-7.5-4.5-7.5-10.3A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.6c0 5.8-7.5 10.3-7.5 10.3z"
        fill={filled ? "currentColor" : "none"}
        variants={play({ scale: [1, 1.28, 0.94, 1.1, 1] }, { scale: 1 }, { duration: 0.7 })}
      />
    </Icon>
  );
}

/** Search: the lens sweeps. */
export function SearchIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ rotate: [0, -16, 12, 0], scale: [1, 1.08, 1] }, { rotate: 0, scale: 1 }, { duration: 0.7 })}
        style={{ originX: 0.41, originY: 0.41 }}
      >
        <circle cx="11" cy="11" r="6.2" />
        <path d="M20 20l-4.5-4.5" />
      </motion.g>
    </Icon>
  );
}

/** Laptop: the lid opens and the screen wakes. */
export function LaptopIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ scaleY: [0.12, 1] }, { scaleY: 1 }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })}
        style={{ originX: 0.5, originY: 1 }}
      >
        <rect x="4.5" y="5" width="15" height="11" rx="1.8" />
        <motion.path d="M8 9.2h4.5M8 12h7" variants={draw(0.35, 0.4)} />
      </motion.g>
      <path d="M2.5 19h19" />
    </Icon>
  );
}

/** Desktop: the display draws a chart. */
export function DesktopIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M12 16v4M8.5 20h7" />
      <motion.path d="M7 12.5l2.8-3 2.4 2 3.8-4" variants={draw(0.05, 0.7)} />
    </Icon>
  );
}

/** Accessories: the plug pushes in and sparks. */
export function PlugIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ y: [0, 2, 0] }, { y: 0 }, { duration: 0.6 })}>
        <path d="M9 3v4.5M15 3v4.5" />
        <path d="M6.5 7.5h11v3.3a5.5 5.5 0 0 1-11 0z" />
      </motion.g>
      <path d="M12 16.3V21" />
      <motion.path
        d="M3.5 13l1.8.6M20.5 13l-1.8.6"
        variants={play({ opacity: [0, 1, 0], scale: [0.6, 1.2, 1] }, { opacity: 0, scale: 1 }, { duration: 0.6, delay: 0.25 })}
      />
    </Icon>
  );
}

/** Service desk: the wrench turns a bolt. */
export function WrenchIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"
        variants={play({ rotate: [0, -24, 14, 0] }, { rotate: 0 }, { duration: 0.9 })}
      />
    </Icon>
  );
}

/** Store location: the pin hops and its shadow breathes. */
export function MapPinIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ y: [0, -3.5, 0, -1.2, 0] }, { y: 0 }, { duration: 0.9 })}>
        <path d="M12 20.5s-6.3-5.4-6.3-10.7a6.3 6.3 0 0 1 12.6 0c0 5.3-6.3 10.7-6.3 10.7z" />
        <circle cx="12" cy="9.8" r="2.2" />
      </motion.g>
      <motion.path
        d="M9 22.3h6"
        variants={play({ scaleX: [1, 0.5, 1, 0.8, 1], opacity: [0.5, 0.2, 0.5] }, { scaleX: 1, opacity: 0.5 }, { duration: 0.9 })}
      />
    </Icon>
  );
}

/** Packed with care: the box lifts and its seams draw. */
export function BoxIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ y: [0, -2, 0] }, { y: 0 }, { duration: 0.7 })}>
        <path d="M3.5 7.8L12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3z" />
        <motion.path d="M3.5 7.8L12 12l8.5-4.2M12 12v8.5" variants={draw(0.1, 0.6)} />
        <motion.path d="M7.7 5.7l8.5 4.3" variants={draw(0.4, 0.4)} />
      </motion.g>
    </Icon>
  );
}

/** Store hours: the hands sweep round. */
export function ClockIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <motion.path
        d="M12 12V7"
        variants={play({ rotate: [0, 360] }, { rotate: 0 }, { duration: 1.1, ease: "easeInOut" })}
        style={{ originX: 0.5, originY: 1 }}
      />
      <motion.path
        d="M12 12l3.2 2"
        variants={play({ rotate: [0, 90, 0] }, { rotate: 0 }, { duration: 1.1 })}
        style={{ originX: 0, originY: 0 }}
      />
    </Icon>
  );
}

/** Secure payment: the shackle clicks shut. */
export function LockIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9.5" rx="2.2" />
      <motion.path
        d="M8.2 11V8a3.8 3.8 0 0 1 7.6 0v3"
        variants={play({ y: [0, -2.4, 0] }, { y: 0 }, { duration: 0.6 })}
      />
      <motion.path d="M12 14.7v2.2" variants={draw(0.3, 0.3)} />
    </Icon>
  );
}

/** Grade A+: stars twinkle in turn. */
export function SparkleIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M11 4l1.7 4.8L17.5 10.5l-4.8 1.7L11 17l-1.7-4.8L4.5 10.5l4.8-1.7z"
        variants={play({ scale: [1, 1.2, 1], rotate: [0, 18, 0] }, { scale: 1, rotate: 0 }, { duration: 0.8 })}
      />
      <motion.path
        d="M18.5 15.5v4M16.5 17.5h4"
        variants={play({ scale: [0.4, 1.2, 1], opacity: [0, 1] }, { scale: 1, opacity: 1 }, { duration: 0.5, delay: 0.25 })}
      />
      <motion.path
        d="M18.5 3v2.6M17.2 4.3h2.6"
        variants={play({ scale: [0.4, 1.2, 1], opacity: [0, 1] }, { scale: 1, opacity: 1 }, { duration: 0.5, delay: 0.4 })}
      />
    </Icon>
  );
}

/** Deals: the price tag swings on its string. */
export function TagIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ rotate: [0, 14, -9, 5, 0] }, { rotate: 0 }, { duration: 1 })}
        style={{ originX: 0.15, originY: 0.15 }}
      >
        <path d="M3.5 4.5v6.3a2 2 0 0 0 .6 1.4l7.7 7.7a2 2 0 0 0 2.8 0l5.3-5.3a2 2 0 0 0 0-2.8L12.2 4.1a2 2 0 0 0-1.4-.6H4.5a1 1 0 0 0-1 1z" />
        <circle cx="8" cy="8" r="1.3" />
      </motion.g>
    </Icon>
  );
}

/** Speed: the bolt strikes. */
export function BoltIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M13 2.5L4.5 13.5h6.3l-1 8L18.5 10.3H12z"
        variants={play(
          { opacity: [1, 0.3, 1, 0.5, 1], scale: [1, 0.94, 1.1, 1], y: [0, 1.5, 0] },
          { opacity: 1, scale: 1, y: 0 },
          { duration: 0.6 },
        )}
      />
    </Icon>
  );
}

/** Chat / WhatsApp: the bubble pops and the dots type. */
export function ChatIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M4 5.5h16v10.8H9.5L4.5 20.3v-4H4z"
        variants={play({ scale: [1, 1.06, 1] }, { scale: 1 }, { duration: 0.6 })}
      />
      {[8.5, 12, 15.5].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 11h.01`}
          strokeWidth={2.2}
          variants={play({ y: [0, -2, 0] }, { y: 0 }, { duration: 0.45, delay: i * 0.12 })}
        />
      ))}
    </Icon>
  );
}

/** Bulk orders: the building rises floor by floor. */
export function BuildingIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g
        variants={play({ scaleY: [0.3, 1] }, { scaleY: 1 }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })}
        style={{ originX: 0.5, originY: 1 }}
      >
        <path d="M5 21V5.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 15 5.5V21" />
        <path d="M15 10h2.5a1.5 1.5 0 0 1 1.5 1.5V21" />
        <motion.path d="M8.5 8h3M8.5 11.5h3M8.5 15h3" variants={draw(0.35, 0.4)} />
      </motion.g>
      <path d="M3 21h18" />
    </Icon>
  );
}

/** Phone: rings. */
export function PhoneIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.path
        d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z"
        variants={play({ rotate: [0, -12, 10, -8, 6, 0] }, { rotate: 0 }, { duration: 0.8 })}
      />
    </Icon>
  );
}

/** Arrow: nudges forward. Used inside buttons and links. */
export function ArrowIcon(props: MotionIconProps) {
  return (
    <Icon {...props}>
      <motion.g variants={play({ x: [0, 3.5, 0] }, { x: 0 }, { duration: 0.6 })}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </motion.g>
    </Icon>
  );
}

/** A large animated tick used on the order confirmation screen. */
export function SuccessMark({ size = 96 }: { size?: number }) {
  const burst = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <motion.svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      fill="none"
      initial="hidden"
      animate="shown"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {burst.map((angle, i) => (
        <motion.circle
          key={angle}
          cx="48"
          cy="48"
          r={i % 2 ? 2.4 : 3.2}
          fill="currentColor"
          variants={{
            hidden: { x: 0, y: 0, opacity: 0, scale: 0 },
            shown: {
              x: Math.cos(angle) * 58,
              y: Math.sin(angle) * 58,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.4],
              transition: { duration: 0.9, delay: 0.45, ease: "easeOut" },
            },
          }}
        />
      ))}
      <motion.circle
        cx="48"
        cy="48"
        r="40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, rotate: -90, opacity: 0 },
          shown: { pathLength: 1, rotate: -90, opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } },
        }}
      />
      <motion.path
        d="M31 49.5l11.5 11.5L66 36.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          shown: { pathLength: 1, opacity: 1, transition: { duration: 0.45, delay: 0.5, ease: "easeOut" } },
        }}
      />
    </motion.svg>
  );
}
