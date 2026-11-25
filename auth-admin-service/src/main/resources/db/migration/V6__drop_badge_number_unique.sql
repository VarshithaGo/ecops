-- Allow an officer to be reassigned to another station while keeping their badge.
-- A reassignment deactivates the old row and inserts a new one; the old row still
-- holds the badge, so the per-row UNIQUE on badge_number must be dropped.
ALTER TABLE officer_assignments DROP CONSTRAINT IF EXISTS officer_assignments_badge_number_key;
CREATE INDEX IF NOT EXISTS idx_officer_assignments_badge ON officer_assignments(badge_number);
