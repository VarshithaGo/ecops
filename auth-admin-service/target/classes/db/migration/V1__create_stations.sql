CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE stations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    station_name    VARCHAR(150) NOT NULL,
    station_code    VARCHAR(20)  UNIQUE NOT NULL,
    address         TEXT         NOT NULL,
    district        VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    jurisdiction_area TEXT,
    gps_lat         DECIMAL(10,7),
    gps_lng         DECIMAL(10,7),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ
);
