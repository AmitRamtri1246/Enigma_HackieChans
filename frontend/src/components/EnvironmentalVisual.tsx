import React from "react";
import { Recycle } from "lucide-react";

/**
 * TraceIQ auth visual — a product-oriented composition inspired by a SaaS
 * hero: a stylized dashboard mockup as the focal point, a supporting
 * material-collection scene (bins + collection vehicle) rendered cleanly in
 * SVG, and floating feature labels. Deep-forest field, restrained styling.
 */
export const EnvironmentalVisual: React.FC = () => {
  return (
    <div className="relative flex h-full min-h-[600px] w-full flex-col justify-between overflow-hidden bg-brand-forest p-10 lg:p-14 text-brand-white/90 select-none">
      {/* Ambient depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-sage/15 blur-[130px]"
      />
      {/* Faint dot grid for a product-canvas feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundSize: "26px 26px",
          backgroundImage:
            "radial-gradient(circle, rgba(139,226,139,0.10) 1px, transparent 1px)",
        }}
      />

      {/* Brand line */}
      <div className="relative z-10 flex items-center gap-2.5 text-brand-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-brand-forest">
          <Recycle className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="text-sm font-semibold tracking-tight">TraceIQ</span>
      </div>

      {/* Product mockup composition */}
      <div className="relative z-10 mx-auto my-6 w-full max-w-[440px]">
        <ProductScene />

        {/* Floating feature labels anchored to the mockup */}
        <FloatingLabel className="left-[-4%] top-[8%]" text="Material Matching" />
        <FloatingLabel className="right-[-6%] top-[40%]" text="Reuse Tracking" />
        <FloatingLabel className="left-[6%] bottom-[9%]" text="Impact" />
      </div>

      {/* Footer statement */}
      <div className="relative z-10 max-w-sm space-y-2">
        <p className="text-lg font-medium leading-snug text-brand-white">
          Give useful materials a second life.
        </p>
        <p className="text-sm leading-relaxed text-brand-white/60">
          Track materials as they move from waste into reuse, repair, and
          renewed circular value.
        </p>
      </div>
    </div>
  );
};

