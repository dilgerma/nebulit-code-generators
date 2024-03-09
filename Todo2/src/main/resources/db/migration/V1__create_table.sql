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

-- event registry
CREATE TABLE IF NOT EXISTS event_publication
(
  id               UUID NOT NULL,
  listener_id      TEXT NOT NULL,
  event_type       TEXT NOT NULL,
  serialized_event TEXT NOT NULL,
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completion_date  TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
)
