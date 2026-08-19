# Enterprise AI Knowledge & Action Assistant

Phase 1 establishes the application foundation: a Next.js/React frontend, Express/TypeScript API, PostgreSQL/Prisma data layer, JWT authentication, RBAC middleware, seed data, and an authenticated dashboard.

## Architecture

```text
Browser
   |
   v
Next.js / React / TypeScript
   |
   | REST + JWT
   v
Express / TypeScript API
   |
   v
Prisma ORM
   |
   v
PostgreSQL
```

Gemini, tool/function calling, AI actions workflow, Docker, and other later phases are intentionally not implemented yet.

## Phase 1 structure

```text
apps/
  web/                 # Next.js frontend
    src/app/
  api/                 # Express backend
    src/
      config/
      middleware/
      routes/
      types/
      db.ts
      app.ts
      server.ts
    prisma/
      schema.prisma
      seed.ts
      migrations/
```

## Local setup

Requirements:
- Node.js 20.19+ (22.x recommended)
- PostgreSQL
- npm

Prisma 7 is the current generally available Prisma ORM release. citeturn371288search5turn371288search8

1. Copy `.env.example` to `.env` and provide a PostgreSQL connection string and a JWT secret of at least 32 characters.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma Client and create the database migration:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Start both applications from the repository root:

```bash
npm run dev
```

The API runs on `http://localhost:4000` and the Next.js application uses the standard Next.js development port.

## Demo accounts

All seeded demo accounts use the password `Password123!`:

- `employee@example.com` — EMPLOYEE
- `manager@example.com` — MANAGER
- `admin@example.com` — ADMIN
- `finance@example.com` — EMPLOYEE

Do not use these credentials in a real environment.

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

JWTs are issued by the API and are required for protected routes. Passwords are stored as bcrypt hashes.

## Current status

Phase 1 only. The repository is intentionally stopped before Gemini integration, AI tool calling, reimbursement workflow, Docker, and other later-phase features.
