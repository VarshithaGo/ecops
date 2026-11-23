UPDATE criminal_records SET status = 'NOT_ARRESTED' WHERE status = 'AT_LARGE';
ALTER TABLE criminal_records ALTER COLUMN status SET DEFAULT 'NOT_ARRESTED';
