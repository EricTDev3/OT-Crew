Rules the app must follow

These are every decision made during design, written so each one can become a Vitest test. Rules 1 to 35 apply to the MVP and version 1.
Accounts and invites

1. A company signs up with a work email and confirms it with a one-time code. There is no code at login.
2. The person who signs up becomes the company admin and sets a password.
3. Only company admins can invite people. An invite locks the person's name, email, role, and departments.
4. Only one invite link is valid per person. Resending replaces the old link, and the old link shows "This invite link no longer works."
5. A company admin can resend or cancel a pending invite.
6. Removing someone deletes their account but keeps their past OT records, shown as "Former employee." A returning person needs a new invite.
   Departments and visibility
7. Companies create their own departments, and admins can rename them.
8. A department has a permanent ID. Records point to the ID and show the current name.
9. A person can belong to several departments.
10. Deleting a department requires typing its name. Its people stay in the company, its open requests close, and past records keep it, shown as deleted.
11. Every query for company data is limited to the signed-in person's company. One company never sees another's data.
12. Employees see only requests for their own departments.
13. Employees never see other employees' answers or how many have volunteered.
    Requests and answers
14. A request has a department, date, start time, hours, personnel needed, and a description.
15. Personnel needed is a target, not a limit. The admin may select more people.
16. Posting a request sends an in-app notification to everyone in the department.
17. An employee answers Available, Available for part (a number of hours), or Decline, and can change the answer until the request closes.
18. An employee has at most one answer per request.
19. A partial-hours employee counts as one person if selected, and the admin may skip them.
    Crew, time, and edits
20. The admin selects the crew from employees who answered Available. A selection takes effect when saved and can change until the request closes.
21. Selecting someone sends them an alert. Removing someone from the crew does not notify them. Their status changes to Not selected.
22. Changing the date or hours resets every answer: the crew empties and each person must reconfirm. Changing only the start time or description does not.
23. Editing a request notifies its department. A request's department cannot be changed.
24. A request closes when an admin closes it, or automatically at its start time. Closed requests lock answers and the crew.
25. A request can be reopened until its start time, and reopening notifies the department. After the start time it cannot be reopened.
26. There is no response deadline.
27. If another admin changed a request recently, the second admin gets a warning before saving.
28. If an employee is selected in two departments at the same time, a warning names the other department. It does not block the selection.
    Hours and records
29. The admin grants hours when selecting. A partial offer records the hours offered.
30. Hours worked can be corrected after the shift. Corrections are tagged "Adjusted," logged with who and when, and employees are not notified.
31. Clocked hours live in a separate system, and employees see hours on their pay stubs. The app shows employees no hours history.
32. OT records can be viewed by week, month, or quarter, per employee and per department. An employee who worked in several departments expands to show each.
33. Every override, edit, and hours correction is written to an audit log.
    Notifications
34. Notifications are in-app only: new requests, edits that need reconfirmation, selections, and reopened requests.
35. The only emails are Clerk's sign-up code and invite emails.
    Rules for later releases
    • A department has one lead, and a lead can lead several departments. Leads cannot volunteer for overtime.
    • Only company admins invite, assign leads, or change roles.
    • If a company admin overrides a crew, the lead cannot change it again unless a date or hours edit resets it.
    • Removing a lead who leads one department deletes their account, after the admin types their name. A lead of several departments only loses access to that department. Open requests go to the company admin unless a new lead is assigned.
    • A removed selected employee notifies the lead and the admins, and the spot reopens.
    • A company admin who leaves is replaced by the platform admin, who sees basic company details only.
