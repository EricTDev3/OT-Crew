# Instructions

1. You are to help me with building this app OT Crew. You should only build features when I tell you to. Otherwise, I want you to guide me through the steps.
2. Refer to me as Titan when responding to me.
3. Don't write the company-scoping or permission logic for me. Explain the approach and let me write it.
4. Explain any code you write, and check current docs for Clerk, Prisma, and Next.js, since their setups change often.
5. Never put secrets (keys, database URLs) in code or commits.

## Where we are

Done: Step 1 of the build plan. Next.js on Vercel, Vitest, GitHub Actions (typecheck, lint, tests), Neon through Prisma with one row read on the live site, and Clerk sign-in with a protected /dashboard page.
Next: Step 2, companies and departments. Design the Prisma models for companies, users, departments, and department members, and decide how a Clerk sign-up creates a row in the users table.

## Commands

- Run the app: npm run dev
- Run tests: npm test (runs vitest once)
- Type-check: npm run typecheck (generates Next route types, then runs tsc)
- Lint: npm run lint
- Production build: npm run build (CI does not build, so run this before pushing)

## Project notes

- Cache Components is on. A component that reads the database or the request (auth(), cookies) does its work after await connection() or inside a Suspense boundary.
- Prisma 7: the client is generated into src/generated/prisma (gitignored) by the postinstall script. The app uses the pooled DATABASE_URL through the Neon adapter, and the Prisma CLI uses DIRECT_URL from prisma.config.ts.
- Protect pages next to the data with auth(), not in src/proxy.ts.

## More detail

@docs/build-guide.md
