import React from "react";

export const EnvironmentalVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#0A120F] overflow-hidden flex flex-col justify-between p-8 lg:p-12 select-none border-l border-[#162B21]">
      {/* Restrained ambient background depth - subtle, no harsh gradients */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-[#16382A]/20 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* SVG Canvas: Topographic Contours, Coordinate Grid, and Telemetry Focal Point */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern
            id="geo-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#13271D"
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            <circle cx="0" cy="0" r="0.75" fill="#204A37" fillOpacity="0.4" />
          </pattern>

          {/* Area fill under carbon trendline */}
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
            <stop offset="70%" stopColor="#1B4332" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#0A120F" stopOpacity="0" />
          </linearGradient>

          {/* Focal center radial wash */}
          <radialGradient id="focalSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
            <stop offset="65%" stopColor="#16382A" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0A120F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Coordinate Grid */}
        <rect width="100%" height="100%" fill="url(#geo-grid-pattern)" />

        {/* Environmental Topographic Elevation Isolines */}
        <g fill="none" strokeLinecap="round">
          <path
            d="M -50 170 C 130 130, 250 250, 430 180 C 590 120, 730 220, 920 160"
            stroke="#183628"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <path
            d="M -40 240 C 150 200, 270 320, 460 240 C 630 170, 770 290, 940 230"
            stroke="#1F4433"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <path
            d="M -30 310 C 170 260, 300 380, 490 310 C 670 230, 800 350, 960 300"
            stroke="#26523E"
            strokeWidth="1.2"
            strokeOpacity="0.75"
          />
          <path
            d="M -20 380 C 190 330, 330 450, 530 380 C 710 310, 830 410, 980 370"
            stroke="#1F4433"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <path
            d="M -10 460 C 210 410, 360 520, 570 450 C 750 390, 860 480, 1000 450"
            stroke="#163124"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        </g>

        {/* Continuous Emission Flux Curve */}
        <path
          d="M 40 470 Q 180 420 280 350 T 520 270 T 740 210 L 740 530 L 40 530 Z"
          fill="url(#curveGradient)"
        />
        <path
          d="M 40 470 Q 180 420 280 350 T 520 270 T 740 210"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.6"
          strokeOpacity="0.8"
        />

        {/* Distinctive Focal Point: Concentric Telemetry Beacon */}
        <g transform="translate(520, 270)">
          <circle cx="0" cy="0" r="130" fill="url(#focalSweep)" />

          {/* Concentric rings */}
          <circle
            cx="0"
            cy="0"
            r="76"
            fill="none"
            stroke="#1D4332"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.55"
          />
          <circle
            cx="0"
            cy="0"
            r="44"
            fill="none"
            stroke="#275741"
            strokeWidth="1"
            strokeOpacity="0.65"
          />
          <circle
            cx="0"
            cy="0"
            r="18"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />

          {/* Precision crosshair ticks */}
          <line x1="-88" y1="0" x2="-80" y2="0" stroke="#25523E" strokeWidth="1.2" />
          <line x1="80" y1="0" x2="88" y2="0" stroke="#25523E" strokeWidth="1.2" />
          <line x1="0" y1="-88" x2="0" y2="-80" stroke="#25523E" strokeWidth="1.2" />
          <line x1="0" y1="80" x2="0" y2="88" stroke="#25523E" strokeWidth="1.2" />

          {/* Center node */}
          <circle cx="0" cy="0" r="4.5" fill="#10B981" />
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.2"
            className="motion-safe:animate-ping motion-reduce:hidden opacity-50"
            style={{ transformOrigin: "0 0" }}
          />

          {/* Leader line to datum */}
          <line
            x1="12"
            y1="-12"
            x2="48"
            y2="-48"
            stroke="#26523E"
            strokeWidth="1"
            strokeOpacity="0.75"
          />
          <line
            x1="48"
            y1="-48"
            x2="110"
            y2="-48"
            stroke="#26523E"
            strokeWidth="1"
            strokeOpacity="0.75"
          />
        </g>

        {/* Secondary node points along the trend */}
        <circle cx="280" cy="350" r="3" fill="#204A37" />
        <circle cx="280" cy="350" r="6" fill="none" stroke="#204A37" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="160" cy="428" r="2.5" fill="#1B3F2F" />
      </svg>

      {/* Top Header: Clean sentence-case metadata */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#7F9E90]">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] text-[#A6C5B7]">
            Environmental telemetry
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#5C7D70] hidden sm:inline">
          59°19' N, 18°04' E
        </span>
      </div>

      {/* Focal Card: Minimal, clean, restrained depth */}
      <div className="relative z-10 my-auto pl-2 lg:pl-6 max-w-sm">
        <div className="bg-[#0C1713]/90 border border-[#1B362B] rounded-md p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#84A596] font-medium">Sector intensity</span>
            <span className="text-emerald-400 font-mono font-medium text-xs">
              -24.8% vs. baseline
            </span>
          </div>

          <div className="h-1 w-full bg-[#142B21] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: "68%" }}
            />
          </div>

          <p className="text-xs text-[#B5CCC2] leading-relaxed font-sans">
            Continuous telemetry mapping facility variance to targeted reduction pathways.
          </p>
        </div>
      </div>

      {/* Bottom Telemetry Strip: Clean sentence case */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#152B20] pt-4 text-xs font-mono text-[#6C8D7F]">
        <div className="flex items-center gap-5">
          <div>
            <span className="text-[#4E6E60] block text-[10px]">Baseline model</span>
            <span className="text-[#BFD6CC] text-[11px]">Calibrated 2024</span>
          </div>
          <div className="h-4 w-px bg-[#152B20]" />
          <div>
            <span className="text-[#4E6E60] block text-[10px]">Grid resolution</span>
            <span className="text-[#BFD6CC] text-[11px]">Hourly marginal</span>
          </div>
        </div>

        <span className="text-[10px] text-[#557769]">
          Station: 08-Alpha · Live
        </span>
      </div>
    </div>
  );
};
