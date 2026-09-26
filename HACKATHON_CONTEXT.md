# TraceIQ — Hackathon Context

This document is the shared product and implementation context for teammates and coding agents working on the Enigma 5.0 sustainability-development track, PS6. Read it before taking over work so the current prototype is not confused with planned features.

## Problem and product direction

TraceIQ is a circular-economy platform that helps people and local organizations keep useful materials in circulation instead of sending them directly to landfill. It connects identification and reuse/recycling choices with nearby exchanges, collection workflows, traceability, and illustrative environmental impact.

The product direction aligns with the problem statement's sustainability and green-technology goals, including the referenced China “Green Tech Innovation” track at the Bund Summit. The hackathon demo should show a practical, local pathway from an unwanted item to its next useful destination, not claim a production-ready waste-management system.

## Product roles

### Present in the pulled frontend

1. **Citizen** — scans a sample item, reviews a simulated material identification and suggested actions, explores exchanges and nearby community activity, manages listings, follows waste passports, and views illustrative impact.
2. **Reuse/recycling organization** — manages material needs, reviews matches, and records received materials/receipts.
3. **Collector** — reviews assigned pickup tasks and advances collection/delivery work.
4. **Municipality** — views sample city activity, smart-bin indicators, and collection tasks.

Role selection/onboarding and demo state are frontend conveniences, not authorization. The backend currently supplies cookie-based authentication; the circular-economy experiences use mock data.

### Planned next role: Community Admin

Add a distinct Community Admin persona for either a geographic neighborhood/community association (for example, a local Rotary group) or a housing society. Do not treat this role as already implemented or merge it into Municipality: community-level marketplace decisions and city-level waste coordination are different responsibilities.

## Shared material journey

1. A citizen identifies an unwanted item and sees its likely material/category, condition/circularity guidance, and suitable next actions.
2. The item can be listed for community reuse/exchange, offered to a reuse/recycling organization, or routed to collection when appropriate.
3. A nearby person or organization can request/match with it; a collector and municipality can coordinate physical pickup where needed.
4. The item progresses through a traceable waste-passport timeline to a recorded outcome such as reuse, repair, upcycling, or recycling.
5. The interface presents estimated material diversion and CO₂e impact as illustrative demo values, not verified measurements.

## Marketplace evolution (planned; not yet in the pulled frontend)

Add a local circular marketplace to the existing community and listing experience. A member can list a usable product for sale to members of the active community—for example, selling an unwanted sofa for ₹1,000 rather than discarding it. Communities can represent either a local geographic group/association or an individual housing society; users should see listings for the selected community.

- Demonstrate a **simulated 2% seller fee** in the transaction breakdown. For a ₹1,000 sale, show ₹20 fee and ₹980 illustrative seller proceeds.
- After **7 days without a sale**, move the listing into a Community Admin review queue.
- The Community Admin can record one of three demo decisions: community buy-in, send to a recycler, or place into an auction queue.
- Auction is status-only in the hackathon demo: no bidding flow. There is no real payment gateway, money transfer, or marketplace settlement.
- Marketplace sale/review actions should preserve the material's traceability and allow a later reuse/recycle outcome to be reflected in its journey and impact.

These are the agreed product defaults for the next iteration. Implement them behind mock services first; do not imply that payment, auction, or community administration is already backed by the API.

## Pulled frontend baseline

The current React 18, TypeScript, Vite frontend is more than a blank scaffold. It includes:

- Landing, signup/login, protected app routes, and role onboarding.
- Four role workspaces: citizen, organization, collector, and municipality.
- A mobile-conscious shared app shell and role navigation.
- Citizen scan-result flow, exchanges/matches, listings, community activity, map, impact, and waste-passport screens.
- Organization needs/matches/receipts, collector tasks, and municipality overview/bin/task screens.
- Centralized domain types and a mock circularity service. Demo mutations persist in `localStorage` and can be reset.
- A demo scan that returns simulated analysis; it does not access the camera or call a vision model.
- Smart-bin readings and environmental impact values that are seeded examples, not live IoT or verified emissions data.

Use the current implementation as the source of truth for exact behavior and routes. Inspect `frontend/src/App.tsx`, `frontend/src/lib/domain.ts`, `frontend/src/lib/circularity-service.ts`, onboarding, and the relevant page before extending it. Do not assume the marketplace, Community Admin, live image analysis, or production backend endpoints exist merely because they are in this roadmap.

## Architecture and demo constraints

- **Frontend:** React 18 + TypeScript + Vite, Tailwind, React Router, Lucide icons, existing UI primitives, and the established TraceIQ visual system (mineral slate, warm stone, deep forest, sage/emerald; Inter and JetBrains Mono).
- **Backend:** FastAPI + SQLAlchemy + Alembic, PostgreSQL intended, cookie-based JWT auth. Existing API coverage is authentication/health; check the backend before assuming other endpoints exist.
- Keep UI data access in the current service layer. Mock APIs should be replaceable with backend calls without pushing endpoint logic into page components.
- The demo should work without external vision credentials, live location services, smart-bin hardware, real payments, or trained custom ML. Clearly label simulated/estimated data where users could mistake it for live or verified data.
- For substantial UI work, read `frontend/.agents/frontend-design/SKILL.md`, follow its design-plan/review process, and preserve responsive behavior, visible keyboard focus, contrast, and reduced-motion support.

## Suggested presentation walkthrough

1. Start as a citizen and run the sample scan to show the material insight and suggested next action.
2. Show nearby reuse/exchange options and the item's journey/impact context.
3. Introduce the circular marketplace evolution with the ₹1,000 sofa example, transparent simulated fee, and seven-day community decision path.
4. Switch to collector and municipality views to show pickup coordination and sample city-level visibility; optionally show the organization match/receipt view as the downstream material destination.
5. Close by distinguishing what the prototype demonstrates from future live AI, payments, location, IoT, and backend integrations.

## Working agreement for agents

- Read this file and root `AGENTS.md` before making project-wide changes; inspect relevant code before describing or changing current behavior.
- Keep implemented behavior, mock/demo behavior, and roadmap items explicitly distinct in UI copy, code, and handoff notes.
- Do not rewrite the pulled frontend wholesale. Keep changes focused and preserve teammates' work.
- Update this context when product decisions or demo scope change. Update `AGENTS.md` when architecture, setup, development conventions, or project-wide instructions materially change.
