# OT Crew: App Description and Build Guide

As of October 19, 2026

## About the app

OT Crew lets a company fill overtime without calling people one by one: a manager posts a need, employees volunteer from their phones, and the manager picks the crew.

**Tagline:** Build your overtime crew from the employees who volunteer.

**The problem.** In warehouses, production floors, and labs, overtime is often filled by phone calls and group chats. It is slow for managers, nothing records who was offered the work, and it is hard to see who is available across departments.

**What it does**

- A company signs up, confirms its work email with a code, and sets up its departments.
- The company admin invites employees and assigns them to departments.
- When extra work comes up, the admin posts a request: department, personnel needed, date, start time, hours, and a description.
- Everyone in that department is notified. Each employee answers Available, Available for part (with the hours they can work), or Decline.
- The admin sees the volunteers and selects the crew. Employees see their status: Waiting, Selected, or Not selected.
- Every request, answer, and change stays on record, and OT hours can be reviewed by week, month, or quarter.

**Who uses it**

- **Company admin:** runs everything for one company, on a computer.
- **Employee:** answers requests on a mobile website.
- **Department lead and platform admin:** fully designed, planned for after version 1.

**Designs.** About 70 screens are drawn across five canvases (see Roles and screens). Version 1 builds only the admin and employee parts.

## Scope: MVP, version 1, and later

The MVP proves the core loop (post, answer, select), version 1 is the portfolio target, and everything else waits. If time is short, steps 1 to 4 of the build plan plus a README are a presentable minimum.

| Feature                                                  | Release   |
| -------------------------------------------------------- | --------- |
| Sign up and log in (Clerk)                               | MVP       |
| Company admin and employee roles                         | MVP       |
| Create and rename departments                            | MVP       |
| Invite employees and assign departments                  | MVP       |
| Post an OT request                                       | MVP       |
| Employee answers Available or Decline (mobile web)       | MVP       |
| Admin sees volunteers and selects the crew               | MVP       |
| Employee status: Waiting, Selected, Not selected         | MVP       |
| Request closes at its start time                         | MVP       |
| Company scoping tests                                    | MVP       |
| Edit a request, with reconfirm on a date or hours change | Version 1 |
| Close and reopen before the start time                   | Version 1 |
| Available for part (hours)                               | Version 1 |
| In-app alerts                                            | Version 1 |
| Conflict warning and a stale-edit check for two admins   | Version 1 |
| Remove people, resend or cancel invites                  | Version 1 |
| OT records by week, month, or quarter                    | Version 1 |
| Empty states, demo data, README, architecture diagram    | Version 1 |
| Hours-worked corrections                                 | Later     |
| Account page polish and password reset screens           | Later     |
| Platform admin dashboard and company management          | Later     |
| Department lead screens                                  | Later     |
| Playwright test, live updates, push notifications        | Later     |

## Tech stack

Ten choices are settled and approved by the mentor. Next.js handles both screens and server logic, so there is no separate Express API.

| Category                       | Tool                                      | Notes                                               |
| ------------------------------ | ----------------------------------------- | --------------------------------------------------- |
| Language                       | TypeScript                                | Shared types across the app                         |
| Frontend                       | Next.js (React)                           | Learned at the bootcamp                             |
| Backend                        | Next.js Route Handlers and Server Actions | Replaces the planned Express API                    |
| Hosting (frontend and backend) | Vercel                                    | Deploys from GitHub on every push                   |
| Database                       | PostgreSQL                                | Relational data, constraints, transactions          |
| Database hosting               | Neon                                      | Managed Postgres                                    |
| Database access (ORM)          | Prisma                                    | Typed queries and tracked migrations                |
| Auth                           | Clerk                                     | Passwords, email code at sign-up, sessions, invites |
| Testing                        | Vitest                                    | Rules and components; Playwright optional later     |
| CI and delivery                | GitHub Actions, Docker                    | Docker runs Postgres locally                        |

**Working assumptions.** Request status (open or closed) is calculated from the start time when a screen loads, so no scheduled job is needed. Screens refresh every few seconds instead of using WebSockets, because Vercel functions cannot hold connections open. Zod is assumed for validating incoming data. Clerk sends the sign-up and invite emails.

## Roles and screens

Four roles and the public pages are designed on five private canvases; version 1 builds the company admin and employee parts. The canvases are private claude.ai links and cannot be opened by Claude Code.

