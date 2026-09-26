# AGENTS.md

## Project overview

TraceIQ is a sustainability intelligence platform starter for the Enigma hackathon. It currently contains:

- A React 18 + Vite + TypeScript frontend in `frontend/`.
- A FastAPI + PyMongo backend in `backend/`.
- MongoDB for persisted users and scan records.
- Cookie-based JWT authentication for registration, login, session restoration, and logout.
- Project-local reusable agent skills in `.agents/skills/`.

Keep this document current when the hackathon problem statement introduces new product requirements, services, or development commands.

## Shared hackathon context

- Read [`HACKATHON_CONTEXT.md`](HACKATHON_CONTEXT.md) before project-wide work or when handing work between agents/teammates. It records PS6, the current five-role demo, marketplace behavior, and prototype limitations.
- The frontend has five role previews: Citizen, Reuse/Recycling Organization, Collector, Municipality Admin, and Community Admin. Role preview/onboarding is client-side demonstration state, not backend authorization.
- The frontend includes a localStorage-backed circular marketplace mock: communities, scoped listings, simulated purchase/2% seller-fee display, seven-day review, and Community Admin outcomes. It has no real payments, bids, or marketplace FastAPI endpoints.
- Keep live capabilities, mock/demo behavior, and roadmap items clearly distinguished. Scan analysis uses Gemini through the authenticated backend when `GEMINI_API_KEY` is configured; impact, location, and smart-bin data remain illustrative unless verified in code/API.
- Use [`FRONTEND_IMPLEMENTATION_PROMPT.md`](FRONTEND_IMPLEMENTATION_PROMPT.md) as the frontend handoff brief; inspect the current code first and treat its routes/services as the behavioral source of truth.
- When these product requirements change, update `HACKATHON_CONTEXT.md`; keep this file focused on durable repository instructions and conventions.

## Repository layout

```text
.
├── AGENTS.md
├── HACKATHON_CONTEXT.md
├── FRONTEND_IMPLEMENTATION_PROMPT.md
├── README.md
├── package.json                 # Root frontend convenience scripts
├── .agents/skills/              # Shared project-wide agent skills
├── frontend/
│   ├── .agents/                 # Frontend-specific skills
│   ├── src/
│   │   ├── components/          # Reusable UI and layout components
│   │   ├── contexts/            # React context providers
│   │   ├── lib/                 # API and service helpers
│   │   └── pages/               # Route-level screens
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── backend/
    ├── .agents/                 # Backend-specific skills
    ├── app/
    │   ├── routes/               # FastAPI routers
    │   ├── auth.py               # Password and JWT helpers
    │   ├── config.py             # Environment-backed settings
    │   ├── database.py           # MongoDB client, database dependency, indexes
    │   ├── models.py             # Mongo document helpers
    │   └── schemas.py            # Pydantic request/response schemas
    ├── alembic/                  # Legacy PostgreSQL history only; not used
    ├── requirements.txt
    └── test_auth_flow.py
```

## General working rules

- Read the relevant existing files before changing behavior; preserve established patterns unless the task requires a deliberate redesign.
- Keep changes focused. Do not rewrite unrelated components, reformat the whole repository, or add dependencies without a clear need.
- Never commit secrets, local `.env` files, database credentials, JWT keys, generated build output, or dependency directories.
- Update `README.md` and this file when setup, routes, environment variables, or architecture materially change.
- Prefer small, composable changes that can be tested independently.
- Use clear names based on user-facing concepts rather than implementation details.
- Keep API contracts consistent between backend schemas/routes and frontend service types.
- When a task spans frontend and backend, verify both sides of the request/response and authentication flow.

## Frontend development

### Commands

Run from the repository root:

```bash
npm install --prefix frontend
npm run dev
npm run build
```

Or run directly in `frontend/`:

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The Vite development server runs on port `5173` and proxies `/api` requests to `http://127.0.0.1:8000`.

### Frontend conventions

- Use TypeScript with strict compiler settings. Avoid `any`, unused locals, and unused parameters.
- Use the `@/` alias for imports from `frontend/src`.
- Put route-level screens in `src/pages/`, reusable UI in `src/components/`, and cross-cutting state in `src/contexts/`.
- Put HTTP calls in `src/lib/`; use `apiRequest` so credentials and API error handling remain consistent.
- Keep authentication state in `AuthContext` and use `useAuth()` instead of duplicating session logic in pages.
- Use React Router routes in `src/App.tsx`; protect authenticated routes with `ProtectedRoute`.
- Reuse the existing Radix/shadcn-style UI primitives in `src/components/ui/` before adding another component library.
- Follow the existing sustainability design system: mineral slate, warm stone/sand, deep forest, sage/emerald accents, Inter for UI text, and JetBrains Mono for telemetry values.
- Preserve keyboard focus visibility, responsive layouts, readable contrast, and reduced-motion behavior when adding interactions.
- Avoid generic dashboard/card grids or decorative effects that do not support the product task. Use the frontend-design skill for substantial visual work.

