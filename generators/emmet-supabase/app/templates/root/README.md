```
DO $$
DECLARE
    obj RECORD;
BEGIN
    -- Drop tables
    FOR obj IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE;', 'public', obj.tablename);
    END LOOP;

    -- Drop sequences
    FOR obj IN
        SELECT sequencename
        FROM pg_sequences
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE;', 'public', obj.sequencename);
    END LOOP;

    -- Drop views
    FOR obj IN
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE;', 'public', obj.table_name);
    END LOOP;
END $$;

DO $$
DECLARE
    obj RECORD;
BEGIN
    -- Drop tables
    FOR obj IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'app'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE;', 'app', obj.tablename);
    END LOOP;

    -- Drop sequences
    FOR obj IN
        SELECT sequencename
        FROM pg_sequences
        WHERE schemaname = 'app'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE;', 'app', obj.sequencename);
    END LOOP;

    -- Drop views
    FOR obj IN
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'app'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE;', 'app', obj.table_name);
    END LOOP;
END $$;

 -- Drop all functions in app schema                                                                                                                                                                            
  DO $$                                                                                                                                                                                                          
  DECLARE                                                                                                                                                                                                        
      func_record RECORD;                                                                                                                                                                                        
  BEGIN                                                                                                                                                                                                          
      FOR func_record IN                                                                                                                                                                                         
          SELECT n.nspname as schema_name, p.proname as func_name,                                                                                                                                               
                 pg_get_function_identity_arguments(p.oid) as func_args                                                                                                                                          
          FROM pg_proc p                                                                                                                                                                                         
          JOIN pg_namespace n ON p.pronamespace = n.oid                                                                                                                                                          
          WHERE n.nspname = 'app'                                                                                                                                                                                
      LOOP                                                                                                                                                                                                       
          EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',                                                                                                                                            
              func_record.schema_name,                                                                                                                                                                           
              func_record.func_name,                                                                                                                                                                             
              func_record.func_args);                                                                                                                                                                            
      END LOOP;                                                                                                                                                                                                  
  END                                                                                                                                                                                                            
  $$;                                                                                                                                                                                                            
                                                                                                                                                                                                                 
  -- Drop all functions in public schema (excluding system functions)                                                                                                                                            
  DO $$                                                                                                                                                                                                          
  DECLARE                                                                                                                                                                                                        
      func_record RECORD;                                                                                                                                                                                        
  BEGIN                                                                                                                                                                                                          
      FOR func_record IN                                                                                                                                                                                         
          SELECT n.nspname as schema_name, p.proname as func_name,                                                                                                                                               
                 pg_get_function_identity_arguments(p.oid) as func_args                                                                                                                                          
          FROM pg_proc p                                                                                                                                                                                         
          JOIN pg_namespace n ON p.pronamespace = n.oid                                                                                                                                                          
          WHERE n.nspname = 'public'                                                                                                                                                                             
          AND p.proowner != 10  -- exclude postgres system functions                                                                                                                                             
      LOOP                                                                                                                                                                                                       
          EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',                                                                                                                                            
              func_record.schema_name,                                                                                                                                                                           
              func_record.func_name,                                                                                                                                                                             
              func_record.func_args);                                                                                                                                                                            
      END LOOP;                                                                                                                                                                                                  
  END                                                                                                                                                                                                            
  $$;                                 

truncate table auth.users cascade;
DROP POLICY if exists backend_worker_storage ON storage.objects;


```

Create the backend worker

```
CREATE ROLE backend_worker WITH LOGIN PASSWORD 'YOUR_PASSWORD' NOINHERIT;

```