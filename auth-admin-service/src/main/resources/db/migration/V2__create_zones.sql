CREATE TABLE zones (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id  UUID        NOT NULL REFERENCES stations(id),
    zone_name   VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_zones_station_id ON zones(station_id);
