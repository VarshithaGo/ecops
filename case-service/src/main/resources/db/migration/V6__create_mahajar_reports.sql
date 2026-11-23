CREATE TABLE mahajar_reports (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                UUID         NOT NULL REFERENCES firs(id),
    io_officer_id         VARCHAR(255) NOT NULL,
    visit_date            DATE         NOT NULL,
    location_description  TEXT         NOT NULL,
    witness_names         TEXT,
    observations          TEXT         NOT NULL,
    sketch_url            VARCHAR(500),
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_mahajar_reports_fir_id ON mahajar_reports(fir_id);
