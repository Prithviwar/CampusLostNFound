-- ============================================================
-- Campus Lost & Found Intelligence System
-- MySQL Schema - File 02: Views, Stored Procedures, Triggers
-- ============================================================

USE campus_lnf;

-- ============================================================
-- VIEW: active_reports
-- Joins Items with Locations for easy querying of open reports
-- ============================================================
CREATE OR REPLACE VIEW active_reports AS
SELECT
    i.item_id,
    i.title,
    i.report_type,
    i.category,
    i.status,
    i.reported_date,
    i.created_at,
    i.reported_by,
    u.name        AS reporter_name,
    u.email       AS reporter_email,
    l.location_id,
    l.building,
    l.area,
    l.description AS location_description
FROM Items i
JOIN Users u     ON i.reported_by  = u.user_id
JOIN Locations l ON i.location_id  = l.location_id
WHERE i.status NOT IN ('RETURNED', 'CLOSED');

-- ============================================================
-- VIEW: pending_claims_view
-- Summarises pending claims with item and claimant details
-- ============================================================
CREATE OR REPLACE VIEW pending_claims_view AS
SELECT
    c.claim_id,
    c.claim_description,
    c.created_at   AS claim_date,
    i.item_id,
    i.title        AS item_title,
    i.category,
    i.report_type,
    i.status       AS item_status,
    u.user_id      AS claimant_id,
    u.name         AS claimant_name,
    u.email        AS claimant_email
FROM Claims c
JOIN Items i ON c.item_id    = i.item_id
JOIN Users u ON c.claimed_by = u.user_id
WHERE c.status = 'PENDING'
ORDER BY c.created_at;

-- ============================================================
-- STORED PROCEDURE: approve_claim
-- Approves a claim, updates item status, and records history
-- All three operations execute inside a single transaction.
-- ============================================================
DELIMITER $$

CREATE PROCEDURE approve_claim(
    IN  p_claim_id   INT,
    IN  p_admin_id   INT,
    IN  p_new_status VARCHAR(20)    -- 'APPROVED' or 'REJECTED'
)
BEGIN
    DECLARE v_item_id     INT;
    DECLARE v_old_status  VARCHAR(20);
    DECLARE v_item_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        -- Fetch associated item
        SELECT item_id INTO v_item_id
        FROM Claims
        WHERE claim_id = p_claim_id;

        -- Fetch current item status
        SELECT status INTO v_old_status
        FROM Items
        WHERE item_id = v_item_id;

        -- Determine new item status based on claim decision
        IF p_new_status = 'APPROVED' THEN
            SET v_item_status = 'CLAIMED';
        ELSE
            SET v_item_status = v_old_status; -- no status change on rejection
        END IF;

        -- 1. Update claim
        UPDATE Claims
        SET status      = p_new_status,
            reviewed_by = p_admin_id,
            reviewed_at = NOW()
        WHERE claim_id = p_claim_id;

        -- 2. Update item status (only on approval)
        IF p_new_status = 'APPROVED' THEN
            UPDATE Items
            SET status = v_item_status
            WHERE item_id = v_item_id;
        END IF;

        -- 3. StatusHistory is automatically inserted by the trigger
        --    (fires on item UPDATE above if status changed)

    COMMIT;
END$$

-- ============================================================
-- STORED PROCEDURE: mark_item_returned
-- Marks an item as returned; triggers record the history entry
-- ============================================================
CREATE PROCEDURE mark_item_returned(
    IN p_item_id   INT,
    IN p_admin_id  INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        UPDATE Items
        SET status = 'RETURNED'
        WHERE item_id = p_item_id;
    COMMIT;
END$$

DELIMITER ;

-- ============================================================
-- TRIGGER: trg_item_status_history
-- Automatically inserts a StatusHistory record whenever an
-- item's status column is updated to a different value.
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_item_status_history
AFTER UPDATE ON Items
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO StatusHistory (item_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.item_id, OLD.status, NEW.status, NEW.reported_by, NOW());
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- TEMPORARY TABLE DEMO: Demonstrate DROP usage safely
-- ============================================================
CREATE TEMPORARY TABLE tmp_report_summary AS
SELECT
    category,
    report_type,
    COUNT(*) AS total
FROM Items
GROUP BY category, report_type;

-- Use the temp table (would be used for further analysis)
SELECT * FROM tmp_report_summary ORDER BY total DESC;

DROP TEMPORARY TABLE IF EXISTS tmp_report_summary;
