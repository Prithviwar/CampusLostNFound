# DBMS Project Report

## 1. Project Title

# Campus Lost & Found Intelligence System

A centralized campus platform for reporting lost and found items, identifying explainable possible matches, managing claims, and supporting administrator-controlled item recovery.

## 2. Student SRNs and Names

| SRN | Name | Primary responsibilities |
|---|---|---|
| PES1UG24AM205 | Prithvi | MySQL schema, constraints, views, triggers, stored procedures, authentication, admin APIs, and SQL reports |
| PES1UG24AM220 | Ramneek | MongoDB document design, aggregation pipelines, matching algorithm, student interface, and search/filtering |

Both members contributed to database and application development.

## 3. Abstract

Campus lost-and-found information is often distributed through notices, messaging groups, and word of mouth. This makes it difficult for students to discover possible matches and difficult for administrators to verify claims consistently.

The Campus Lost & Found Intelligence System provides a centralized Next.js web application for reporting, searching, matching, claiming, verifying, and returning campus items. MySQL stores structured transactional data such as users, locations, reports, claims, matches, and status history. MongoDB stores flexible item descriptions and category-specific attributes that differ between item types.

The system includes an explainable rule-based matching component. It compares category, location, date, brand, color, and keywords to generate a score from 0 to 100 and provides the reasons behind the score. The project also demonstrates SQL constraints, indexes, views, transactions, stored procedures, triggers, joins, grouping, aggregate queries, subqueries, and MongoDB aggregation.

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.4.3 App Router, React, TypeScript |
| Backend/API | Next.js Route Handlers |
| RDBMS | MySQL 8.x |
| NoSQL database | MongoDB |
| Authentication | bcryptjs password hashing and JWT httpOnly cookies |
| MySQL driver | `mysql2` |
| MongoDB driver | `mongodb` |
| Version control | Git and GitHub |
| Configuration | Environment variables in `.env.local` |

### Database choice

MySQL is used for structured records that require relational integrity and atomic updates. MongoDB is used for flexible item details because different categories require different attributes. The shared `item_id` connects the structured MySQL report with its MongoDB detail document.

## 5. SQL - Database Commands

### 5.1 Database and table creation

The complete implementation is in [01_schema.sql](../database/mysql/01_schema.sql).

```sql
DROP DATABASE IF EXISTS campus_lnf;
CREATE DATABASE campus_lnf
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_lnf;
```

The relational schema contains six tables:

- `Users`
- `Locations`
- `Items`
- `Claims`
- `StatusHistory`
- `Matches`

### 5.2 Primary and foreign keys

```sql
CREATE TABLE Items (
    item_id INT NOT NULL AUTO_INCREMENT,
    reported_by INT NOT NULL,
    location_id INT NOT NULL,
    report_type ENUM('LOST','FOUND') NOT NULL,
    category VARCHAR(80) NOT NULL,
    title VARCHAR(255) NOT NULL,
    reported_date DATE NOT NULL,
    status ENUM('REPORTED','MATCHED','CLAIMED','VERIFIED','RETURNED','CLOSED')
        NOT NULL DEFAULT 'REPORTED',
    PRIMARY KEY (item_id),
    FOREIGN KEY (reported_by) REFERENCES Users(user_id),
    FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);
```

### 5.3 Constraints and indexes

Implemented constraints include:

- Primary keys on all six tables.
- Foreign keys between users, locations, items, claims, status history, and matches.
- Unique user email.
- Unique `(item_id, claimed_by)` claim pair.
- Enum values for roles, report types, statuses, and match states.
- Check constraint preventing an item from matching itself.
- Not-null constraints for required values.

Example indexes:

```sql
CREATE INDEX idx_items_category ON Items(category);
CREATE INDEX idx_items_status ON Items(status);
CREATE INDEX idx_items_location ON Items(location_id);
CREATE INDEX idx_claims_status ON Claims(status);
CREATE INDEX idx_matches_score ON Matches(match_score);
```

### 5.4 ALTER and DROP

`03_seed_data.sql` demonstrates `ALTER TABLE`:

```sql
ALTER TABLE Items
  ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0;
```

`02_views_procedures_triggers.sql` demonstrates `DROP` safely using a temporary report table:

```sql
DROP TEMPORARY TABLE IF EXISTS tmp_report_summary;
```

### 5.5 DML operations

