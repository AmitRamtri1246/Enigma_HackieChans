# TraceIQ — Hackathon Context

This document is the shared product and implementation context for teammates and coding agents working on the Enigma 5.0 sustainability-development track, PS6. Read it before taking over work so implemented frontend behavior is not confused with future backend integrations.

## Problem and product direction

TraceIQ is a circular-economy platform that helps people and local organizations keep useful materials in circulation instead of sending them directly to landfill. It connects identification and reuse/recycling choices with nearby exchanges, collection workflows, traceability, and illustrative environmental impact.

The product direction aligns with the problem statement's sustainability and green-technology goals, including the referenced China “Green Tech Innovation” track at the Bund Summit. The hackathon demo should show a practical, local pathway from an unwanted item to its next useful destination, not claim a production-ready waste-management system.

## Product roles

### Frontend demo roles

1. **Citizen** — scans a sample item, reviews a simulated material identification and suggested actions, explores exchanges and nearby community activity, manages listings, follows waste passports, and views illustrative impact.
2. **Reuse/recycling organization** — manages material needs, reviews matches, and records received materials/receipts.
3. **Collector** — reviews assigned pickup tasks and advances collection/delivery work.
4. **Municipality Admin** — views sample city activity, smart-bin indicators, and collection tasks.
5. **Community Admin** — selects a housing society or local association and reviews seven-day unsold marketplace listings, recording community buy-in, auction queue, or recycler handoff.

Role selection/onboarding and demo state are frontend conveniences, not authorization. The backend currently supplies cookie-based authentication; the circular-economy experiences use mock data.

Role selection and preview are frontend conveniences, not authorization. Community Admin is distinct from Municipality Admin: community-level reuse decisions and city-level waste coordination are different responsibilities. The backend does not yet persist or enforce these product roles.

## Shared material journey

1. A citizen identifies an unwanted item and sees its likely material/category, condition/circularity guidance, and suitable next actions.
2. The item can be listed for community reuse/exchange, offered to a reuse/recycling organization, or routed to collection when appropriate.
3. A nearby person or organization can request/match with it; a collector and municipality can coordinate physical pickup where needed.
4. The item progresses through a traceable waste-passport timeline to a recorded outcome such as reuse, repair, upcycling, or recycling.
5. The interface presents estimated material diversion and CO₂e impact as illustrative demo values, not verified measurements.

## Community circular marketplace (frontend demo implemented)

Members can list usable products for sale to members of the active community—for example, selling an unwanted sofa for ₹1,000 rather than discarding it. The seeded demo includes Green Acres Housing Society and Riverside Rotary & Neighbourhood Circle. Switching the active community changes its listing and activity context.

- Demonstrate a **simulated 2% seller fee** in the transaction breakdown. For a ₹1,000 sale, show ₹20 fee and ₹980 illustrative seller proceeds.
- After **7 days without a sale**, move the listing into a Community Admin review queue.
- The Community Admin can record one of three demo decisions: community buy-in, send to a recycler, or place into an auction queue.
- A **simulated 2% seller fee** is shown transparently. For a ₹1,000 sale, show ₹20 fee and ₹980 illustrative seller proceeds. The demo purchase is a local state transition only: no gateway, money transfer, or settlement.
- After **7 days without a sale**, a listing enters the selected community's Community Admin review queue.
- The Community Admin can record community buy-in, send the item to a recycler, or place it into an auction queue. Auction is status-only: no bidding flow.
- Purchases and admin outcomes update local demo listing status, community activity, and the material passport timeline. Completed reuse/recycle outcomes feed illustrative impact views.
- These workflows run through the frontend mock service and localStorage. No marketplace/community FastAPI endpoints are implemented yet.

These are the product defaults currently represented in the frontend demo; do not imply that payment, auction, or community administration is backed by the API.

## Pulled frontend baseline

The current React 18, TypeScript, Vite frontend is a working prototype. It includes:

