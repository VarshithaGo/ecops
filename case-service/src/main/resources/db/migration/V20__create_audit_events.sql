CREATE TABLE audit_events (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type   VARCHAR(30)  NOT NULL,
    entity_id     UUID         NOT NULL,
    fir_id        UUID,
    actor_id      VARCHAR(255),
    actor_role    VARCHAR(40),
    action        VARCHAR(60)  NOT NULL,
    from_status   VARCHAR(40),
    to_status     VARCHAR(40),
    details       TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_fir_id      ON audit_events(fir_id);
CREATE INDEX idx_audit_events_entity      ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_created_at  ON audit_events(created_at);
