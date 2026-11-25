-- NCR investigation lifecycle (BNSS §174): once a Magistrate orders investigation,
-- the station deputes an IO, investigates, and closes with an outcome — or escalates
-- to an FIR if a cognizable element surfaces (§174(4)).
ALTER TABLE ncr_entries
    ADD COLUMN assigned_io_officer_id VARCHAR(255),
    ADD COLUMN investigation_findings TEXT,
    ADD COLUMN outcome                VARCHAR(40),
    ADD COLUMN closed_by_officer_id   VARCHAR(255),
    ADD COLUMN closed_at              TIMESTAMPTZ,
    ADD COLUMN escalated_fir_id       UUID;