## Backend development

### Setup and commands

Run from `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The backend expects MongoDB at `MONGODB_URI` and uses `MONGODB_DATABASE` to select its database. The default URI is `mongodb://localhost:27017`; a hosted MongoDB URI can be used for shared hackathon access. Add `GEMINI_API_KEY` to `backend/.env` for vision analysis and optionally change `GEMINI_MODEL`. No Alembic migrations are used.

Run the current auth smoke test from `backend/` after the environment and database are configured:

```bash
python test_auth_flow.py
```

### Backend conventions

- Keep route handlers in `backend/app/routes/` and register routers in `backend/app/main.py`.
- Store documents through PyMongo collections from the `get_db()` dependency. Keep request/response contracts in `schemas.py` and document conversion helpers in `models.py`.
- Use Pydantic schemas for API boundaries; do not expose `password_hash` or other secrets in responses.
- Hash passwords with the existing bcrypt/passlib configuration. Never store or log plaintext passwords.
- Use the existing JWT helpers and `access_token` HttpOnly cookie for authentication unless the problem statement requires a different security model.
- Keep authentication failures appropriately generic; do not reveal whether an email exists during login.
- Add required MongoDB indexes in `database.ensure_indexes()` and keep them idempotent. MongoDB does not use the removed Alembic migration workflow.
- Keep CORS origins explicit and development-only origins separate from production configuration.
- Treat `secure=False` cookies and localhost origins as development settings; review them before any production deployment.

## Current API surface

The backend currently exposes:

- `GET /` — health check.
- `POST /api/auth/register` — create a user and set the auth cookie.
- `POST /api/auth/login` — authenticate a user and set the auth cookie.
- `GET /api/auth/me` — return the authenticated user.
- `POST /api/auth/logout` — clear the auth cookie.
- `POST /api/scan/analyze` — authenticated Gemini vision analysis with structured circularity recommendations.
- `POST /api/scans`, `GET /api/scans`, and `GET /api/scans/{scan_id}` — save and retrieve the authenticated user's scan records.

When adding or changing an endpoint, update the backend schema, frontend service/types, README documentation, and tests together.

## Environment and security

- Use `backend/.env.example` as the source for required backend variables.
- Local secrets belong in `backend/.env`, which is ignored by Git.
- Required settings include `JWT_SECRET_KEY`; `GEMINI_API_KEY` is required to use the vision scan endpoint. `MONGODB_URI` and `MONGODB_DATABASE` default to local development values, while `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`, `FRONTEND_URL`, and `GEMINI_MODEL` have development defaults.
- Use a strong, unique JWT secret outside local development.
- Do not paste environment values, tokens, cookies, or database connection strings into logs, commits, screenshots, or issue comments.
- Validate and constrain user input at the API boundary, especially authentication and future data-import endpoints.

## Verification checklist

Before handing off a change:

1. Run `npm run build` for frontend or full-stack changes.
2. Run the backend auth smoke test when backend auth/database behavior changed.
3. Verify required MongoDB indexes and exercise affected document operations when persistence changes.
4. Manually verify affected routes in the browser when UI or navigation changed.
5. Check responsive behavior, keyboard interaction, loading states, empty states, and error states for UI changes.
6. Inspect `git diff` and confirm no secrets, generated files, or unrelated changes are included.

## Skills

Shared skills are installed under `.agents/skills/` and should be used when their trigger matches the task:

- `idea-refine` for shaping or stress-testing a vague product idea.
- `grill-me` for challenging assumptions and requirements before implementation.
- `diagnosing-bugs` for investigating and fixing bugs systematically.
- `pptx` for presentation/deck work.

Frontend-specific guidance is in `frontend/.agents/frontend-design/SKILL.md`. Backend-specific skills can be added under `backend/.agents/` as the project grows.

When a skill provides supporting files or scripts, read the skill's `SKILL.md` first and follow its local instructions. Do not treat skills as a substitute for inspecting the actual codebase.
