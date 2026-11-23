CREATE TABLE property_seizures (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                  UUID         NOT NULL REFERENCES firs(id),
    property_description    TEXT         NOT NULL,
    quantity                INTEGER      NOT NULL DEFAULT 1,
    seized_by_officer_id    VARCHAR(255) NOT NULL,
    seizure_date            DATE         NOT NULL,
    storage_location        VARCHAR(255),
    status                  VARCHAR(30)  NOT NULL DEFAULT 'IN_CUSTODY',
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_seizures_fir_id ON property_seizures(fir_id);
