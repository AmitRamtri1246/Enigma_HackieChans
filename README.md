# TraceIQ — Sustainability Intelligence Platform

A reusable hackathon starter project providing an environmental intelligence platform to help organizations measure impact, diagnose operational drivers, and make verified reduction decisions.

## Architecture

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom sustainability design system tokens
- **Component Foundation**: Radix UI + shadcn/ui patterns (`Button`, `Input`, `Label`, `Checkbox`, `Badge`, `Card`)
- **Iconography**: Lucide React
- **Routing**: React Router DOM (`/`, `/login`, `/signup`)
- **Backend (Upcoming phase)**: FastAPI & PostgreSQL ready

---

## Visual Identity & Design Tokens

Designed around an authentic sustainability SaaS aesthetic without generic AI templates or ungrounded claims:
- **Palette**:
  - `Mineral Slate`: Deep architectural charcoal (`#0E1513`)
  - `Warm Stone / Sand`: Unbleached natural canvas (`#FAF8F5`, `#EFECE6`)
  - `Deep Forest`: Evergreen corporate grounding (`#163326`)
  - `Calibrated Sage & Emerald`: Precise telemetry accents (`#2D6A4F`, `#059669`)
- **Typography**: Inter (sans-serif) for high-contrast clarity + JetBrains Mono for units (`tCO2e`, `%`, kWh)
- **Hierarchy**: Restrained 1px borders, subtle hairline grids, and generous whitespace.

---

## Core Routes & Functionality

### 1. Landing Page (`/`)
- **Hero**: Clean editorial value proposition with immediate CTAs to `/signup` and `/login`.
- **Core Triad (Measure → Understand → Act)**:
  - *01 / Measure*: Continuous portfolio impact tracking and verified baselines.
  - *02 / Understand*: Driver & cause diagnostics distinguishing volume from efficiency shifts.
  - *03 / Act*: Prioritized reduction pathways and decarbonization roadmaps.
- **Interactive Reduction Preview**: Live sector selector (Manufacturing, Logistics, Data Operations) with an efficiency improvement slider and real-time avoided emissions calculations.
- **Conversion Section**: Direct pathway into organization onboarding.

### 2. Authentication UI (`/login` & `/signup`)
- **Responsive Split Layout (`AuthLayout`)**: Left column houses high-focus auth inputs; right column visualizes the sustainability workflow and telemetry metrics.
- **Login (`/login`)**:
  - Work email and password fields with inline validation.
  - "Keep this device authenticated for 30 days" checkbox.
  - Interactive "Forgot password" modal.
  - Quick UI demo presets to test valid credentials and error alert states.
- **Signup (`/signup`)**:
  - Full name, work email, password, and password confirmation.
  - Dynamic password strength meter evaluating length, uppercase, numbers, and special symbols.
  - Terms and privacy agreement checkbox.
  - Interactive UI demo presets (Valid, Mismatch, Error banner).
  - Provisioning success state with verification confirmation screen.

---

## Getting Started

### Development
```bash
# From root directory:
npm run dev

# Or directly in frontend:
cd frontend
npm run dev
```

### Production Build & Typecheck
```bash
# Runs TypeScript compiler (tsc -b) and Vite production bundler
npm run build
```
