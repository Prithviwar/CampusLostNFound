# Campus Lost & Found Intelligence System

## Implementation Plan

This document defines the implementation work required to complete the Campus Lost & Found Intelligence System for the DBMS Level 3 project review.

## 1. Review Requirements

The implementation must satisfy these review requirements:

- The ER diagram must contain at least five tables.
- The application must use an RDBMS and a NoSQL database.
- The project demo must include meaningful database reports.
- The project must include a clear novelty beyond basic CRUD.
- The application must use Next.js and connect to the databases through backend API routes or route handlers.
- The project must demonstrate database design, implementation, integration, and advanced database concepts.

## 2. Project Direction

### Project title

**Campus Lost & Found Intelligence System**

### Problem

Campus lost-and-found information is usually distributed across notices, messaging groups, and word of mouth. Students have difficulty finding possible matches, and administrators have no controlled process for verifying claims and returning items.

### Main solution

Build a centralized web application where students can report lost and found items, search active reports, receive possible matches, and submit claims. Administrators can verify reports, review claims, update item statuses, and view system analytics.

## 3. Novelty Requirement

The main novelty is an **explainable intelligent matching system**.

The system must compare lost and found reports using:

- Item category
- Brand
- Color
- Location
- Reported date
- Description keywords
- Category-specific attributes

It must generate a match score and explain the score to the user.

Example output:

> Match score: 85%  
> Reasons: Same category, same location, similar color, reported within two days, and three common description keywords.

This makes the project more than a standard lost-and-found CRUD application. The project should also provide analytics for frequent loss locations, common categories, claim approval rates, and recovery rates.

## 4. Technology Stack

- Frontend: Next.js
- Backend: Next.js API routes or Route Handlers
- RDBMS: MySQL
- NoSQL database: MongoDB
- Version control: Git and GitHub
- Password security: Password hashing
- Configuration: Environment variables

## 5. Database Architecture

Use MySQL for structured and transactional data. Use MongoDB for flexible descriptions and category-specific item attributes.

### Why MySQL?

MySQL is appropriate for:

- Users and roles
- Locations
- Item report ownership
- Claims
- Status changes
- Foreign-key relationships
- Transactions
- Administrative reporting

### Why MongoDB?

MongoDB is appropriate for:

- Flexible item descriptions
- Visual descriptions
- Category-specific attributes
- Search keywords
- Optional images and metadata

Different item categories do not require identical attributes. A laptop, wallet, ID card, and backpack can therefore be represented without forcing all fields into a rigid relational table.

## 6. MySQL Database Design

Use at least six tables in the ER diagram. This exceeds the required minimum of five tables.

### 6.1 Users

Stores student and administrator accounts.

Suggested columns:

- `user_id` - primary key
- `name`
- `email` - unique and not null
- `password_hash` - not null
- `role` - `STUDENT` or `ADMIN`
- `created_at`

### 6.2 Locations

Stores campus locations where items were lost or found.

Suggested columns:

- `location_id` - primary key
- `building`
- `area`
- `description`

### 6.3 Items

Stores the structured part of every lost or found report.

Suggested columns:

- `item_id` - primary key
- `reported_by` - foreign key to `Users`
- `location_id` - foreign key to `Locations`
- `report_type` - `LOST` or `FOUND`
- `category`
- `title`
- `reported_date`
- `status`
- `created_at`

Suggested statuses:

- `REPORTED`
- `MATCHED`
- `CLAIMED`
- `VERIFIED`
- `RETURNED`
- `CLOSED`

### 6.4 Claims

Stores claims submitted by students.

Suggested columns:

- `claim_id` - primary key
- `item_id` - foreign key to `Items`
- `claimed_by` - foreign key to `Users`
- `claim_description`
- `status` - `PENDING`, `APPROVED`, or `REJECTED`
- `reviewed_by` - foreign key to `Users`
- `reviewed_at`
- `created_at`

### 6.5 StatusHistory

Stores every item status transition.

Suggested columns:

