CREATE TABLE users_shadow (
    id          VARCHAR(255) PRIMARY KEY,
    username    VARCHAR(255) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    full_name   VARCHAR(255),
    role        VARCHAR(50)  NOT NULL,
    synced_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
