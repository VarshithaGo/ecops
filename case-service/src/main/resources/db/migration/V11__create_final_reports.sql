CREATE TABLE final_reports (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id                UUID         NOT NULL UNIQUE REFERENCES firs(id),
    filed_by_officer_id   VARCHAR(255) NOT NULL,
    report_type           VARCHAR(10)  NOT NULL,
    submission_date       DATE         NOT NULL,
    court_name            VARCHAR(255) NOT NULL,
    remarks               TEXT         NOT NULL,
    status                VARCHAR(20)  NOT NULL DEFAULT 'FILED'
);