| Role or area    | What they do                                                                                               | Device                 | Release           | Designs                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------- | -------------------------------------- |
| Company admin   | Sets up departments, invites people, posts requests, selects crews, closes and reopens, reviews OT records | Computer               | Version 1         | Company admin canvas, about 22 screens |
| Employee        | Sees requests for their departments, answers, checks status and alerts                                     | Phone (mobile website) | MVP and version 1 | Employee canvas, 10 screens            |
| Department lead | Runs requests and crews for their own departments, corrects hours, removes people from a department        | Computer               | Later             | Lead canvas, about 20 screens          |
| Platform admin  | Creates, edits, and deletes company accounts; sees basic company details only                              | Computer               | Later             | Platform admin canvas, 6 screens       |
| Public pages    | Landing page, create account, email code, set password, log in, forgot password                            | Both                   | MVP               | Public site canvas, about 10 screens   |

**What each role cannot do.** Employees never see other employees' answers. Leads cannot invite people, assign leads, change roles, or volunteer for overtime. Only company admins invite people.

## Rules the app must follow

These are every decision made during design, written so each one can become a Vitest test. Rules 1 to 35 apply to the MVP and version 1.

### Accounts and invites

1. A company signs up with a work email and confirms it with a one-time code. There is no code at login.
2. The person who signs up becomes the company admin and sets a password.
3. Only company admins can invite people. An invite locks the person's name, email, role, and departments.
4. Only one invite link is valid per person. Resending replaces the old link, and the old link shows "This invite link no longer works."
5. A company admin can resend or cancel a pending invite.
6. Removing someone deletes their account but keeps their past OT records, shown as "Former employee." A returning person needs a new invite.

### Departments and visibility

7. Companies create their own departments, and admins can rename them.
8. A department has a permanent ID. Records point to the ID and show the current name.
9. A person can belong to several departments.
10. Deleting a department requires typing its name. Its people stay in the company, its open requests close, and past records keep it, shown as deleted.
11. Every query for company data is limited to the signed-in person's company. One company never sees another's data.
12. Employees see only requests for their own departments.
13. Employees never see other employees' answers or how many have volunteered.

### Requests and answers

14. A request has a department, date, start time, hours, personnel needed, and a description.
15. Personnel needed is a target, not a limit. The admin may select more people.
16. Posting a request sends an in-app notification to everyone in the department.
17. An employee answers Available, Available for part (a number of hours), or Decline, and can change the answer until the request closes.
18. An employee has at most one answer per request.
19. A partial-hours employee counts as one person if selected, and the admin may skip them.

### Crew, time, and edits

20. The admin selects the crew from employees who answered Available. A selection takes effect when saved and can change until the request closes.
21. Selecting someone sends them an alert. Removing someone from the crew does not notify them. Their status changes to Not selected.
22. Changing the date or hours resets every answer: the crew empties and each person must reconfirm. Changing only the start time or description does not.
23. Editing a request notifies its department. A request's department cannot be changed.
24. A request closes when an admin closes it, or automatically at its start time. Closed requests lock answers and the crew.
25. A request can be reopened until its start time, and reopening notifies the department. After the start time it cannot be reopened.
26. There is no response deadline.
27. If another admin changed a request recently, the second admin gets a warning before saving.
28. If an employee is selected in two departments at the same time, a warning names the other department. It does not block the selection.

### Hours and records

29. The admin grants hours when selecting. A partial offer records the hours offered.
30. Hours worked can be corrected after the shift. Corrections are tagged "Adjusted," logged with who and when, and employees are not notified.
31. Clocked hours live in a separate system, and employees see hours on their pay stubs. The app shows employees no hours history.
32. OT records can be viewed by week, month, or quarter, per employee and per department. An employee who worked in several departments expands to show each.
33. Every override, edit, and hours correction is written to an audit log.

### Notifications

34. Notifications are in-app only: new requests, edits that need reconfirmation, selections, and reopened requests.
35. The only emails are Clerk's sign-up code and invite emails.

### Rules for later releases

- A department has one lead, and a lead can lead several departments. Leads cannot volunteer for overtime.
- Only company admins invite, assign leads, or change roles.
- If a company admin overrides a crew, the lead cannot change it again unless a date or hours edit resets it.
- Removing a lead who leads one department deletes their account, after the admin types their name. A lead of several departments only loses access to that department. Open requests go to the company admin unless a new lead is assigned.
- A removed selected employee notifies the lead and the admins, and the spot reopens.
- A company admin who leaves is replaced by the platform admin, who sees basic company details only.

