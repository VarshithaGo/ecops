CREATE TABLE officer_assignments (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_user_id    VARCHAR(255) NOT NULL,
    station_id          UUID         NOT NULL REFERENCES stations(id),
    zone_id             UUID         REFERENCES zones(id),
    rank                VARCHAR(100),
    badge_number        VARCHAR(50)  UNIQUE NOT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    assigned_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    unassigned_at       TIMESTAMPTZ
);

CREATE INDEX idx_officer_assignments_keycloak_user_id ON officer_assignments(keycloak_user_id);
CREATE INDEX idx_officer_assignments_station_active   ON officer_assignments(station_id, is_active);