- Landing, signup/login, protected app routes, and role onboarding.
- Five role previews: citizen, organization, collector, municipality admin, and community admin.
- A mobile-conscious shared app shell and role navigation.
- Citizen scan-result flow with sale/exchange/donation/repair/recycle/collection choices, exchanges/matches, personal listings, community activity, map, impact, and waste-passport screens.
- Community marketplace with active-community selection, item sale listings, simulated checkout and 2% fee breakdown, plus a seven-day unsold review queue and three Community Admin outcomes.
- Organization needs/matches/receipts, collector tasks, and municipality overview/bin/task screens.
- Centralized domain types and a mock circularity service. Demo mutations persist in `localStorage` and can be reset.
- A mobile camera and photo-upload flow connected to Gemini vision analysis through the backend. Structured output identifies the item and fills an editable sale or circular-listing draft; AI actions/rationale/alternatives are suggestions and confidence, condition, weight, and impact remain estimates.
- Smart-bin readings and environmental impact values that are seeded examples, not live IoT or verified emissions data.

Use the current implementation as the source of truth for exact behavior and routes. Inspect `frontend/src/App.tsx`, `frontend/src/lib/domain.ts`, `frontend/src/lib/circularity-service.ts`, `frontend/src/lib/scan-service.ts`, onboarding, and the relevant page before extending it. The marketplace and Community Admin are implemented only in the frontend demo; Gemini vision analysis is backend-powered when configured, while marketplace endpoints do not exist.

## Architecture and demo constraints

- **Frontend:** React 18 + TypeScript + Vite, Tailwind, React Router, Lucide icons, existing UI primitives, and the established TraceIQ visual system (mineral slate, warm stone, deep forest, sage/emerald; Inter and JetBrains Mono).
- **Backend:** FastAPI + PyMongo + MongoDB, with cookie-based JWT authentication, persisted user accounts and saved scan records, plus Gemini image understanding with a constrained structured-output schema. Configure `GEMINI_API_KEY` in ignored `backend/.env`; never expose it in frontend code. Marketplace, community, pickup, and impact APIs are not implemented in the backend yet.
- Keep UI data access in the current service layer. Mock APIs should be replaceable with backend calls without pushing endpoint logic into page components.
- Gemini vision requires the backend API key; if it is missing, the scan endpoint returns a clear configuration error instead of silently showing a static item. The demo still does not require trained custom ML, live location services, smart-bin hardware, or real payments. Clearly label simulated/estimated data where users could mistake it for live or verified data.
- Local MongoDB defaults to `mongodb://localhost:27017` with database `traceiq`; configure `MONGODB_URI`, `MONGODB_DATABASE`, and `JWT_SECRET_KEY` in `backend/.env`. Changing the backend from PostgreSQL does not migrate existing PostgreSQL records; there is no automatic data transfer.
- For substantial UI work, read `frontend/.agents/frontend-design/SKILL.md`, follow its design-plan/review process, and preserve responsive behavior, visible keyboard focus, contrast, and reduced-motion support.

## Suggested presentation walkthrough

1. Start as a citizen and run the sample scan to show the material insight and suggested next action.
2. Show nearby reuse/exchange options and the item's journey/impact context.
3. Open Marketplace, switch between Green Acres and the Riverside association, and show the difference in scoped listings. Review a simulated purchase and the ₹1,000 / ₹20 / ₹980 breakdown.
4. Switch to Community Admin and resolve the seeded unsold sofa as community buy-in, auction queue, or recycler handoff; show the passport/activity update.
5. Switch to collector and municipality views to show pickup coordination and sample city-level visibility; optionally show the organization match/receipt view as the downstream material destination.
6. Close by distinguishing what the prototype demonstrates from future live AI, payments, location, IoT, and backend integrations.

## Working agreement for agents

- Read this file and root `AGENTS.md` before making project-wide changes; inspect relevant code before describing or changing current behavior.
- Keep implemented behavior, mock/demo behavior, and roadmap items explicitly distinct in UI copy, code, and handoff notes.
- Do not rewrite the pulled frontend wholesale. Keep changes focused and preserve teammates' work.
- Update this context when product decisions or demo scope change. Update `AGENTS.md` when architecture, setup, development conventions, or project-wide instructions materially change.
