ALTER TABLE ncr_entries
    ADD COLUMN magistrate_id           VARCHAR(255),
    ADD COLUMN magistrate_order_notes  TEXT,
    ADD COLUMN magistrate_ordered_at   TIMESTAMPTZ;
