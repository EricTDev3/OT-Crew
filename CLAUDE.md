# Instructions

1. You are to help me with building this app OT Crew. You should only build features when I tell you to. Otherwise, I want you to guide me through the steps.
2. Refer to me as Titan when responding to me.
3. Don't write the company-scoping or permission logic for me. Explain the approach and let me write it.
4. Explain any code you write, and check current docs for Clerk, Prisma, and Next.js, since their setups change often.
5. Never put secrets (keys, database URLs) in code or commits.

## Where we are

Done: Step 1, the logic half of Step 2, the access wrapper, the company setup page, the landing page, the sign-up page, and the first company-scoping test. Everything below is tested, or checked by hand where it depends on Clerk and the database.
- Next.js on Vercel, GitHub Actions (typecheck, lint, tests with a Postgres service), Neon through Prisma, Clerk sign-in, protected /dashboard.
- Prisma models: Company, User, Department, DepartmentMember (composite foreign keys keep a membership inside one company).
- src/lib/company.ts: createCompanyWithAdmin creates the company, its first ADMIN user, and its departments in one nested write.
- src/lib/schemas.ts: companyForm, the Zod schema for the company setup form.
- src/lib/user.ts: findUserByClerkId returns id, companyId, role, status, and names, or null.
- src/lib/access.ts: decideAccess turns that result into an answer. No row goes to /setup-company, ACTIVE is allowed, anything else goes to /no-access.
- src/lib/require-user.ts: requireUser runs auth(), findUserByClerkId with the real client, then decideAccess, and either redirects or returns the active user. /dashboard uses it and greets the user by first name. Checked by hand against all three states (no row, INVITED, ACTIVE).
- src/lib/access.ts: decideCompanySetupAccess is the rule for the setup page. Only someone with no User row is allowed. Anyone with a row, whatever the status, goes to /dashboard, where requireUser decides between the dashboard and /no-access. Tested.
- src/lib/require-company-setup-access.ts: requireCompanySetupAccess runs auth(), findUserByClerkId, then decideCompanySetupAccess, and either redirects or returns the Clerk user ID. It runs on the setup page and as the first line of the Server Action, because the action is a public endpoint and the page check is only courtesy.
- /setup-company: the page and form (department chips), and the createCompany Server Action in src/app/setup-company/actions.ts. The action reads email and names from Clerk (never the form), refuses an unverified email, validates with companyForm, and calls createCompanyWithAdmin. A unique constraint violation (Prisma P2002) returns a message instead of a crash. Checked by hand: invalid input, success, a second visit, and a duplicate email.
- Clerk sign-up requires first and last name.
- /no-access page with a Sign out button.
- Header (root layout): dark navy, "OT Crew Builder" brand on the left, Log in and Create account on the right when signed out, the Clerk avatar when signed in. Font is Public Sans. The app is light mode only, so there are no dark: styles.
- Landing page (src/app/page.tsx): hero, How it works, Why teams use it, and a Create account card, built from the Public Site design canvas (the Artifact tool can read it).
- /sign-up: Clerk's SignUp component, restyled with appearance.elements to match the design's "Create account" board. ClerkProvider sets appearance.cssLayerName to "clerk" so Clerk's styles sit in the layer that globals.css already declares. Without it Clerk's styles are unlayered and beat Tailwind utilities, so none of the class names applied. The email field is relabeled "Work email" through ClerkProvider's localization. Clerk's component has no confirm-password field, and the code step is Clerk's own look. Checked by hand.
- Google sign-in is off in the Clerk dev instance, so every sign-up confirms its email with a code. Repeat this on the production instance. A Gmail address is fine if typed in and confirmed.
- Vercel has NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard, NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard, and NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up (the fallback versions did not work, because the header buttons send the current page as redirect_url, which beats the fallback). Revisit at invites (Step 3), where people should return to the invite link.
- src/lib/department.ts: listDepartments(db, companyId) returns that company's departments that are not soft-deleted (deletedAt null), ordered by name then id. tests/department.test.ts covers: each of two companies sees only its own departments (both have an "IT", so a name-only filter would leak), a company with no departments gets [], and a soft-deleted department is hidden. The scoping test (companyId removed) and the soft-delete test (deletedAt: null removed) were each broken on purpose and failed.

Next, in order:
1. Department create, rename, and delete. Every write must carry companyId in its where (a lookup by id alone lets one company change another's department), with a test that tries a wrong-company id and checks nothing changed. Delete is a soft delete (set deletedAt) and needs the typed name (rule 10).
2. A /sign-in page to match the design (the Sign in link on the sign-up card still goes to Clerk's hosted page).

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
- requireUser is the one place a page gets the signed-in user. It imports the real prisma client, so it is the exception to "never import src/lib/prisma.ts." Call it inside Suspense. Pages use the user it returns (companyId, role) and never read the company from the URL or a form.
- Rules live in plain functions that return a description (decideAccess returns { kind, ... }), and the wrapper acts on it. redirect() throws, so call it outside try blocks.
- Only ACTIVE users are let in (an allow-list), so a status added later is refused until someone decides otherwise.
- Removed users keep their User row (status REMOVED) so past records persist, and their clerkUserId is cleared. Future record tables should use onDelete Restrict, not Cascade.
- Known gap: email is stored as typed and User.email is @unique, which is case-sensitive, so two spellings can become two users. Revisit at invites (Step 3). Department names are not unique in the database.
- Known gap: the lookup is by clerkUserId, so a removed person (clerkUserId cleared) or an invited person who signs up on their own looks new and can reach the setup form. The unique email stops them, and they see the duplicate-email message. Revisit at invites (Step 3).
- Known gaps: createCompany has no automated test (it needs Clerk and the database), and its validation message is generic ("Invalid values entered."). The time zone select lists seven US zones.
- Testing habit: build every case from one valid input and change one field, then break the code on purpose and confirm the matching test fails.

## More detail

@docs/build-guide.md
