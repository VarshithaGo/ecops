CREATE TABLE firs (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fir_number                VARCHAR(60)  UNIQUE NOT NULL,
    complaint_id              UUID         REFERENCES complaints(id),
    station_id                VARCHAR(255) NOT NULL,
    station_code              VARCHAR(20)  NOT NULL,
    registered_by_officer_id  VARCHAR(255) NOT NULL,
    ipc_sections              TEXT         NOT NULL,
    narrative                 TEXT         NOT NULL,
    accused_name              VARCHAR(255),
    accused_address           TEXT,
    status                    VARCHAR(30)  NOT NULL DEFAULT 'REGISTERED',
    free_copy_issued          BOOLEAN      NOT NULL DEFAULT false,
    registered_at             TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_firs_station_id  ON firs(station_id);
CREATE INDEX idx_firs_status      ON firs(status);
CREATE INDEX idx_firs_fir_number  ON firs(fir_number);