The project demonstrates `INSERT`, `UPDATE`, `DELETE`, and `SELECT` through seed data, APIs, procedures, and report queries.

Example report query:

```sql
SELECT category, COUNT(*) AS total_reports
FROM Items
GROUP BY category
ORDER BY total_reports DESC;
```

Example join:

```sql
SELECT l.building, l.area, COUNT(i.item_id) AS total_reports
FROM Items i
JOIN Locations l ON i.location_id = l.location_id
GROUP BY l.building, l.area
ORDER BY total_reports DESC;
```

Example aggregate and conditional calculation:

```sql
SELECT
    category,
    COUNT(*) AS total_items,
    SUM(status = 'RETURNED') AS returned_items,
    ROUND(100.0 * SUM(status = 'RETURNED') / COUNT(*), 2) AS recovery_rate
FROM Items
GROUP BY category
ORDER BY recovery_rate DESC;
```

Example subquery:

```sql
SELECT name, email
FROM Users
WHERE user_id IN (
    SELECT reported_by
    FROM Items
    GROUP BY reported_by
    HAVING COUNT(*) > 1
);
```

### 5.6 Views

The project implements:

- `active_reports`: joins items, users, and locations for reports that are not returned or closed.
- `pending_claims_view`: shows pending claims with item and claimant information.

### 5.7 Stored procedures and transactions

`approve_claim` performs claim approval inside a transaction:

1. Fetch the claim's item.
2. Fetch the current item status.
3. Update the claim status and reviewer details.
4. Change the item status to `CLAIMED` when approved.
5. Commit all operations together.
6. Roll back when an SQL exception occurs.

`mark_item_returned` changes the item status to `RETURNED` inside a transaction.

### 5.8 Trigger

`trg_item_status_history` runs after an item status changes and inserts an audit record into `StatusHistory`.

This ensures the current status is stored in `Items` while previous transitions remain available for auditing.

## 6. NoSQL Database Commands

The MongoDB implementation is in [seed.js](../database/mongodb/seed.js).

### 6.1 Collection and document model

Collection: `item_details`

```javascript
{
  item_id: 1,
  description: "Black laptop bag with a small PES University sticker",
  visual_attributes: {
    color: "black",
    brand: "Wildcraft",
    identifying_marks: ["PES sticker", "small tear on zipper"]
  },
  category_attributes: {
    item_type: "laptop bag",
    size: "medium",
    compartment_count: 3
  },
  keywords: ["black", "laptop", "bag", "PES", "wildcraft"],
  search_metadata: {
    normalized_text: "black laptop bag pes sticker wildcraft"
  }
}
```

### 6.2 MongoDB indexes

```javascript
await col.createIndex({ item_id: 1 }, { unique: true });
await col.createIndex({ keywords: 1 });
await col.createIndex({ 'visual_attributes.color': 1 });
await col.createIndex({ 'visual_attributes.brand': 1 });
await col.createIndex({ 'category_attributes.item_type': 1 });
await col.createIndex(
  { 'search_metadata.normalized_text': 'text' },
  { name: 'idx_fulltext_search' }
);
```

### 6.3 MongoDB aggregation: item types

```javascript
db.item_details.aggregate([
  {
    $group: {
      _id: '$category_attributes.item_type',
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
]);
```

### 6.4 MongoDB aggregation: top keywords

```javascript
db.item_details.aggregate([
  { $unwind: '$keywords' },
  {
    $group: {
      _id: '$keywords',
      frequency: { $sum: 1 }
    }
  },
  { $sort: { frequency: -1 } },
  { $limit: 10 }
]);
```

### 6.5 Why MongoDB is appropriate

MongoDB allows each item category to have different fields without adding many nullable columns to MySQL. The application still keeps report identity, ownership, claims, and status relationships in MySQL.

## 7. Next.js - Project Tree Structure

