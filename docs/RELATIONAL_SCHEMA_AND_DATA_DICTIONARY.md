# Relational Schema and Data Dictionary

## Project

**Campus Lost & Found Intelligence System**

**RDBMS:** MySQL 8.x  
**Database:** `campus_lnf`

## 1. Relational Schema

### Users

`Users(`  
`user_id PK,`  
`name, email UNIQUE, password_hash, role, created_at`  
` )`

### Locations

`Locations(`  
`location_id PK,`  
`building, area, description`  
` )`

### Items

`Items(`  
`item_id PK,`  
`reported_by FK -> Users.user_id,`  
`location_id FK -> Locations.location_id,`  
`report_type, category, title, reported_date, status, created_at, is_verified`  
` )`

### Claims

`Claims(`  
`claim_id PK,`  
`item_id FK -> Items.item_id,`  
`claimed_by FK -> Users.user_id,`  
`claim_description, status,`  
`reviewed_by FK -> Users.user_id,`  
`reviewed_at, created_at`  
` )`

### StatusHistory

`StatusHistory(`  
`history_id PK,`  
`item_id FK -> Items.item_id,`  
`old_status, new_status,`  
`changed_by FK -> Users.user_id,`  
`changed_at`  
` )`

### Matches

`Matches(`  
`match_id PK,`  
`lost_item_id FK -> Items.item_id,`  
`found_item_id FK -> Items.item_id,`  
`match_score, match_reason, match_status, created_at`  
` )`

## 2. Table Overview

| Table | Purpose |
|---|---|
| `Users` | Stores student and administrator accounts and roles. |
| `Locations` | Stores campus buildings and areas where items are lost or found. |
| `Items` | Stores the structured part of lost and found reports. |
| `Claims` | Stores ownership claims submitted for found items. |
| `StatusHistory` | Maintains an audit trail of item status changes. |
| `Matches` | Stores ranked possible matches between lost and found items. |

## 3. Data Dictionary

### 3.1 Users

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `user_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique account identifier. |
| `name` | `VARCHAR(120)` | No | - | Full name of the user. |
| `email` | `VARCHAR(255)` | No | Unique | Login email address. |
| `password_hash` | `VARCHAR(255)` | No | - | Bcrypt password hash; plaintext passwords are not stored. |
| `role` | `ENUM('STUDENT','ADMIN')` | No | Default `STUDENT` | Authorization role. |
| `created_at` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Account creation time. |

### 3.2 Locations

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `location_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique campus location identifier. |
| `building` | `VARCHAR(120)` | No | - | Campus building name. |
| `area` | `VARCHAR(120)` | No | - | Specific area within the building. |
| `description` | `TEXT` | Yes | - | Additional location details. |

### 3.3 Items

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `item_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique item report identifier. |
| `reported_by` | `INT` | No | FK to `Users.user_id` | User who submitted the report. |
| `location_id` | `INT` | No | FK to `Locations.location_id` | Location associated with the report. |
| `report_type` | `ENUM('LOST','FOUND')` | No | - | Whether the item was lost or found. |
| `category` | `VARCHAR(80)` | No | Indexed | Item category, such as Bag or Electronics. |
| `title` | `VARCHAR(255)` | No | - | Short report title. |
| `reported_date` | `DATE` | No | Indexed | Date the item was lost or found. |
| `status` | `ENUM('REPORTED','MATCHED','CLAIMED','VERIFIED','RETURNED','CLOSED')` | No | Default `REPORTED`, indexed | Current workflow status. |
| `created_at` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Time the report was created. |
| `is_verified` | `TINYINT(1)` | No | Default `0` | Administrator verification flag, added using `ALTER TABLE`. |

### 3.4 Claims

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `claim_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique claim identifier. |
| `item_id` | `INT` | No | FK to `Items.item_id`, indexed | Found item being claimed. |
| `claimed_by` | `INT` | No | FK to `Users.user_id` | User submitting the claim. |
| `claim_description` | `TEXT` | No | - | Evidence or explanation submitted by the claimant. |
| `status` | `ENUM('PENDING','APPROVED','REJECTED')` | No | Default `PENDING`, indexed | Claim review status. |
| `reviewed_by` | `INT` | Yes | FK to `Users.user_id` | Administrator who reviewed the claim. |
| `reviewed_at` | `DATETIME` | Yes | - | Time of review. |
| `created_at` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Claim submission time. |

Additional constraint: `UNIQUE(item_id, claimed_by)` prevents the same user from submitting duplicate claims for the same item.

