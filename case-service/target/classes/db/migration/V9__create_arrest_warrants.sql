CREATE TABLE arrest_warrants (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                    UUID         NOT NULL REFERENCES firs(id),
    requested_by_officer_id   VARCHAR(255) NOT NULL,
    accused_name              VARCHAR(255) NOT NULL,
    accused_description       TEXT,
    reason                    TEXT         NOT NULL,
    magistrate_id             VARCHAR(255),
    status                    VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    decision_notes            TEXT,
    requested_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    decided_at                TIMESTAMPTZ
);

CREATE INDEX idx_arrest_warrants_status  ON arrest_warrants(status);
CREATE INDEX idx_arrest_warrants_fir_id  ON arrest_warrants(fir_id);
