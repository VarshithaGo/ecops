ALTER TABLE complaints
    ALTER COLUMN citizen_keycloak_id DROP NOT NULL,
    ADD COLUMN is_walk_in         BOOLEAN      NOT NULL DEFAULT false,
    ADD COLUMN walk_in_name       VARCHAR(255),
    ADD COLUMN walk_in_phone      VARCHAR(20),
    ADD COLUMN walk_in_address    TEXT,
    ADD COLUMN registered_by_officer_id VARCHAR(255);
