CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE citizens (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_user_id    VARCHAR(255) UNIQUE,
    full_name           VARCHAR(255) NOT NULL,
    dob                 DATE         NOT NULL,
    aadhaar_ref         VARCHAR(100) NOT NULL,
    address             TEXT         NOT NULL,
    district            VARCHAR(100),
    state               VARCHAR(100),
    phone               VARCHAR(20),
    email               VARCHAR(255) NOT NULL UNIQUE,
    photo_url           TEXT,
    status              VARCHAR(30)  NOT NULL DEFAULT 'PENDING_VERIFICATION',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_citizens_email          ON citizens(email);
CREATE INDEX idx_citizens_keycloak_id    ON citizens(keycloak_user_id);
CREATE INDEX idx_citizens_aadhaar_ref    ON citizens(aadhaar_ref);
