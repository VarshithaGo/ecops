CREATE TABLE court_disposals (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_id            UUID         NOT NULL UNIQUE REFERENCES firs(id),
    charge_sheet_id   UUID         REFERENCES charge_sheets(id),
    court_name        VARCHAR(255) NOT NULL,
    judge_name        VARCHAR(255),
    judgment_date     DATE,
    outcome           VARCHAR(30)  NOT NULL,
    remarks           TEXT
);