- `history_id` - primary key
- `item_id` - foreign key to `Items`
- `old_status`
- `new_status`
- `changed_by` - foreign key to `Users`
- `changed_at`

### 6.6 Matches

Stores possible matches between lost and found reports.

Suggested columns:

- `match_id` - primary key
- `lost_item_id` - foreign key to `Items`
- `found_item_id` - foreign key to `Items`
- `match_score`
- `match_reason`
- `match_status`
- `created_at`

### 6.7 Relationships

The ER diagram must show these relationships:

- One user can create many item reports.
- One location can contain many item reports.
- One item can have many claims.
- One item can have many status-history records.
- One lost item can have many possible found-item matches.
- One found item can match many lost-item reports.
- An administrator can review many claims.

### 6.8 Relational constraints

Implement and document:

- Primary keys for every table.
- Foreign keys for all relationships.
- Unique constraint on user email.
- Not-null constraints for required fields.
- Check constraints for roles, report types, claim statuses, and item statuses.
- Prevent invalid lost-to-lost or found-to-found match pairs.
- Prevent duplicate claims for the same user and item where appropriate.

## 7. MongoDB Design

Create an `item_details` collection.

Example document:

```json
{
  "item_id": 101,
  "description": "Black laptop bag with a small PES sticker",
  "visual_attributes": {
    "color": "black",
    "brand": "Wildcraft",
    "identifying_marks": ["PES sticker", "small tear"]
  },
  "category_attributes": {
    "item_type": "laptop bag",
    "size": "medium",
    "compartment_count": 3
  },
  "keywords": ["black", "laptop", "bag", "PES"],
  "image_url": null,
  "search_metadata": {
    "normalized_text": "black laptop bag pes sticker"
  },
  "updated_at": "2026-10-25T10:00:00Z"
}
```

Create MongoDB indexes for:

- `item_id`
- `keywords`
- `visual_attributes.color`
- `visual_attributes.brand`
- Relevant category attributes

Demonstrate at least one MongoDB aggregation pipeline during the review.

## 8. Matching Algorithm

Implement a rule-based scoring algorithm first. It is simple to test and easy to explain during the review.

| Attribute | Points |
|---|---:|
| Same category | 25 |
| Same or nearby location | 20 |
| Same brand | 15 |
| Same color | 10 |
| Reported within three days | 15 |
| Common description keywords | 15 |
| **Total** | **100** |

### Matching workflow

1. A student submits a lost or found report.
2. Store structured report information in MySQL.
3. Store flexible item details in MongoDB.
4. Find active reports of the opposite type.
5. Retrieve their details from MySQL and MongoDB.
6. Compare the matching attributes.
7. Calculate a score from 0 to 100.
8. Generate a human-readable explanation.
9. Save high-confidence matches in the MySQL `Matches` table.
10. Display ranked matches to the student.

Use a configurable threshold, such as 50 points, for saving and displaying possible matches.

## 9. Application Features

### 9.1 Student features

- Register and log in.
- Report a lost item.
- Report a found item.
- Search active reports.
- Filter reports by category, location, date, and status.
- View ranked possible matches.
- View match explanations.
- Submit a claim.
- Track claim status.

### 9.2 Administrator features

- Log in as an administrator.
- View pending item reports.
- Verify or reject reports.
- View pending claims.
- Approve or reject claims.
- Mark items as returned.
- View status history.
- View analytics and database reports.

### 9.3 Authentication and authorization

Implement two roles:

- `STUDENT`
- `ADMIN`

Protect administrator routes and pages so students cannot approve claims or modify administrative data.

Passwords must be hashed. Database credentials and other secrets must be stored in environment variables and excluded from Git.

## 10. Required Database Features

Implement and document at least four advanced SQL features and one MongoDB feature.

### SQL features

1. **Transactions**
   - Approving a claim must update the claim, update the item status, and insert a status-history record in one transaction.
   - Roll back all changes if any operation fails.

2. **Views**
   - Create a view for active reports that joins items with locations.

