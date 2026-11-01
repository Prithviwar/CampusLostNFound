-- ============================================================
-- Campus Lost & Found Intelligence System
-- MySQL Schema - File 03: Sample / Seed Data
-- ============================================================

USE campus_lnf;

-- ============================================================
-- Users (passwords are bcrypt hashes of "Password@123")
-- ============================================================
INSERT INTO Users (name, email, password_hash, role) VALUES
('Admin User',    'admin@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'ADMIN'),
('Priya Sharma',  'priya@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Rohan Mehta',   'rohan@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Aisha Khan',    'aisha@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Dev Patel',     'dev@campus.edu',     '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Sara Thomas',   'sara@campus.edu',    '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Vijay Nair',    'vijay@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Meera Reddy',   'meera@campus.edu',   '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'STUDENT'),
('Admin Two',     'admin2@campus.edu',  '$2b$10$U4nrrWPlWrVI75Xsqm3H8uAekZuEoJt4mSWQUywSz6gVF.l0I9joi', 'ADMIN');

-- ============================================================
-- Locations
-- ============================================================
INSERT INTO Locations (building, area, description) VALUES
('Main Block',     'Cafeteria',        'Ground-floor cafeteria near the main entrance'),
('Main Block',     'Library',          'Central library, second floor'),
('CS Block',       'Lab 301',          'Computer Science lab, third floor'),
('CS Block',       'Seminar Hall',     'Seminar hall adjacent to the CS labs'),
('Sports Complex', 'Basketball Court', 'Outdoor basketball courts'),
('Hostel A',       'Common Room',      'Common room on the ground floor of Hostel A'),
('Admin Block',    'Exam Cell',        'Examination cell on the first floor'),
('CS Block',       'Corridor 2F',      'Second-floor corridor outside Lab 201'),
('Main Block',     'Auditorium',       'Main campus auditorium'),
('Parking Lot',    'Entrance Gate',    'Vehicle parking area near the main gate');

-- ============================================================
-- Items (mix of LOST and FOUND, various statuses)
-- ============================================================
INSERT INTO Items (reported_by, location_id, report_type, category, title, reported_date, status) VALUES
-- recent active items
(2, 1,  'LOST',  'Bag',        'Black laptop bag with PES sticker',     '2026-10-22', 'REPORTED'),
(3, 2,  'FOUND', 'Bag',        'Found black bag near library entrance',  '2026-10-23', 'REPORTED'),
(4, 3,  'LOST',  'Electronics','Silver Dell laptop',                    '2026-10-20', 'MATCHED'),
(5, 3,  'FOUND', 'Electronics','Found laptop in Lab 301',               '2026-10-21', 'MATCHED'),
(6, 4,  'LOST',  'ID Card',    'PES University ID card',                '2026-10-18', 'CLAIMED'),
(7, 1,  'FOUND', 'ID Card',    'Found student ID card in cafeteria',    '2026-10-19', 'CLAIMED'),
(8, 5,  'LOST',  'Sports',     'Blue water bottle with name sticker',   '2026-10-15', 'RETURNED'),
(2, 5,  'FOUND', 'Sports',     'Found blue bottle at basketball court', '2026-10-15', 'RETURNED'),
(3, 6,  'LOST',  'Wallet',     'Brown leather wallet',                  '2026-10-10', 'RETURNED'),
(4, 6,  'FOUND', 'Wallet',     'Thin brown wallet found in hostel',     '2026-10-11', 'RETURNED'),
-- older items
(5, 7,  'LOST',  'ID Card',    'Library card lost near exam cell',      '2026-09-28', 'CLOSED'),
(6, 8,  'FOUND', 'Electronics','Earphones found in corridor',           '2026-09-30', 'REPORTED'),
(7, 9,  'LOST',  'Electronics','AirPods lost at auditorium',            '2026-10-01', 'REPORTED'),
(8, 10, 'FOUND', 'Keys',       'Car keys found at parking lot',         '2026-10-05', 'REPORTED'),
(2, 2,  'LOST',  'Keys',       'Bunch of keys with red keychain',       '2026-10-06', 'REPORTED'),
(3, 3,  'LOST',  'Bag',        'Blue college backpack with stickers',   '2026-10-08', 'REPORTED'),
(4, 4,  'FOUND', 'Bag',        'Found blue backpack in seminar hall',   '2026-10-08', 'REPORTED'),
(5, 1,  'LOST',  'Electronics','Samsung Galaxy phone, cracked screen',  '2026-10-12', 'REPORTED'),
(6, 1,  'FOUND', 'Electronics','Found Android phone in cafeteria',      '2026-10-12', 'REPORTED'),
(7, 2,  'LOST',  'Wallet',     'Black wallet with bank cards',          '2026-10-16', 'REPORTED');

-- ============================================================
-- Claims
-- ============================================================
INSERT INTO Claims (item_id, claimed_by, claim_description, status, reviewed_by, reviewed_at) VALUES
(5,  4, 'This is my ID card. My roll number is 1PE22CS045.',  'APPROVED', 1,  '2026-10-20 10:00:00'),
(8,  8, 'My water bottle has my name written under the cap.', 'APPROVED', 1,  '2026-10-17 14:30:00'),
(9,  3, 'Brown wallet with SBI debit card and Rs 250 cash.',  'APPROVED', 9,  '2026-10-12 09:15:00'),
(3,  4, 'I believe this is my laptop. Serial: DL5P123.',      'PENDING',  NULL, NULL),
(13, 7, 'My AirPods are white, model 2nd gen.',               'REJECTED', 9,  '2026-10-05 16:00:00');

-- ============================================================
-- StatusHistory (manual entries for items whose trigger
-- was not active during bulk insert)
-- ============================================================
INSERT INTO StatusHistory (item_id, old_status, new_status, changed_by, changed_at) VALUES
(3,  'REPORTED', 'MATCHED',  1, '2026-10-22 08:00:00'),
(4,  'REPORTED', 'MATCHED',  1, '2026-10-22 08:00:00'),
(5,  'REPORTED', 'CLAIMED',  4, '2026-10-20 10:05:00'),
(6,  'REPORTED', 'CLAIMED',  4, '2026-10-20 10:05:00'),
(7,  'REPORTED', 'RETURNED', 1, '2026-10-17 14:35:00'),
(8,  'RETURNED', 'RETURNED', 1, '2026-10-17 14:36:00'),
(9,  'REPORTED', 'RETURNED', 9, '2026-10-12 09:20:00'),
(10, 'REPORTED', 'RETURNED', 9, '2026-10-12 09:21:00'),
(11, 'REPORTED', 'CLOSED',   1, '2026-10-01 12:00:00');

-- ============================================================
-- Matches (pre-computed for demo)
-- ============================================================
INSERT INTO Matches (lost_item_id, found_item_id, match_score, match_reason, match_status) VALUES
(1,  2,  85, 'Same category (Bag, 25 pts), same nearby location (20 pts), same color black (10 pts), reported within 1 day (15 pts), 3 common keywords: black laptop bag (15 pts).', 'PENDING'),
(3,  4,  90, 'Same category (Electronics, 25 pts), same location Lab 301 (20 pts), same brand Dell (15 pts), reported within 1 day (15 pts), 2 common keywords: laptop Dell (15 pts).', 'CONFIRMED'),
(15, 14, 60, 'Same category (Keys, 25 pts), nearby location (20 pts), reported within 1 day (15 pts).', 'PENDING'),
(16, 17, 70, 'Same category (Bag, 25 pts), same location CS Block (20 pts), same color blue (10 pts), reported same day (15 pts).', 'PENDING'),
(18, 19, 65, 'Same category (Electronics, 25 pts), same location Cafeteria (20 pts), reported same day (15 pts), 1 common keyword: phone (5 pts).', 'PENDING');

-- ============================================================
-- Demonstrate ALTER TABLE (required SQL operation)
-- ============================================================
ALTER TABLE Items
  ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Admin verification flag';

-- ============================================================
-- Advanced SQL Queries (for reference / demo)
-- ============================================================

-- Reports by category
SELECT category,
       COUNT(*) AS total_reports
FROM Items
GROUP BY category
ORDER BY total_reports DESC;

-- Reports by location
SELECT l.building, l.area, COUNT(i.item_id) AS total_reports
FROM Items i
JOIN Locations l ON i.location_id = l.location_id
GROUP BY l.building, l.area
ORDER BY total_reports DESC;

-- Recovery rate by category
SELECT
    category,
    COUNT(*) AS total_items,
    SUM(status = 'RETURNED') AS returned_items,
    ROUND(100.0 * SUM(status = 'RETURNED') / COUNT(*), 2) AS recovery_rate
FROM Items
GROUP BY category
ORDER BY recovery_rate DESC;

-- Claim approval rate per administrator
SELECT
    u.name AS administrator,
    COUNT(c.claim_id) AS reviewed_claims,
    SUM(c.status = 'APPROVED') AS approved_claims,
    ROUND(100.0 * SUM(c.status = 'APPROVED') / COUNT(c.claim_id), 2) AS approval_pct
FROM Claims c
JOIN Users u ON c.reviewed_by = u.user_id
WHERE c.status IN ('APPROVED','REJECTED')
GROUP BY u.user_id, u.name;

-- Average return time (days from report to RETURNED status)
SELECT
    i.category,
    ROUND(AVG(DATEDIFF(sh.changed_at, i.reported_date)), 1) AS avg_days_to_return
FROM StatusHistory sh
JOIN Items i ON sh.item_id = i.item_id
WHERE sh.new_status = 'RETURNED'
GROUP BY i.category
ORDER BY avg_days_to_return;

-- Subquery: users who have submitted more than one report
SELECT name, email
FROM Users
WHERE user_id IN (
    SELECT reported_by
    FROM Items
    GROUP BY reported_by
    HAVING COUNT(*) > 1
);

-- Items pending for more than 7 days (subquery + HAVING pattern)
SELECT item_id, title, category, reported_date
FROM Items
WHERE status = 'REPORTED'
  AND DATEDIFF(CURDATE(), reported_date) > 7
ORDER BY reported_date;
