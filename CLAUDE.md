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
- src/lib/schemas.ts: named exports companyForm (the Zod schema for the company setup form) and departmentName (trimmed, 2 to 40 characters). companyForm uses departmentName, and the rename, create, and delete actions should too, so one rule covers every department name. Import them as { companyForm }, not as a default import.
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
- src/lib/department.ts: renameDepartment(db, companyId, departmentId, name) runs updateMany with id, companyId, and deletedAt: null in the where, so a wrong-company or soft-deleted department matches nothing. It returns { kind: "renamed", department } or { kind: "not-found" } (RenameResult), and not-found covers a missing id, another company's id, and a deleted department alike. It trusts the name, so the caller must validate it with departmentName first. No Server Action calls it yet. Tests: renames its own department, another company cannot rename it (the stored name is read back and unchanged), and a soft-deleted department cannot be renamed (also read back). The wrong-company test (companyId removed from the update) and the soft-delete test (deletedAt: null removed from the update) were each broken on purpose and failed.
- src/lib/department.ts: createDepartment(db, companyId, name) looks for a non-deleted department in the same company with the same name (case-insensitive) and returns { kind: "duplicate-name" } if one exists, otherwise creates it and returns { kind: "created", department } (CreateResult). The same name in another company is allowed, and a soft-deleted department does not block the name. It trusts the name, so the caller must validate it with departmentName first. No Server Action calls it yet. The check and the insert are two steps, so two simultaneous requests could both pass the check (department names are not unique in the database). Tests: creates under the right company, rejects a duplicate in the same company, rejects a duplicate that differs only in case, allows the same name in another company, and a soft-deleted department does not block the name.
- src/lib/department.ts: deleteDepartment(db, companyId, departmentId, nameEntered) is a soft delete. It runs updateMany with id, companyId, deletedAt: null, and the trimmed typed name (case-insensitive) in the where, and sets deletedAt. It returns { kind: "deleted" } or { kind: "not-found" } (DeleteResult), and not-found covers a wrong typed name, a missing id, another company's id, and an already-deleted department alike, so the caller cannot tell a wrong name from a missing department. Memberships are untouched (people stay in the company). Open requests are not closed yet because there is no requests table; add that at Step 4 (rule 10). No Server Action calls it yet. Tests: deletes its own department with the exact name, deletes regardless of casing, a wrong typed name deletes nothing, another company's id deletes nothing (both companies have an "IT"), and deleting an already-deleted department returns not-found and leaves the first deletedAt unchanged (all read back). The wrong-company test (companyId removed), the already-deleted test (deletedAt: null removed), and the wrong-name test (name condition removed) were each broken on purpose and failed.
- src/lib/department-permission.ts: decideDepartmentChange(role) is the rule for who may create, rename, or delete departments. Only ADMIN is allowed (an allow-list on role === "ADMIN", so a role added later is refused). It takes just the role (UserRole) and returns { kind: "allowed" } or { kind: "forbidden" } (DepartmentChangeDecision). It does no lookup, so it runs after requireUser has returned an ACTIVE user. No Server Action calls it yet. Tests (tests/department-permission.test.ts, no database): ADMIN is allowed and EMPLOYEE is forbidden. The rule was broken on purpose both ways (always allowed, always forbidden) and the matching test failed each time.
- Test setup that changes or reads rows through testDb may filter by id alone, since the test picked the id. Code in src/ never does.

Next, in order:
1. A Server Action for each of create, rename, and delete. Order in each: requireUser, decideDepartmentChange(user.role), validate with departmentName, then call the department function with user.companyId. Only ADMIN may change departments (decided). Delete needs the typed name (rule 10).
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
