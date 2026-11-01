-- ============================================================
-- Campus Lost & Found Intelligence System
-- MySQL Schema - File 01: Tables, Constraints, Indexes
-- ============================================================

-- Drop and recreate the database (safe for development)
DROP DATABASE IF EXISTS campus_lnf;
CREATE DATABASE campus_lnf
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_lnf;

-- ============================================================
-- 1. Users
-- ============================================================
CREATE TABLE Users (
    user_id       INT            NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120)   NOT NULL,
    email         VARCHAR(255)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    role          ENUM('STUDENT','ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_email (email)
);

-- ============================================================
-- 2. Locations
-- ============================================================
CREATE TABLE Locations (
    location_id INT          NOT NULL AUTO_INCREMENT,
    building    VARCHAR(120) NOT NULL,
    area        VARCHAR(120) NOT NULL,
    description TEXT,
    PRIMARY KEY (location_id)
);

-- ============================================================
-- 3. Items
-- ============================================================
CREATE TABLE Items (
    item_id       INT          NOT NULL AUTO_INCREMENT,
    reported_by   INT          NOT NULL,
    location_id   INT          NOT NULL,
    report_type   ENUM('LOST','FOUND') NOT NULL,
    category      VARCHAR(80)  NOT NULL,
    title         VARCHAR(255) NOT NULL,
    reported_date DATE         NOT NULL,
    status        ENUM('REPORTED','MATCHED','CLAIMED','VERIFIED','RETURNED','CLOSED')
                               NOT NULL DEFAULT 'REPORTED',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id),
    CONSTRAINT fk_items_user     FOREIGN KEY (reported_by) REFERENCES Users(user_id),
    CONSTRAINT fk_items_location FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);

-- ============================================================
-- 4. Claims
-- ============================================================
CREATE TABLE Claims (
    claim_id          INT          NOT NULL AUTO_INCREMENT,
    item_id           INT          NOT NULL,
    claimed_by        INT          NOT NULL,
    claim_description TEXT         NOT NULL,
    status            ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by       INT,
    reviewed_at       DATETIME,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (claim_id),
    CONSTRAINT fk_claims_item      FOREIGN KEY (item_id)     REFERENCES Items(item_id),
    CONSTRAINT fk_claims_claimant  FOREIGN KEY (claimed_by)  REFERENCES Users(user_id),
    CONSTRAINT fk_claims_reviewer  FOREIGN KEY (reviewed_by) REFERENCES Users(user_id),
    -- Prevent a user from submitting multiple pending claims for the same item
    UNIQUE KEY uq_claims_user_item (item_id, claimed_by)
);

-- ============================================================
-- 5. StatusHistory
-- ============================================================
CREATE TABLE StatusHistory (
    history_id INT     NOT NULL AUTO_INCREMENT,
    item_id    INT     NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INT     NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (history_id),
    CONSTRAINT fk_history_item FOREIGN KEY (item_id)    REFERENCES Items(item_id),
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES Users(user_id)
);

-- ============================================================
-- 6. Matches
-- ============================================================
CREATE TABLE Matches (
    match_id      INT            NOT NULL AUTO_INCREMENT,
    lost_item_id  INT            NOT NULL,
    found_item_id INT            NOT NULL,
    match_score   TINYINT UNSIGNED NOT NULL,
    match_reason  TEXT           NOT NULL,
    match_status  ENUM('PENDING','CONFIRMED','DISMISSED') NOT NULL DEFAULT 'PENDING',
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (match_id),
    CONSTRAINT fk_matches_lost  FOREIGN KEY (lost_item_id)  REFERENCES Items(item_id),
    CONSTRAINT fk_matches_found FOREIGN KEY (found_item_id) REFERENCES Items(item_id),
    -- Prevent storing the same pair twice
    UNIQUE KEY uq_matches_pair (lost_item_id, found_item_id),
    -- Enforce that lost_item and found_item are not the same record
    CONSTRAINT chk_matches_different CHECK (lost_item_id <> found_item_id)
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_items_category    ON Items(category);
CREATE INDEX idx_items_report_type ON Items(report_type);
CREATE INDEX idx_items_status      ON Items(status);
CREATE INDEX idx_items_location    ON Items(location_id);
CREATE INDEX idx_items_reported_by ON Items(reported_by);
CREATE INDEX idx_items_date        ON Items(reported_date);
CREATE INDEX idx_claims_status     ON Claims(status);
CREATE INDEX idx_claims_item       ON Claims(item_id);
CREATE INDEX idx_history_item      ON StatusHistory(item_id);
CREATE INDEX idx_matches_lost      ON Matches(lost_item_id);
CREATE INDEX idx_matches_found     ON Matches(found_item_id);
CREATE INDEX idx_matches_score     ON Matches(match_score);
