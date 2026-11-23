CREATE TABLE charge_sheets (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                UUID         NOT NULL UNIQUE REFERENCES firs(id),
    filed_by_officer_id   VARCHAR(255) NOT NULL,
    court_name            VARCHAR(255) NOT NULL,
    submission_date       DATE         NOT NULL,
    accused_details       TEXT         NOT NULL,
    evidence_summary      TEXT,
    witness_list          TEXT,
    sections_invoked      TEXT         NOT NULL,
    status                VARCHAR(30)  NOT NULL DEFAULT 'SUBMITTED'
);
