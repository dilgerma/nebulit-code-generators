-- Create locations table
CREATE TABLE IF NOT EXISTS "public"."locations" (
  restaurant_id uuid,
  name TEXT,
  zip_code TEXT,
  city TEXT
);