### 3.5 StatusHistory

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `history_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique status-history record. |
| `item_id` | `INT` | No | FK to `Items.item_id`, indexed | Item whose status changed. |
| `old_status` | `VARCHAR(20)` | Yes | - | Status before the change. |
| `new_status` | `VARCHAR(20)` | No | - | Status after the change. |
| `changed_by` | `INT` | No | FK to `Users.user_id` | User recorded as responsible for the change. |
| `changed_at` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Time of the status change. |

The `trg_item_status_history` trigger inserts a row when an item's status changes.

### 3.6 Matches

| Column | MySQL type | Null | Key / constraint | Description |
|---|---|---:|---|---|
| `match_id` | `INT AUTO_INCREMENT` | No | Primary key | Unique possible-match identifier. |
| `lost_item_id` | `INT` | No | FK to `Items.item_id`, indexed | Lost report in the match pair. |
| `found_item_id` | `INT` | No | FK to `Items.item_id`, indexed | Found report in the match pair. |
| `match_score` | `TINYINT UNSIGNED` | No | Indexed | Explainable score from 0 to 100. |
| `match_reason` | `TEXT` | No | - | Human-readable explanation of the score. |
| `match_status` | `ENUM('PENDING','CONFIRMED','DISMISSED')` | No | Default `PENDING` | Administrative or user decision on the match. |
| `created_at` | `DATETIME` | No | Default `CURRENT_TIMESTAMP` | Time the match was stored. |

Additional constraints:

- `UNIQUE(lost_item_id, found_item_id)` prevents duplicate pairs.
- `CHECK(lost_item_id <> found_item_id)` prevents an item from matching itself.

## 4. Relationships and Cardinalities

| Relationship | Cardinality | Foreign key |
|---|---|---|
| `Users` to `Items` | One-to-many | `Items.reported_by` |
| `Locations` to `Items` | One-to-many | `Items.location_id` |
| `Users` to `Claims` as claimant | One-to-many | `Claims.claimed_by` |
| `Users` to `Claims` as reviewer | One-to-many, optional for each claim | `Claims.reviewed_by` |
| `Items` to `Claims` | One-to-many | `Claims.item_id` |
| `Items` to `StatusHistory` | One-to-many | `StatusHistory.item_id` |
| `Users` to `StatusHistory` | One-to-many | `StatusHistory.changed_by` |
| `Items` to `Matches` as lost item | One-to-many | `Matches.lost_item_id` |
| `Items` to `Matches` as found item | One-to-many | `Matches.found_item_id` |

## 5. Indexes

| Index | Table and column | Purpose |
|---|---|---|
| `uq_users_email` | `Users(email)` | Prevent duplicate accounts and speed up login lookup. |
| `idx_items_category` | `Items(category)` | Speed up category filtering. |
| `idx_items_report_type` | `Items(report_type)` | Speed up lost/found filtering. |
| `idx_items_status` | `Items(status)` | Speed up active/status filtering. |
| `idx_items_location` | `Items(location_id)` | Speed up location filtering and joins. |
| `idx_items_reported_by` | `Items(reported_by)` | Speed up user report lookup. |
| `idx_items_date` | `Items(reported_date)` | Speed up date-based searches. |
| `idx_claims_status` | `Claims(status)` | Speed up pending-claim queries. |
| `idx_claims_item` | `Claims(item_id)` | Speed up item claim lookup. |
| `idx_history_item` | `StatusHistory(item_id)` | Speed up item audit-history lookup. |
| `idx_matches_lost` | `Matches(lost_item_id)` | Speed up matches for lost reports. |
| `idx_matches_found` | `Matches(found_item_id)` | Speed up matches for found reports. |
| `idx_matches_score` | `Matches(match_score)` | Speed up ranked/high-confidence match queries. |

## 6. Database Objects Supporting the Application

### Views

- `active_reports`: joins items, users, and locations for reports that are not returned or closed.
- `pending_claims_view`: joins pending claims with item and claimant details.

### Stored procedures

- `approve_claim(claim_id, admin_id, status)`: updates a claim and, when approved, changes the related item status to `CLAIMED` inside a transaction.
- `mark_item_returned(item_id, admin_id)`: changes an item status to `RETURNED` inside a transaction.

### Trigger

- `trg_item_status_history`: inserts a `StatusHistory` record after an item status changes.

### Transactional workflow

Claim approval is treated as an atomic operation. The claim decision and related item-status update are committed together, or rolled back together if an SQL exception occurs.

## 7. MongoDB Boundary

MySQL stores the structured records and relationships above. MongoDB stores flexible details in the `item_details` collection, including:

- Free-text descriptions
- Colors and brands
- Identifying marks
- Category-specific attributes
- Search keywords
- Normalized text metadata
- Optional image URLs

The shared key between the databases is `item_id`. The matching service combines MySQL report data with MongoDB item details to calculate and explain match scores.
