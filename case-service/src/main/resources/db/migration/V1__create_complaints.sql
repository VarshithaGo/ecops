CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE complaints (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_number     VARCHAR(50)  UNIQUE NOT NULL,
    citizen_keycloak_id  VARCHAR(255) NOT NULL,
    station_id           VARCHAR(255) NOT NULL,
    description          TEXT         NOT NULL,
    incident_date        DATE         NOT NULL,
    incident_location    TEXT,
    offense_type         VARCHAR(30),
    assigned_officer_id  VARCHAR(255),
    status               VARCHAR(30)  NOT NULL DEFAULT 'FILED',
    categorized_at       TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ
);

CREATE INDEX idx_complaints_citizen_id       ON complaints(citizen_keycloak_id);
CREATE INDEX idx_complaints_station_status   ON complaints(station_id, status);
