# Testing Results

## Project

**Campus Lost & Found Intelligence System**

**Test date:** 2026-11-01  
**Environment:** Windows, Node.js, Next.js, MySQL 8.x, MongoDB  
**Application URL:** `http://localhost:3000`

## 1. Test Environment

| Component | Configuration |
|---|---|
| Frontend/backend | Next.js App Router with TypeScript |
| Relational database | MySQL database `campus_lnf` |
| NoSQL database | MongoDB database `campus_lnf` |
| Authentication | bcrypt password hashing and JWT httpOnly cookie |
| Seed data | MySQL sample records and 19 MongoDB `item_details` documents |
| Test accounts | Student and administrator seed accounts |

Sensitive credentials were not included in this document.

## 2. Database Setup Tests

| ID | Test | Expected result | Actual result | Status |
|---|---|---|---|---|
| DB-01 | Run `setup.ps1` with valid MySQL credentials | MySQL schema is created without errors | Database, tables, views, procedures, trigger, indexes, and seed records were created | PASS |
| DB-02 | Seed MongoDB using `database/mongodb/seed.js` | MongoDB collection and indexes are created | 19 `item_details` documents and indexes were created | PASS |
| DB-03 | Verify MySQL seed reports | SQL aggregate queries return records | Category, location, recovery-rate, approval-rate, return-time, and subquery reports returned results | PASS |
| DB-04 | Run MongoDB aggregation pipelines | Aggregations return grouped results | Item-type, keyword, and color aggregations returned results | PASS |
| DB-05 | Verify relational constraints | Invalid or duplicate relational data is rejected | Primary keys, foreign keys, unique constraints, enums, and match-pair constraints are defined in the schema | PASS - schema verified |

## 3. API Tests

| ID | Endpoint or workflow | Expected result | Actual result | Status |
|---|---|---|---|---|
| API-01 | `GET /api/items` | Return active and historical item reports | HTTP 200 response returned 20 seeded reports | PASS |
| API-02 | `GET /api/locations` | Return selectable campus locations | HTTP 200 response returned 10 locations | PASS |
| API-03 | Student login with valid credentials | Create a session and return user information | HTTP 200 response returned the student account and role | PASS |
| API-04 | Login with invalid credentials | Return a clear authentication error | HTTP 401 response returned `Invalid credentials` | PASS |
| API-05 | Register with a new email | Create a student account | HTTP 201 response returned a new user ID | PASS |
| API-06 | Register with an existing email | Reject the duplicate account | Duplicate-email handling returns HTTP 409 | PASS - implementation verified |
| API-07 | Unauthenticated item creation | Reject the request | API checks for a valid JWT and returns HTTP 401 | PASS - implementation verified |
| API-08 | Student claim query | Return only claims submitted by that student | `/api/claims` filters by the authenticated user's ID | PASS - implementation verified |
| API-09 | Admin all-claims query | Return all claims for review | `/api/claims?scope=all` returned all seeded claims for an admin | PASS |
| API-10 | Non-admin access to admin reports | Reject administrative access | Admin reports route checks the JWT role and returns HTTP 403 for non-admin users | PASS - implementation verified |

## 4. Browser Workflow Tests

| ID | Workflow | Expected result | Actual result | Status |
|---|---|---|---|---|
| UI-01 | Open Browse while logged out | Public browse page loads reports | Browse displayed 20 reports without an infinite loading state | PASS |
| UI-02 | Open Report while logged out | Redirect to Login without an infinite spinner | Browser redirected to `/login` | PASS |
| UI-03 | Open Report while logged in | Report form loads | Form loaded successfully | PASS |
| UI-04 | Open the Location selector | Location options are available | 10 campus locations were displayed | PASS |
| UI-05 | Submit invalid login credentials | Error is visible in the page | `Invalid credentials` was displayed | PASS |
| UI-06 | Submit valid student login | Redirect to student interface | Browser redirected to Browse | PASS |
| UI-07 | Open My Claims as admin | Show only the admin's own claims | Personal claims endpoint returned only the admin's claims | PASS |
| UI-08 | Open Admin Dashboard Claims tab | Show all claims for administrative review | Dashboard requests `scope=all` and displays the full review queue | PASS - implementation verified |

## 5. Matching and Claim Workflow Tests

| ID | Workflow | Expected result | Actual result | Status |
|---|---|---|---|---|
| WF-01 | Compare a lost and found report with similar attributes | Calculate a score and explain matching factors | Seeded matches include scores and human-readable reasons such as category, location, color, date, and keywords | PASS - seeded workflow |
| WF-02 | Save a high-confidence match | Store the pair in MySQL `Matches` | Matching service saves matches at or above the configured threshold of 50 | PASS - implementation verified |
| WF-03 | Submit a claim for a found item | Store a pending claim | Claims API inserts a pending claim for the authenticated user | PASS - implementation verified |
| WF-04 | Approve a claim as an administrator | Update claim and item status transactionally | Admin API calls the `approve_claim` stored procedure | PASS - implementation verified |
| WF-05 | Record an item status change | Insert an audit record | `trg_item_status_history` inserts into `StatusHistory` after an item update | PASS - implementation verified |
| WF-06 | Mark an item as returned | Update item status to `RETURNED` | Admin status endpoint and stored procedure support the transition | PASS - implementation verified |

## 6. Code Validation

| Check | Result |
|---|---|
| TypeScript compilation with `npx tsc --noEmit` | PASS |
| Focused linting for modified Browse and Report pages | PASS |
| Full ESLint run | NOT CLEAN: existing explicit-`any` and React effect warnings remain in several API and UI files |
| Production `next build` | Requires a separate cleanup pass for Next.js 16 dynamic/prerender behavior |

## 7. Known Limitations

- Automated unit and integration test files have not been added; the results above are manual/API verification results.
- The status-history trigger currently records `Items.reported_by` as `changed_by`; a future improvement would pass the actual administrator ID into the status-history operation.
- The application uses a rule-based matching algorithm rather than vector embeddings. Vector search is optional in the project requirements.
- Full lint and production-build cleanup is still required eventually.

## 8. Final Test Conclusion

The main review workflow is operational: MySQL and MongoDB setup succeeds, reports and locations load, authentication works, roles are enforced, claims are separated by user/admin scope, MongoDB aggregation is available, and explainable item matching is implemented.

The project is suitable for a functional demonstration, after a final manual end-to-end rehearsal.
