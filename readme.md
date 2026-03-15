# Sessions Marketplace

A platform where people can discover and book live expert sessions — think workshops, coaching calls, and masterclasses. Users sign in with Google or GitHub, browse what's available, and book a spot. Creators publish and manage their own sessions.

Built with Django on the backend, Next.js on the frontend, PostgreSQL for the database, and the whole thing runs in Docker with Nginx as a reverse proxy.

---

## What's inside

- Google and GitHub OAuth login — no passwords to manage
- JWT tokens issued by the backend, auto-refreshed on the frontend
- Two account types: regular users who book, and creators who publish sessions
- Public catalog with search, session detail pages, and a "Book Now" flow
- User dashboard showing upcoming and past bookings with cancel option
- Creator dashboard to create, edit, and delete sessions, plus a booking overview
- Stripe payments in test mode
- Rate limiting on auth and booking endpoints
- Auto-generated API docs at `/api/docs/`

---

## Running locally

You'll need Python 3.11+, Node 18+, and a PostgreSQL database (local install or Supabase both work).

### Backend

```bash
cd backend

# Set up the virtual environment
python -m venv env
source env/Scripts/activate      # Windows Git Bash
# source env/bin/activate         # Mac or Linux

pip install -r requirements.txt

# Copy the example env file and fill in your values
cp .env.example .env

# Run migrations — accounts must go first
python manage.py makemigrations accounts --settings=config.settings.development
python manage.py makemigrations sessions_app bookings --settings=config.settings.development
python manage.py migrate --settings=config.settings.development

# Create an admin account
python manage.py createsuperuser --settings=config.settings.development

python manage.py runserver --settings=config.settings.development
```

Backend is at `http://127.0.0.1:8000`. API docs at `http://127.0.0.1:8000/api/docs/`.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend is at `http://localhost:3000`.

---

## Running with Docker

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up --build -d
```

This starts four containers: PostgreSQL, Django, Next.js, and Nginx. Everything is available at `http://localhost`.

To create an admin user inside Docker:

```bash
docker compose exec backend python manage.py createsuperuser \
  --settings=config.settings.development
```

---

## Environment variables

Copy `backend/.env.example` to `backend/.env`. The variables you need to fill in:

| Variable | Where to get it |
|---|---|
| `DJANGO_SECRET_KEY` | Generate any random string, 50+ characters |
| `POSTGRES_*` | Your database connection details |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google Cloud Console → Credentials |
| `GITHUB_CLIENT_ID` / `SECRET` | GitHub → Settings → Developer Settings → OAuth Apps |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys (use test key) |

### OAuth redirect URIs

For Google, add these two URIs in Google Cloud Console under your OAuth client:
```
http://127.0.0.1:8000/social-auth/complete/google-oauth2/
http://localhost:8000/social-auth/complete/google-oauth2/
```

For GitHub, set the callback URL to:
```
http://localhost:8000/social-auth/complete/github/
```

---

## Adding test data

1. Go to `http://127.0.0.1:8000/admin/` and log in with your superuser
2. Create a Category (e.g. "Engineering" or "Design")
3. Create a Session — set status to **published** and pick a future date
4. Open `http://localhost:3000` — the session should appear in the catalog
5. Sign in with Google or GitHub as a regular user and try booking it
6. To test creator features: go to `/profile` and click "Become a Creator", then visit `/creator`

Test Stripe card: `4242 4242 4242 4242` · any future expiry · any CVC

---

## Project layout

```
sessions-marketplace/
├── backend/
│   ├── apps/
│   │   ├── accounts/        User model, OAuth pipeline, JWT views
│   │   ├── sessions_app/    Session and Category models, API
│   │   └── bookings/        Booking model, Stripe endpoints
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py      Shared settings
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             Next.js pages
│   │   ├── components/      Reusable UI components
│   │   ├── lib/             Axios client, auth context
│   │   └── types/           TypeScript interfaces
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## API reference

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/api/sessions/` | Browse published sessions | No |
| GET | `/api/sessions/{slug}/` | Session detail | No |
| POST | `/api/sessions/` | Create a session | Creator |
| PATCH | `/api/sessions/{slug}/` | Edit a session | Owner |
| DELETE | `/api/sessions/{slug}/` | Delete a session | Owner |
| GET | `/api/sessions/my-sessions/` | Your sessions | Creator |
| GET | `/api/sessions/categories/` | Category list | No |
| GET | `/api/bookings/` | Your bookings | User |
| POST | `/api/bookings/` | Book a session | User |
| PATCH | `/api/bookings/{id}/cancel/` | Cancel a booking | Owner |
| GET | `/api/auth/me/` | Current user info | User |
| PATCH | `/api/auth/me/` | Update profile | User |
| POST | `/api/auth/switch-role/` | Become a creator | User |
| POST | `/api/bookings/create-payment-intent/` | Start Stripe checkout | User |
| POST | `/api/bookings/confirm-payment/` | Confirm payment | User |

Full interactive docs (Swagger UI): `http://localhost:8000/api/docs/`

---

## Bonus features implemented

- **Stripe payments** — PaymentIntent flow, test mode, confirm endpoint
- **Rate limiting** — 10 requests/min on auth callback, 20 bookings/hour per user
- **API documentation** — auto-generated via drf-spectacular

---

## Deployment notes

For production, set `DJANGO_DEBUG=False` in your `.env`, update `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` with your real domain, and make sure SSL is enabled. The production settings file already has HSTS and secure cookie flags configured.

The GitHub Actions workflow in `.github/workflows/deploy.yml` handles CI/CD to DigitalOcean — set the `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_SSH_KEY` secrets in your GitHub repo settings.