```text
campus-lnf/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/              # Login API
│   │   │   ├── auth/register/           # Registration API
│   │   │   ├── auth/logout/             # Logout API
│   │   │   ├── items/                   # Browse, create, and match items
│   │   │   ├── items/[id]/              # Item details, matches, history
│   │   │   ├── claims/                  # Personal/all claims and submission
│   │   │   ├── claims/[id]/             # Admin claim approval/rejection
│   │   │   ├── locations/               # Campus location list
│   │   │   ├── admin/items/[id]/status/ # Admin status update
│   │   │   └── admin/reports/           # SQL and MongoDB reports
│   │   ├── admin/                       # Administrator dashboard
│   │   ├── items/                       # Browse and item details
│   │   ├── report/                      # Lost/found report form
│   │   ├── claims/                      # Current user's claims
│   │   ├── login/                       # Login page
│   │   └── register/                    # Registration page
│   ├── components/Navbar.tsx            # Navigation and role links
│   └── lib/
│       ├── mysql.ts                     # MySQL connection pool
│       ├── mongodb.ts                   # MongoDB connection singleton
│       ├── auth.ts                      # JWT signing and verification
│       └── matching.ts                  # Explainable matching engine
├── package.json
├── next.config.ts
└── .env.local                           # Local secrets, not committed
```

## 8. Sample Screenshots of Application Code and Demo

The screenshots are stored in the repository's `screenshots/` folder.

### Application screens

| Screenshot | Description |
|---|---|
| [homepage.png](../screenshots/homepage.png) | Landing page and project overview |
| [login.png](../screenshots/login.png) | Login form and demo credentials |
| [register.png](../screenshots/register.png) | Student registration form |
| [browse.png](../screenshots/browse.png) | Browse reports with filters |
| [report(1).png](../screenshots/report%281%29.png) | Report form, basic information |
| [report(2).png](../screenshots/report%282%29.png) | Report form, flexible item details |
| [lostrep.png](../screenshots/lostrep.png) | Lost item report |
| [foundrep.png](../screenshots/foundrep.png) | Found item report |
| [myclaims.png](../screenshots/myclaims.png) | Current user's claims |

### Administrator screens

| Screenshot | Description |
|---|---|
| [admin(1).png](../screenshots/admin%281%29.png) | Administrator dashboard overview |
| [admin(2).png](../screenshots/admin%282%29.png) | SQL and MongoDB reports |
| [admin(3).png](../screenshots/admin%283%29.png) | Administrative item management |
| [adminclaims.png](../screenshots/adminclaims.png) | All claims for administrator review |
| [adminpendingclaim.png](../screenshots/adminpendingclaim.png) | Pending claim review |

## 9. Evaluation Rubrics - Completion Status

| Requirement | Status | Evidence |
|---|---|---|
| Meaningful, non-CRUD project | Completed | Explainable lost/found matching and controlled claim workflow |
| Minimum five relational tables | Completed | Six MySQL tables: Users, Locations, Items, Claims, StatusHistory, Matches |
| SQL + NoSQL database | Completed | MySQL structured data and MongoDB flexible item details |
| ER diagram and relational schema | Completed | ER diagram and [data dictionary](RELATIONAL_SCHEMA_AND_DATA_DICTIONARY.md) |
| SQL DDL commands | Completed | `CREATE`, `ALTER`, `DROP`, keys, constraints, indexes, and views |
| SQL DML and complex queries | Completed | Inserts, updates, selects, joins, grouping, aggregates, ordering, and subqueries |
| Four advanced SQL concepts | Completed | Transactions, views, stored procedures, triggers, and indexing |
| One NoSQL feature | Completed | MongoDB indexes and aggregation pipelines |
| Next.js web interface | Completed | Forms, search, filters, dashboards, claims, and report tables |
| Database/API integration | Completed | Next.js Route Handlers use MySQL and MongoDB drivers |
| Authentication and two roles | Completed | bcrypt hashes, JWT cookies, STUDENT and ADMIN authorization |
| Data integrity | Completed | PKs, FKs, enums, unique constraints, checks, and status history |
| Security practices | Mostly completed | Hashed passwords, environment variables, parameterized SQL; fallback secrets should be removed for production |
| Documentation | Completed | README, ER diagram, schema dictionary, implementation plan, screenshots, and testing results |
| Testing | Completed with limitation | Manual/API/browser results are documented; automated unit tests are not included |
| Git/GitHub | Completed | Final project commits are pushed to GitHub |

## Supporting documents

- [Relational schema and data dictionary](RELATIONAL_SCHEMA_AND_DATA_DICTIONARY.md)
- [Testing results](TESTING_RESULTS.md)
- [Review preparation guide](REVIEW_PREPARATION_GUIDE.md)
- [ER diagram](Campus%20Lost%20and%20Found%20-%20ER%20Diagram.png)
