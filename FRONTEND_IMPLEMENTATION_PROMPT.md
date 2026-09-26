# Frontend implementation prompt — TraceIQ PS6

Copy the prompt below into your coding agent. It is written for continued implementation in this repository; inspect the current code before assuming a feature is missing or complete.

---

You are implementing the frontend for **TraceIQ**, our Enigma 5.0 PS6 sustainability-development hackathon prototype. Work only in the existing React frontend unless the user explicitly expands scope.

## Required context and design process

1. Read the root `AGENTS.md` and `HACKATHON_CONTEXT.md` completely.
2. Read `frontend/.agents/frontend-design/SKILL.md` completely and follow its process for substantial visual work.
3. Inspect `frontend/src/App.tsx`, `frontend/src/lib/domain.ts`, `frontend/src/lib/circularity-service.ts`, onboarding/role preview, and the relevant current pages before editing. The current code is the source of truth; do not recreate existing flows or erase teammates’ work.
4. Before coding, write a short design plan naming 4–6 exact hex colors from the existing TraceIQ palette, type choices, responsive layout/wireframe, and the visual principles. Then critique the plan against this brief and revise it before implementation.

## Product and demo baseline

TraceIQ helps residents keep useful items in circulation. Preserve the whole material journey: scan and identify → choose sale, exchange, donation, repair, or recycling/collection → coordinate a local handoff → record traceability and illustrative impact.

The frontend has five demo role previews: Citizen, Reuse/Recycling Organization, Collector, Municipality Admin, and Community Admin. Community Admin is a distinct community-level responsibility, not Municipality Admin. Role previews and onboarding are client-side demo conveniences, not security or server authorization.

The frontend already includes the citizen scan flow, exchanges/matches, listings, community activity, map, impact and passports; organization needs/matches/receipts; collector tasks; municipality overview/bins/tasks; and a localStorage-backed circular marketplace. Inspect and preserve those flows. Keep the two seeded communities: Green Acres Housing Society and Riverside Rotary & Neighbourhood Circle. Only the active community’s listings and marketplace context should be shown; switching it should update the view.

## Marketplace requirements

- A citizen can create a community-scoped sale listing with title, material/category, condition, description, approximate area, price in INR, and pickup preference.
- Another member of the selected community can complete a **simulated purchase**. Clearly show a **2% seller fee** and payout, e.g. ₹1,000 listed price → ₹20 fee → ₹980 illustrative seller payout. The buyer total remains the listed price. No money is processed.
- If unsold for seven days, the item appears in the selected Community Admin’s review queue.
- Community Admin can record exactly one outcome: community buy-in, auction queue, or recycler handoff. Auction is a status only; no bidding. Each decision updates listing status, community activity, and the item passport timeline; completed reuse/recycling can affect illustrative impact.
- Every transaction and environmental metric must be labeled simulated/illustrative where it could be mistaken for real.

## Design direction

Use the established TraceIQ design system: mineral slate, warm stone/sand, deep forest, sage/emerald accents; Inter for UI text and JetBrains Mono for telemetry. Keep it distinctive, calm, trustworthy, community-first, and editorial rather than a generic admin-card grid. Favor clear typography, purposeful whitespace, image-led marketplace listings, visible community context, concise fee disclosures, and decisive but non-alarming review actions. Preserve mobile-first scanning and layouts that work on narrow phones.

Meet accessibility basics: semantic structure, labeled form controls, keyboard-visible focus, readable contrast, meaningful image alt text, accessible status/loading/error/empty states, and reduced-motion support.

## Architecture and constraints

- Stack: React 18, TypeScript (strict), Vite, Tailwind, React Router, Lucide, existing UI primitives.
- Build on current routes and `@/` imports. Keep data access in `frontend/src/lib/` services; keep page components out of direct fetch/localStorage details.
- Reuse typed mock-service records and localStorage behavior for communities, memberships, listings, purchases/fee breakdowns, review records, timeline, and impact. Keep the service boundary easy to replace with FastAPI later.
- Use the existing authenticated `POST /api/scan/analyze` endpoint through `scan-service.ts` for real photo analysis. It returns structured material fields and circular-use recommendations; keep the Gemini key in `backend/.env`, never in the browser. Do not add a competing direct Gemini call or duplicate backend endpoint unless separately requested. No custom ML training.
- No real payment processing, payment gateway, money transfer, or live settlement. No interactive auction/bids.
- Do not invent real geolocation, verified emissions reductions, or model-based scan results. Keep demo labels honest.
- Avoid new dependencies unless necessary; preserve unrelated and uncommitted work.

## Verification and handoff

Before finishing:

1. Run the frontend production build and fix TypeScript/lint/build errors introduced by the change.
2. Verify role preview and role navigation for all five demo roles.
3. Verify community switching changes marketplace listings and community admin review scope.
4. Verify creating a sale listing, fee math at ₹1,000 (₹20/₹980), completing a simulated purchase, and the seven-day review outcomes.
5. Verify the existing scan, exchange/donation, organization, collector, municipality, passport, and impact demo flows remain available.
6. Check narrow mobile layouts, keyboard focus, form labels, loading/empty/error states, and reduced motion. Run `git diff --check` and review the final diff for unrelated changes or secrets.

In your handoff, list changed files, what was verified, what is still simulated, and any remaining limitations. Do not claim backend persistence or real transactions for frontend mock behavior.
