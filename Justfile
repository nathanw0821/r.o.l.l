# R.O.L.L. Justfile - Universal Command Runner
# Spec §6: Operational Quality Gates & Deployment Pacing

default: check

# Full production release quality gate (lint -> prisma -> test -> build -> typecheck)
check:
    npm run release:check

# Run unit and integration tests (Vitest)
test:
    npm run test

# Run Next.js local development server
dev:
    npm run dev

# Run ESLint across codebase
lint:
    npm run lint

# Validate and generate Prisma schemas
prisma:
    npx prisma validate
    npx prisma generate

# Typecheck TypeScript definitions
typecheck:
    npx tsc --noEmit
