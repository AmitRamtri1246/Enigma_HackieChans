# TraceIQ — Circular Economy Platform

TraceIQ is an Enigma 5.0 sustainability-track prototype for keeping useful materials in circulation through local reuse, exchange, collection, and recycling.

Read [HACKATHON_CONTEXT.md](HACKATHON_CONTEXT.md) for the product direction and current demo scope, [FRONTEND_IMPLEMENTATION_PROMPT.md](FRONTEND_IMPLEMENTATION_PROMPT.md) for a copy-ready frontend handoff, and [AGENTS.md](AGENTS.md) for repository conventions.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router.
- **Backend:** FastAPI with PyMongo and MongoDB.
- **Authentication:** bcrypt password hashes and JWT in an HttpOnly cookie.
- **Demo data:** Circular-economy frontend workflows use seeded mock data; the backend has user persistence, saved scans, and Gemini vision analysis with structured recommendations. Marketplace and Community Admin changes persist in browser localStorage only.

## Run locally

### Frontend

From the repository root:

```bash
npm install --prefix frontend
npm run dev
npm run build
```

### Backend

Start a local MongoDB server (or use a hosted MongoDB URI), then from `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, a strong `JWT_SECRET_KEY`, and `GEMINI_API_KEY` in `backend/.env`. `GEMINI_MODEL` defaults to `gemini-3.8-flash` and can be changed if your Google AI Studio project uses another available model. Defaults target local MongoDB at `mongodb://localhost:27017` and database `traceiq`. The Vite development server proxies `/api` to `http://127.0.0.1:8000`.

## API routes

- `GET /` — API health response.
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` — cookie-based authentication.
- `POST /api/scan/analyze` — authenticated multipart image analysis through Gemini; returns structured item fields, recommended circular action, rationale, and alternatives. The API key stays in the backend environment.
- `POST /api/scans`, `GET /api/scans`, `GET /api/scans/{scan_id}` — persist and retrieve the authenticated user's scans.

User and scan IDs are MongoDB ObjectIds serialized as strings. The backend creates the required unique email and per-user scan indexes on demand. MongoDB has no Alembic migration step.

Run the database-backed auth and scan smoke test from `backend/` with MongoDB available:

```bash
python test_auth_flow.py
```

## Important prototype limitations

The PostgreSQL-to-MongoDB backend switch does not copy existing PostgreSQL data. Marketplace checkout is simulated; there are no real payments, auction bids, or marketplace API endpoints. Live location services, smart-bin hardware, and verified carbon accounting are not implemented. AI confidence, condition, weight, and circularity suggestions are estimates and should be reviewed before publishing. See the hackathon context for current frontend behavior and future integrations.
