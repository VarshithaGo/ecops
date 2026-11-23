CREATE TABLE ncr_entries (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ncr_number              VARCHAR(50)  UNIQUE NOT NULL,
    complaint_id            UUID         NOT NULL REFERENCES complaints(id),
    recorded_by_officer_id  VARCHAR(255) NOT NULL,
    station_id              VARCHAR(255) NOT NULL,
    form_76a_issued         BOOLEAN      NOT NULL DEFAULT false,
    form_76a_issued_at      TIMESTAMPTZ,
    remarks                 TEXT,
    status                  VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_ncr_entries_station_id ON ncr_entries(station_id);
