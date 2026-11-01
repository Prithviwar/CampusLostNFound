# Campus Lost & Found Intelligence System

A full-stack Next.js application for managing campus lost-and-found items. It uses **MySQL** for structured relational data and **MongoDB** for flexible item details, and features an **explainable intelligent matching system** that scores possible item matches and explains every factor.

---

## Team Members

| Member | Responsibilities |
|--------|-----------------|
| Member 1 | MySQL schema, constraints, views, triggers, stored procedures, authentication, admin APIs |
| Member 2 | MongoDB schema, aggregation pipelines, matching algorithm, student interface, search & filtering |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend & Backend | Next.js 15 (App Router, TypeScript) |
| RDBMS | MySQL 8.x |
| NoSQL | MongoDB 7.x |
| Auth | bcryptjs + JWT (httpOnly cookie) |
| ORM/Driver | mysql2, mongodb |

---

## Database Architecture

### Why MySQL?

MySQL stores all **structured, relational data** where referential integrity and transactions are essential:

- Users, roles, and authentication
- Item reports with foreign-key references to users and locations
- Claims referencing items and users
- Status-history audit trail
- Match records linking two item IDs

### Why MongoDB?

MongoDB stores **flexible, schema-less item details** where different categories have different attributes:

- A laptop has `model`, `screen_size`
- A water bottle has `capacity`
- A wallet has `material`

Rather than adding 30+ nullable columns to MySQL, each item's details are stored as a document in the `item_details` collection.

---

## MySQL Schema (6 Tables)

```
Users (user_id PK, name, email UNIQUE, password_hash, role, created_at)
  │
  ├─ Items (item_id PK, reported_by FK→Users, location_id FK→Locations,
  │         report_type, category, title, reported_date, status, created_at)
  │    │
  │    ├─ Claims (claim_id PK, item_id FK→Items, claimed_by FK→Users,
  │    │          claim_description, status, reviewed_by FK→Users, reviewed_at, created_at)
  │    │
  │    ├─ StatusHistory (history_id PK, item_id FK→Items, old_status,
  │    │                 new_status, changed_by FK→Users, changed_at)
  │    │
  │    └─ Matches (match_id PK, lost_item_id FK→Items, found_item_id FK→Items,
  │                match_score, match_reason, match_status, created_at)
  │
Locations (location_id PK, building, area, description)
```

### Advanced SQL Features Implemented

| Feature | Description |
|---------|-------------|
| **Transactions** | `approve_claim` stored procedure wraps claim update + item status update in one atomic transaction |
| **View** | `active_reports` joins Items + Users + Locations for all open reports; `pending_claims_view` summarises pending claims |
| **Stored Procedure** | `approve_claim(claim_id, admin_id, status)` and `mark_item_returned(item_id, admin_id)` |
| **Trigger** | `trg_item_status_history` — fires `AFTER UPDATE` on Items when status changes, inserts into StatusHistory automatically |
| **Indexes** | On `category`, `report_type`, `status`, `location_id`, `reported_by`, `reported_date`, `claim status`, match scores |
| **Constraints** | PKs, FKs, `UNIQUE(email)`, `UNIQUE(item_id, claimed_by)`, `CHECK(lost_item_id <> found_item_id)`, ENUMs |
| **ALTER TABLE** | Adds `is_verified` column after initial table creation |
| **DROP** | Drops a temporary table used for demo reporting |

### SQL Operations Demonstrated

`CREATE` · `ALTER` · `DROP (temp table)` · `INSERT` · `UPDATE` · `DELETE` · `SELECT` · `JOIN` · `GROUP BY` · `HAVING` · `ORDER BY` · `COUNT/SUM/ROUND` · `Subqueries` · `Transactions`

---

## MongoDB Schema

### Collection: `item_details`

```json
{
  "item_id": 1,
  "description": "Black laptop bag with a small PES University sticker",
  "visual_attributes": {
    "color": "black",
    "brand": "Wildcraft",
    "identifying_marks": ["PES sticker", "small tear on zipper"]
  },
  "category_attributes": {
    "item_type": "laptop bag",
    "size": "medium",
    "compartment_count": 3
  },
  "keywords": ["black", "laptop", "bag", "PES", "wildcraft"],
  "image_url": null,
  "search_metadata": {
    "normalized_text": "black laptop bag pes sticker wildcraft"
  },
  "updated_at": "2026-10-22T08:00:00Z"
}
```

### Indexes

- `{ item_id: 1 }` — unique
- `{ keywords: 1 }`
- `{ "visual_attributes.color": 1 }`
- `{ "visual_attributes.brand": 1 }`
- `{ "category_attributes.item_type": 1 }`
- Full-text on `search_metadata.normalized_text`

### Aggregation Pipelines

1. **Items by type** — `$group` on `category_attributes.item_type`
2. **Top keywords** — `$unwind` keywords array + `$group` + `$sort` + `$limit 10`
3. **Color distribution** — `$group` on `visual_attributes.color`

---

## Matching Algorithm

Rule-based scoring from 0–100:

