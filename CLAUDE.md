# Instructions

1. You are to help me with building this app OT Crew. You should only build features when I tell you to. Otherwise, I want you to guide me through the steps.
2. Refer to me as Titan when responding to me.
3. Don't write the company-scoping or permission logic for me. Explain the approach and let me write it.
4. Explain any code you write, and check current docs for Clerk, Prisma, and Next.js, since their setups change often.
5. Never put secrets (keys, database URLs) in code or commits.

## Where we are

Done: Step 1, and the logic half of Step 2. Everything below is tested and pushed.
- Next.js on Vercel, GitHub Actions (typecheck, lint, tests with a Postgres service), Neon through Prisma, Clerk sign-in, protected /dashboard.
- Prisma models: Company, User, Department, DepartmentMember (composite foreign keys keep a membership inside one company).
- src/lib/company.ts: createCompanyWithAdmin creates the company, its first ADMIN user, and its departments in one nested write.
- src/lib/schemas.ts: companyForm, the Zod schema for the company setup form.
- src/lib/user.ts: findUserByClerkId returns id, companyId, role, status, and names, or null.
- src/lib/access.ts: decideAccess turns that result into an answer. No row goes to /setup-company, ACTIVE is allowed, anything else goes to /no-access.
- /no-access page with a Sign out button.

Next, in order:
1. The wrapper pages call: auth(), then findUserByClerkId with the real client, then decideAccess, then redirect() or return the user. Use it on /dashboard.
2. The company setup page and its Server Action: validate with companyForm, read email and names from Clerk (never from the form), call createCompanyWithAdmin.
3. The sign-up and email-code screens, then the company-scoping test and department create, rename, and delete.

## Commands

- Run the app: npm run dev
- Run tests: npm test (runs vitest once). Start the test database first with docker compose up -d.
- Type-check: npm run typecheck (generates Next route types, then runs tsc)
- Lint: npm run lint
- Production build: npm run build (CI does not build, so run this before pushing)
- After a schema change: migrate, then npx prisma generate. Prisma 7 does not regenerate the client on migrate.
- Migrations on the Docker test database: set DIRECT_URL to the local test URL for that one command (migrate deploy). Check which database it targets before pressing Enter.

## Project notes

- Cache Components is on. A component that reads the database or the request (auth(), cookies) does its work after await connection() or inside a Suspense boundary.
- Prisma 7: the client is generated into src/generated/prisma (gitignored) by the postinstall script. The app uses the pooled DATABASE_URL through the Neon adapter, and the Prisma CLI uses DIRECT_URL from prisma.config.ts.
- Protect pages next to the data with auth(), not in src/proxy.ts.
- Functions that touch the database take the client as their first parameter (db) and never import src/lib/prisma.ts. Tests pass the Docker client from tests/helpers/db.ts, which refuses any URL whose host is not localhost.
- Rules live in plain functions that return a description (decideAccess returns { kind, ... }), and the wrapper acts on it. redirect() throws, so call it outside try blocks.
- Only ACTIVE users are let in (an allow-list), so a status added later is refused until someone decides otherwise.
- Removed users keep their User row (status REMOVED) so past records persist, and their clerkUserId is cleared. Future record tables should use onDelete Restrict, not Cascade.
- Known gap: email is stored as typed and User.email is @unique, which is case-sensitive, so two spellings can become two users. Revisit at invites (Step 3). Department names are not unique in the database.
- Testing habit: build every case from one valid input and change one field, then break the code on purpose and confirm the matching test fails.

## More detail

@docs/build-guide.md
