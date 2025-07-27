-- 001_create_pgmq_and_trigger.sql

-- Create the <%-readmodel%>-collection table if not exists
create table if not exists public."<%-readmodel%>-collection"
(
    _id text                            not null,
    data       jsonb                    not null,
    metadata   jsonb                    not null default '{}'::jsonb,
    _version bigint                     not null default 1,
    _partition text                     not null default 'png_global'::text,
    _archived boolean                   not null default false,
    _created   timestamp with time zone not null default now(),
    _updated   timestamp with time zone not null default now(),
    constraint <%-readmodel%>_collection_pkey primary key (_id)
    ) TABLESPACE pg_default;

ALTER TABLE public."<%-readmodel%>-collection" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated users only"
  ON public."<%-readmodel%>-collection"
  FOR SELECT
  TO authenticated
  USING (true);