## Data model starting point

The tables below are a proposal to design yourself and review with your mentor, and they become the Prisma schema. Clerk knows who a person is; your own tables hold their company, departments, and records, linked by the Clerk user ID.

| Table              | Purpose                                  | Key fields and constraints                                                                                                                    |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| companies          | One row per customer company             | name, created date                                                                                                                            |
| departments        | A company's departments                  | company_id, name; the ID never changes, so renames are safe                                                                                   |
| users              | A person in a company                    | clerk_user_id, company_id, role, status (active or removed); removed rows stay so past records keep a name                                    |
| department_members | Which people belong to which departments | user_id, department_id; unique pair                                                                                                           |
| ot_requests        | A posted overtime need                   | company_id, department_id, start time, hours, personnel needed, description, created by, closed time, version number for the stale-edit check |
| ot_responses       | An employee's answer                     | request_id, user_id, answer (available, partial, decline), partial hours, needs reconfirm; unique per request and user                        |
| ot_selections      | Who is on the crew                       | request_id, user_id, hours granted, hours worked, adjusted by, selected by                                                                    |
| notifications      | In-app alerts                            | user_id, type, request_id, read time                                                                                                          |
| audit_log          | Who changed what and when                | company_id, actor, action, record, before and after, time                                                                                     |

**Questions to settle while designing**

- Which tables carry company_id? A good start is that every table holding company data does.
- Where do leads live later: on the person, the department, or the membership row? A department has one lead, and a lead can lead several.
- What do records point to when a person is removed? Keeping the user row with a removed status is one answer.
- Should "closed" be stored or calculated? The working assumption is calculated from the start time, plus a stored closed time for manual closes.

**Two protections to add in the database itself.** Unique constraints (one answer per employee per request, one membership per person per department) and a company check on every query, so these rules hold even if application code slips.

## Build plan

Build in layers and deploy at the start, so every step ends with something running. Work on one step at a time, and ask your mentor to review after each.

### Step 1: Skeleton, deployed

1. Create the Next.js project with TypeScript and push it to a new, empty GitHub repo. Done when the starter page loads locally and the code is on GitHub.
2. Deploy it to Vercel. Done when a live URL shows the starter page.
3. Add Vitest with one trivial test. Done when the test command passes.
4. Run that test in GitHub Actions, starting from GitHub's Node workflow. Done when every push shows a green check.
5. Create a Neon project, define one small table in Prisma, run a migration, and read one row from a page on the live site.
6. Add Clerk sign-in. Done when you can sign up on the live site and open a page that only signed-in people can see.

Quickstarts change often, so follow each tool's current official guide over older tutorials. Keep keys in environment variables, never in code, and add them again in Vercel's settings.

### Steps 2 to 6

| Step                         | What to build                                                                             | Done when                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 2. Companies and departments | Tables for companies, departments, and membership; every company query filters by company | A company-scoping test passes                                          |
| 3. Employees                 | Company admin invites employees through Clerk and assigns departments                     | An invited employee signs in on a phone and lands on their requests    |
| 4. The core loop             | Admin posts a request, employees answer, admin selects a crew, employees see their status | One answer per request and company scoping are tested; MVP is complete |
| 5. Time rules                | Auto-close at the start time, edit with reconfirm, close and reopen, stale-edit warning   | Tests cover reconfirm and the two-admin case                           |
| 6. Polish                    | Alerts, OT records, empty states, demo data, README, diagram                              | A reviewer can use the live site without help                          |

When a problem takes more than about an hour, stop and ask your mentor, or bring the exact error message and what you just did.

## Testing plan

Use Vitest for the rules and components, and write the first four tests before the screens around them. Playwright for one browser flow is an optional addition at the end.

**First four tests**

1. A person from one company cannot read another company's data.
2. An employee can answer a request only once.
3. Changing the date or hours resets the answers.
4. Two admins changing a crew at the same time do not overwrite each other.

**Habits that make testing easier**

- Put the rules in plain TypeScript functions (a service layer) that pages and actions call. Vitest can test them without Next.js.
- Plan a stand-in for Clerk in tests, so a test can say "this person is an employee in Packing."
- Point database tests at a separate test database, never at Neon's real data.