3. **Stored procedure or function**
   - Create a procedure to approve a claim and update the associated item.

4. **Triggers**
   - Automatically insert a record into `StatusHistory` whenever an item status changes.

5. **Indexes**
   - Add indexes for category, report type, status, location, claim status, and frequently searched fields.

6. **Constraints**
   - Use primary keys, foreign keys, unique constraints, not-null constraints, and check constraints.

### MongoDB feature

Use an aggregation pipeline to produce category, keyword, or attribute statistics.

## 11. Required SQL Operations

The project database scripts must demonstrate:

- `CREATE`
- `ALTER`
- `DROP`
- `INSERT`
- `UPDATE`
- `DELETE`
- `SELECT`
- `JOIN`
- `GROUP BY`
- `HAVING`
- `ORDER BY`
- Aggregate functions
- Subqueries
- Transactions

Use `DROP` only on a temporary table, test view, or test index if dropping production tables would be unsafe.

## 12. Reports for the Project Demo

Create an administrator reports page and prepare seeded data so the reports show meaningful results.

### 12.1 Reports by category

```sql
SELECT category, COUNT(*) AS total_reports
FROM Items
GROUP BY category
ORDER BY total_reports DESC;
```

### 12.2 Reports by location

```sql
SELECT l.building, l.area, COUNT(i.item_id) AS total_reports
FROM Items i
JOIN Locations l ON i.location_id = l.location_id
GROUP BY l.building, l.area
ORDER BY total_reports DESC;
```

### 12.3 Recovery rate by category

```sql
SELECT
    category,
    COUNT(*) AS total_items,
    SUM(status = 'RETURNED') AS returned_items,
    ROUND(100 * SUM(status = 'RETURNED') / COUNT(*), 2) AS recovery_rate
FROM Items
GROUP BY category
ORDER BY recovery_rate DESC;
```

### 12.4 Pending claims

```sql
SELECT
    c.claim_id,
    c.claim_description,
    i.title,
    u.name AS claimant
FROM Claims c
JOIN Items i ON c.item_id = i.item_id
JOIN Users u ON c.claimed_by = u.user_id
WHERE c.status = 'PENDING'
ORDER BY c.claim_id;
```

### 12.5 Claim approval rate by administrator

```sql
SELECT
    u.name AS administrator,
    COUNT(c.claim_id) AS reviewed_claims,
    SUM(c.status = 'APPROVED') AS approved_claims,
    ROUND(
        100 * SUM(c.status = 'APPROVED') / COUNT(c.claim_id),
        2
    ) AS approval_percentage
FROM Claims c
JOIN Users u ON c.reviewed_by = u.user_id
WHERE c.status IN ('APPROVED', 'REJECTED')
GROUP BY u.user_id, u.name;
```

### 12.6 Average return time

Create a report that calculates the average number of days between the original report date and the date the item became `RETURNED`.

### 12.7 MongoDB category aggregation

```javascript
db.item_details.aggregate([
  {
    $group: {
      _id: "$category_attributes.item_type",
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
]);
```

### 12.8 MongoDB keyword aggregation

```javascript
db.item_details.aggregate([
  { $unwind: "$keywords" },
  {
    $group: {
      _id: "$keywords",
      frequency: { $sum: 1 }
    }
  },
  { $sort: { frequency: -1 } },
  { $limit: 10 }
]);
```

## 13. Development Milestones

### Milestone 1: Design

- Finalize scope and terminology.
- Draw the ER diagram with six tables.
- Define the relational schema.
- Define MongoDB documents and indexes.
- Write the database justification.

### Milestone 2: Database implementation

- Create the MySQL database and tables.
- Add constraints and indexes.
- Add views, procedures, and triggers.
- Insert sample data.
- Create MongoDB collections and indexes.
- Insert flexible item-detail documents.
- Test SQL and MongoDB queries independently.

### Milestone 3: Backend integration

Create Next.js route handlers for:

