CREATE TABLE criminal_records (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id         UUID         NOT NULL REFERENCES firs(id),
    full_name      VARCHAR(255) NOT NULL,
    dob            DATE,
    age_at_crime   INTEGER,
    gender         VARCHAR(20),
    state          VARCHAR(100) NOT NULL,
    district       VARCHAR(100) NOT NULL,
    area           VARCHAR(150),
    aadhaar_ref    VARCHAR(100),
    photo_url      TEXT,
    crimes_summary TEXT,
    status         VARCHAR(30)  NOT NULL DEFAULT 'AT_LARGE',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_criminal_records_state_district ON criminal_records(state, district);
CREATE INDEX idx_criminal_records_full_name       ON criminal_records(full_name);
CREATE INDEX idx_criminal_records_age_at_crime    ON criminal_records(age_at_crime);
CREATE INDEX idx_criminal_records_aadhaar_ref     ON criminal_records(aadhaar_ref);