/** Stylized dashboard card + material-collection scene, all in SVG. */
const ProductScene: React.FC = () => (
  <svg
    viewBox="0 0 440 360"
    className="h-auto w-full overflow-visible"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8BE28B" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#8BE28B" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* ---- Dashboard mockup card ---- */}
    <g>
      {/* Card body */}
      <rect x="24" y="14" width="392" height="212" rx="14" fill="#0F241B" stroke="#2D6A4F" strokeWidth="1.25" />
      {/* Top bar */}
      <rect x="24" y="14" width="392" height="34" rx="14" fill="#12291F" />
      <rect x="24" y="34" width="392" height="14" fill="#12291F" />
      <circle cx="44" cy="31" r="3.5" fill="#2D6A4F" />
      <circle cx="56" cy="31" r="3.5" fill="#2D6A4F" />
      <circle cx="68" cy="31" r="3.5" fill="#2D6A4F" />
      <rect x="188" y="27" width="120" height="8" rx="4" fill="#1C3B2C" />

      {/* Sidebar */}
      <rect x="24" y="48" width="70" height="178" fill="#0D2018" />
      <rect x="36" y="66" width="46" height="7" rx="3.5" fill="#1C3B2C" />
      <rect x="36" y="84" width="46" height="7" rx="3.5" fill="#8BE28B" fillOpacity="0.5" />
      <rect x="36" y="102" width="46" height="7" rx="3.5" fill="#1C3B2C" />
      <rect x="36" y="120" width="46" height="7" rx="3.5" fill="#1C3B2C" />
      <rect x="36" y="138" width="46" height="7" rx="3.5" fill="#1C3B2C" />

      {/* KPI chips */}
      <rect x="108" y="62" width="88" height="42" rx="8" fill="#12291F" stroke="#1F4433" strokeWidth="1" />
      <rect x="118" y="72" width="40" height="6" rx="3" fill="#2D6A4F" />
      <rect x="118" y="84" width="26" height="10" rx="3" fill="#8BE28B" fillOpacity="0.7" />

      <rect x="206" y="62" width="88" height="42" rx="8" fill="#12291F" stroke="#1F4433" strokeWidth="1" />
      <rect x="216" y="72" width="40" height="6" rx="3" fill="#2D6A4F" />
      <rect x="216" y="84" width="30" height="10" rx="3" fill="#8BE28B" fillOpacity="0.5" />

      <rect x="304" y="62" width="100" height="42" rx="8" fill="#12291F" stroke="#1F4433" strokeWidth="1" />
      <rect x="314" y="72" width="44" height="6" rx="3" fill="#2D6A4F" />
      <rect x="314" y="84" width="24" height="10" rx="3" fill="#8BE28B" fillOpacity="0.6" />

      {/* Trend chart panel */}
      <rect x="108" y="116" width="296" height="98" rx="8" fill="#12291F" stroke="#1F4433" strokeWidth="1" />
      {/* area + line */}
      <path
        d="M120 196 L152 178 L184 186 L216 160 L248 168 L280 142 L312 150 L344 128 L392 138 L392 204 L120 204 Z"
        fill="url(#areaFill)"
      />
      <path
        d="M120 196 L152 178 L184 186 L216 160 L248 168 L280 142 L312 150 L344 128 L392 138"
        fill="none"
        stroke="#8BE28B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="280" cy="142" r="3.5" fill="#8BE28B" />
    </g>

    {/* ---- Collection vehicle + bins scene ---- */}
    <g>
      {/* ground line */}
      <line x1="40" y1="330" x2="400" y2="330" stroke="#1F4433" strokeWidth="1.5" />

      {/* Collection truck (stylized, front cab + container) */}
      <g>
        {/* container / body */}
        <rect x="150" y="256" width="150" height="58" rx="6" fill="#173A2B" stroke="#2D6A4F" strokeWidth="1.25" />
        {/* recycle mark on body */}
        <circle cx="196" cy="285" r="15" fill="#0F241B" stroke="#8BE28B" strokeWidth="1.25" />
        <path d="M191 283 l5 -6 5 6" fill="none" stroke="#8BE28B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M201 287 l-2 7 -7 0" fill="none" stroke="#8BE28B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* loader lift at rear */}
        <rect x="140" y="276" width="14" height="38" rx="3" fill="#12291F" stroke="#2D6A4F" strokeWidth="1" />
        {/* cab */}
        <path d="M300 268 h40 a8 8 0 0 1 8 8 v38 h-48 z" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1.25" />
        {/* windshield */}
        <rect x="306" y="274" width="30" height="18" rx="3" fill="#0F241B" stroke="#2D6A4F" strokeWidth="1" />
        <rect x="306" y="274" width="14" height="18" rx="2" fill="#2D6A4F" fillOpacity="0.35" />
        {/* wheels */}
        <circle cx="182" cy="314" r="12" fill="#0D2018" stroke="#2D6A4F" strokeWidth="2" />
        <circle cx="182" cy="314" r="4" fill="#2D6A4F" />
        <circle cx="322" cy="314" r="12" fill="#0D2018" stroke="#2D6A4F" strokeWidth="2" />
        <circle cx="322" cy="314" r="4" fill="#2D6A4F" />
      </g>

      {/* Two recycling bins */}
      <g>
        <rect x="60" y="272" width="34" height="42" rx="5" fill="#173A2B" stroke="#2D6A4F" strokeWidth="1.25" />
        <rect x="58" y="266" width="38" height="8" rx="3" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1" />
        <line x1="77" y1="280" x2="77" y2="308" stroke="#8BE28B" strokeOpacity="0.4" strokeWidth="1.25" />

        <rect x="100" y="280" width="30" height="34" rx="5" fill="#12291F" stroke="#2D6A4F" strokeWidth="1.25" />
        <rect x="98" y="274" width="34" height="8" rx="3" fill="#173A2B" stroke="#2D6A4F" strokeWidth="1" />
      </g>
    </g>
  </svg>
);

const FloatingLabel: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => (
  <span
    className={`absolute z-10 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-brand-sage/40 bg-brand-forest/85 px-2.5 py-1.5 text-[11px] font-medium text-brand-white shadow-md backdrop-blur-[2px] ${className ?? ""}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
    {text}
  </span>
);
