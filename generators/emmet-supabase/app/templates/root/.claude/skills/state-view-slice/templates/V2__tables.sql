-- Create tables table
CREATE TABLE IF NOT EXISTS "public"."tables" (
  restaurant_id uuid,
  table_id TEXT PRIMARY KEY,
  name TEXT,
  seats INTEGER
);
