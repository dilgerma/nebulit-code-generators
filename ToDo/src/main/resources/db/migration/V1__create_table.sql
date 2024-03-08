CREATE TABLE IF NOT EXISTS aggregates (
    aggregate_id varchar(255) PRIMARY KEY,
    version BIGINT,
    discriminator varchar
);

CREATE SEQUENCE events_seq START 101;

CREATE TABLE events (
    id INT PRIMARY KEY,
    aggregate_id varchar(200),
    value varchar,
    version int,
    created date default current_date
);
