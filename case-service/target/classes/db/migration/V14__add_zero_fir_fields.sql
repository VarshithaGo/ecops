ALTER TABLE firs
    ADD COLUMN is_zero_fir                  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN transferred_to_station_code  VARCHAR(20),
    ADD COLUMN transferred_at               TIMESTAMPTZ,
    ADD COLUMN transfer_notes               TEXT;
