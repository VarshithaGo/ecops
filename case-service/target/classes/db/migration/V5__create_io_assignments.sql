CREATE TABLE io_assignments (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                    UUID         NOT NULL REFERENCES firs(id),
    io_officer_id             VARCHAR(255) NOT NULL,
    assigned_by_officer_id    VARCHAR(255) NOT NULL,
    assigned_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    status                    VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX idx_io_assignments_fir_id ON io_assignments(fir_id);