| Factor | Points |
|--------|--------|
| Same category | 25 |
| Same location | 20 |
| Same brand | 15 |
| Reported within 3 days | 15 |
| Same color | 10 |
| Common keywords (5 pts each, max 15) | 15 |
| **Max total** | **100** |

Matches with score ≥ 50 are saved to MySQL `Matches` table and displayed with human-readable explanations.

**Example output:**
> Match score: 85%
> ✓ Same category "Bag" (+25 pts) | ✓ Same campus location (+20 pts) | ✓ Same color "black" (+10 pts) | ✓ Reported within 1 day of each other (+15 pts) | ✓ 3 common keywords: black, laptop, bag (+15 pts)

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MySQL 8.x running on port 3306
- MongoDB 7.x running on port 27017

---

### Step 1 — Configure environment variables

Edit [`campus-lnf/.env.local`](campus-lnf/.env.local) and set your actual MySQL password:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD_HERE   # <-- change this
MYSQL_DATABASE=campus_lnf

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=campus_lnf

JWT_SECRET=campus_lnf_jwt_secret_change_in_production
```

---

### Step 2 — Install Node dependencies

```powershell
cd campus-lnf
npm install
cd ..
```

---

### Step 3 — Set up the databases

**Option A — One-shot script (recommended)**

Run this from the project root (`Mini_Project/`). Replace `YourPassword` with your MySQL root password:

```powershell
.\setup.ps1 -Password "YourPassword"
```

If your MySQL executable is not at the default path, pass it explicitly:

```powershell
.\setup.ps1 -MySQLExe "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -Password "YourPassword"
```

**Option B — Run each command manually** (PowerShell from project root):

```powershell
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# MySQL — create schema (tables, constraints, indexes)
Get-Content "database\mysql\01_schema.sql" | & $mysql -u root -pYourPassword

# MySQL — create views, stored procedures, trigger
Get-Content "database\mysql\02_views_procedures_triggers.sql" | & $mysql -u root -pYourPassword

# MySQL — insert sample data
Get-Content "database\mysql\03_seed_data.sql" | & $mysql -u root -pYourPassword

# MongoDB — seed item_details collection and create indexes
cd campus-lnf
node ..\database\mongodb\seed.js
cd ..
```

> **Note:** On Windows, the `<` input-redirection operator does not work in PowerShell.  
> Always use `Get-Content "file.sql" | & $mysql ...` instead.

---

### Step 4 — Start the application

```powershell
cd campus-lnf
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Demo Accounts

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@campus.edu | Password@123 |
| Student | priya@campus.edu | Password@123 |
| Student | rohan@campus.edu | Password@123 |

---

## Demo Steps (Review Order)

1. Open the app and explain the problem and novelty
2. Show the ER diagram (6 MySQL tables) and MongoDB document model
3. Log in as **admin@campus.edu** → view the Admin Dashboard → Reports tab
4. Show SQL reports: category breakdown, location hotspots, recovery rates
5. Show MongoDB aggregations: item types, top keywords, color distribution
6. Log in as **priya@campus.edu** → submit a LOST report for a bag
7. Log in as **rohan@campus.edu** → submit a FOUND report for a similar bag
8. Show the match score (≥50%) and the reasons panel on the item detail page
9. Submit a claim from priya's account
10. Log in as admin → Claims tab → Approve the claim (triggers the stored procedure and transaction)
11. Show the status-history trail on the item detail page (trigger auto-inserted a record)
12. Show the GitHub repository and team commits

---

## Project Structure

```
campus-lnf/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/     # POST – login
│   │   │   ├── auth/register/  # POST – register
│   │   │   ├── auth/logout/    # POST – logout
│   │   │   ├── items/          # GET list, POST create + match
│   │   │   ├── items/[id]/     # GET single item + matches + history
│   │   │   ├── claims/         # GET, POST
│   │   │   ├── claims/[id]/    # PATCH approve/reject
│   │   │   ├── locations/      # GET all campus locations
│   │   │   ├── admin/items/[id]/status/  # PATCH
│   │   │   └── admin/reports/  # GET all SQL + MongoDB reports
│   │   ├── admin/              # Admin dashboard page
│   │   ├── items/              # Browse + detail pages
│   │   ├── report/             # Report form page
│   │   ├── claims/             # My claims page
│   │   ├── login/              # Login page
│   │   └── register/           # Register page
│   ├── components/
│   │   └── Navbar.tsx
│   └── lib/
│       ├── mysql.ts            # MySQL connection pool
│       ├── mongodb.ts          # MongoDB connection singleton
│       ├── auth.ts             # JWT sign/verify
│       └── matching.ts         # Matching engine
database/
├── mysql/
│   ├── 01_schema.sql           # Tables, constraints, indexes
│   ├── 02_views_procedures_triggers.sql
│   └── 03_seed_data.sql        # Sample data + demo queries
└── mongodb/
    └── seed.js                 # Item details + index creation + aggregation demo
```

---

## Future Enhancements

- Image upload for lost/found items
- Email/SMS notifications on match
- Machine learning model for better matching (TF-IDF on descriptions)
- QR code labels for recovered items
- Admin analytics export to CSV
- Mobile app
