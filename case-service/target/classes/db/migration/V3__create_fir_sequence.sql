CREATE TABLE fir_sequence (
    station_code  VARCHAR(20)  NOT NULL,
    year          INTEGER      NOT NULL,
    last_seq      INTEGER      NOT NULL DEFAULT 0,
    PRIMARY KEY (station_code, year)
);