**A known limit.** Vitest cannot render async Server Components. Keep data loading and rules in plain functions and keep the page itself thin.

## Deployment and CI

Every push is tested by GitHub Actions, and a merge to main deploys to Vercel. Docker runs Postgres on your laptop; the live database is Neon.

1. You push code or open a pull request.
2. GitHub Actions installs dependencies, checks types, and runs Vitest, with a temporary Postgres for database tests.
3. If checks pass and the change merges to main, Vercel builds and deploys the app.
4. Prisma migrations run against Neon. Decide whether this happens automatically in the deploy.

**Things to plan for**

- **Secrets.** Clerk keys and the Neon connection string live in environment variables, in Vercel's settings and GitHub's secrets, never in the repo. Check that your .gitignore covers .env files before the first commit.
- **Settings in two places.** What works locally must be added again in Vercel. This is the usual cause when something works locally but not live.
- **Prisma on Vercel.** The client is generated before the build, and a missing step is a common deploy failure.
- **Neon connections.** Serverless functions open many short connections, so check Neon's current guidance on connection pooling.
- **Test keys.** Use Clerk's test keys until the project is ready to share.
- **Repo setup.** Create the GitHub repo empty, use the .gitignore from create-next-app, and add an MIT license.

## Working with AI

Let AI draft the routine work, but if you cannot explain a piece of code in an interview, do not ship it.

| Let AI draft                                     | Use AI as a tutor, and write the key parts yourself | Write it yourself                                      |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------ |
| Project setup and config files                   | The database tables (you design, AI checks)         | The rules list: what must always be true               |
| The GitHub Actions workflow                      | The service layer that enforces the rules           | Company scoping: one company never sees another's data |
| Screens from the designs: layout, styling, forms | Clerk and Prisma wiring                             | Who can do what: role and permission checks            |
| Repetitive pages and components                  | Validation and error handling                       | The stale-edit check for two admins                    |
| Test scaffolding and demo data                   | The reconfirm and closing logic                     | The README and the reasons behind your choices         |

**A workflow that keeps you in charge**

1. Write the rule in plain words first, like "an employee can answer a request only once."
2. Ask AI for the code and a Vitest test for that rule.
3. Read every line, ask for an explanation of anything unclear, then change something small yourself.
4. Run the tests. A passing test for a rule you wrote is stronger than code that merely looks right.
5. Commit small and often, have AI draft the commits and only allow AI to push the commits to github after your approval.

**Cautions.** AI can invent functions or use outdated setups, especially for Clerk, Prisma, and Next.js, so check the current docs. Auth, company scoping, and permission code can look right while being wrong, so write those tests yourself and try to break them. Never paste keys or database addresses into a chat. Say in the README that you used AI tools and what you did with them.

## Portfolio checklist

You can start applying once a version works, is live, and is explained well.

- [ ] A live link that works, with demo accounts for each role
- [ ] Tests for the rules that matter, running in GitHub Actions
- [ ] A README with the description, an architecture diagram, the stack, and the reasons for each choice
- [ ] A short list of what was designed but not built yet
- [ ] Screenshots, and a short demo story you can tell in two minutes
- [ ] A one-line repo description and topics on GitHub
- [ ] An MIT license and a .gitignore that covers .env files
- [ ] A note on how AI tools were used
- [ ] An answer ready for "what was the hardest part?" (the stale-edit check for two admins is a good one)

## Open decisions

The stack is approved, but these items were never settled, so the defaults below apply until the mentor says otherwise.

| Decision                   | Current default                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| App name                   | OT Crew is the chosen name; check domains, app stores, and trademarks before using it publicly      |
| Duplicate company accounts | Parked; options are a unique verified owner email, a name and address check, or a work-domain check |
| Closing requests           | Calculated from the start time, with no scheduled job                                               |
| Live updates               | Refresh every few seconds, no WebSockets                                                            |
| Validation                 | Zod                                                                                                 |
| Email                      | Clerk's built-in emails only                                                                        |
| Prisma migrations          | Whether they run automatically on deploy                                                            |
| Prisma and Neon            | Connection pooling setup, to confirm in current docs                                                |
| Playwright                 | Optional single browser flow at the end                                                             |
| Selecting an employee      | Sends an alert; removing them does not                                                              |
