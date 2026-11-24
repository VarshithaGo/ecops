-- Creates the three application databases inside the single local Postgres
-- container. Runs once, on first container start (empty data volume).
-- Keycloak uses its own in-memory dev DB (start-dev), so it is not here.
-- Flyway in each service creates the tables on first boot.
CREATE DATABASE auth_admin_db OWNER ecops;
CREATE DATABASE case_db       OWNER ecops;
CREATE DATABASE citizen_db    OWNER ecops;
