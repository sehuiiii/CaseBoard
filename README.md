# CaseBoard

CaseBoard is a graph-based project management web service with a cold forensic case-file concept. Users create project boards, add clue-like nodes for tasks, bugs, people, and events, and connect them as evidence links.

## Stack

- Next.js 16 App Router
- TypeScript
- Prisma + PostgreSQL
- Auth.js (`next-auth`) + Prisma Adapter
- React Flow
- next-intl
- Tailwind CSS
- Auth.js Credentials email/password authentication

## Local Setup

```bash
npm install
cp .env.example .env
docker compose -p caseboard up -d
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000/ko`.

## Required Environment Variables

```bash
DATABASE_URL="postgresql://caseboard:caseboard@localhost:5432/caseboard?schema=public"
AUTH_SECRET="replace-with-a-long-random-development-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Verification

```bash
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

The production build uses Turbopack through `next build --turbopack`.
