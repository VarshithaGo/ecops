CREATE TABLE aadhaar_verifications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id      UUID        NOT NULL REFERENCES citizens(id),
    aadhaar_ref     VARCHAR(100) NOT NULL,
    result          VARCHAR(20)  NOT NULL,
    mock_response   JSONB,
    verified_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_aadhaar_verifications_citizen_id ON aadhaar_verifications(citizen_id);