- Authentication
- Item reports
- Search and filtering
- Match generation
- Claims
- Administrative verification
- Reports and analytics

Keep MySQL and MongoDB connection logic in separate server-side modules.

### Milestone 4: Frontend

Build:

- Login and registration pages.
- Student dashboard.
- Lost/found report form.
- Search and filter page.
- Match-results page.
- Claim form and claim-status page.
- Administrator dashboard.
- Reports and analytics page.

### Milestone 5: End-to-end testing

Test this complete workflow:

1. A student registers and logs in.
2. The student submits a lost-item report.
3. Another student submits a found-item report.
4. The system generates a possible match.
5. The owner views the match score and explanation.
6. The owner submits a claim.
7. An administrator approves the claim.
8. The transaction updates the claim and item status.
9. The trigger records the status change.
10. The reports dashboard reflects the updated data.

## 14. Team Work Distribution

### Member 1

- MySQL schema and ER diagram.
- Relational constraints and indexes.
- Views, stored procedures, and triggers.
- Authentication and role authorization.
- Administrator APIs and SQL reports.

### Member 2

- MongoDB schema and aggregation.
- Matching algorithm.
- Student interface.
- Search, filtering, and match display.
- MongoDB reports and test data.

Both members must contribute to database and application development. Git commits should clearly show individual contributions.

## 15. Review Demonstration Order

1. Explain the problem and motivation.
2. Explain the novelty: explainable matching and analytics.
3. Show the ER diagram with six MySQL tables.
4. Explain the MySQL and MongoDB division of data.
5. Show the MongoDB document model and indexes.
6. Demonstrate student and administrator login.
7. Create a lost report and a found report.
8. Show the generated match score and reasons.
9. Submit and approve a claim.
10. Show the transaction result and status-history record.
11. Demonstrate SQL reports.
12. Demonstrate MongoDB aggregation reports.
13. Show the Next.js interface and database integration.
14. Show the GitHub repository, README, and team contributions.

## 16. Completion Checklist

### Database design

- [ ] ER diagram contains at least six tables.
- [ ] Primary keys are identified.
- [ ] Foreign keys are identified.
- [ ] Relationships and cardinalities are shown.
- [ ] Constraints are documented.
- [ ] Relational schema is complete.
- [ ] MongoDB document model is documented.

### Database implementation

- [ ] MySQL tables are created.
- [ ] MongoDB collection is created.
- [ ] Sample data is available.
- [ ] SQL indexes are created.
- [ ] MongoDB indexes are created.
- [ ] A view is implemented.
- [ ] A stored procedure or function is implemented.
- [ ] A trigger is implemented.
- [ ] A transaction is implemented.
- [ ] SQL and MongoDB aggregation reports work.

### Application

- [ ] Student registration and login work.
- [ ] Administrator login works.
- [ ] Lost reports can be submitted.
- [ ] Found reports can be submitted.
- [ ] Reports can be searched and filtered.
- [ ] Match scores and reasons are displayed.
- [ ] Claims can be submitted.
- [ ] Claims can be approved or rejected.
- [ ] Item status changes are recorded.
- [ ] Reports dashboard is available.
- [ ] Credentials are stored in environment variables.

### Documentation and demo

- [ ] README contains setup instructions.
- [ ] Database choice is justified.
- [ ] Important queries are documented.
- [ ] System architecture is documented.
- [ ] Screenshots are collected.
- [ ] Test cases and results are documented.
- [ ] Team contributions are documented.
- [ ] Future enhancements are listed.

## 17. Minimum Version for the Upcoming Review

Complete these items first:

1. ER diagram with six MySQL tables.
2. Working MySQL schema with sample data.
3. Working MongoDB collection with flexible item details.
4. One end-to-end lost-item and found-item matching workflow.
5. Explainable match score displayed in the application.
6. At least four SQL reports.
7. At least two MongoDB aggregation reports.
8. Basic student/admin role separation.
9. Claim approval workflow.
10. A README explaining setup, database choices, schema, and demo steps.
