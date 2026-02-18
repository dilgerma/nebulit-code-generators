#!/usr/bin/env bash
set -euo pipefail

prompt() {
  local var_name="$1"
  local prompt_text="$2"
  local value
  read -rp "$prompt_text: " value
  if [[ -z "$value" ]]; then
    echo "Error: $var_name cannot be empty." >&2
    exit 1
  fi
  echo "$value"
}

prompt_secret() {
  local var_name="$1"
  local prompt_text="$2"
  local value
  read -rsp "$prompt_text: " value
  echo "" >&2
  if [[ -z "$value" ]]; then
    echo "Error: $var_name cannot be empty." >&2
    exit 1
  fi
  echo "$value"
}

echo "=== Supabase .env setup ==="
echo ""

PROJECT_ID=$(prompt SUPABASE_PROJECT_ID "Supabase Project ID")
DB_PASSWORD=$(prompt_secret SUPABASE_DB_PASSWORD "Database Password")
PUBLISHABLE_KEY=$(prompt_secret SUPABASE_PUBLISHABLE_KEY "Supabase Publishable Key")
SECRET_KEY=$(prompt_secret SUPABASE_SECRET_KEY "Supabase Secret Key")

cat > .env <<EOF
SUPABASE_URL=https://${PROJECT_ID}.supabase.co
SUPABASE_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}
SUPABASE_DB_URL=postgresql://postgres.${PROJECT_ID}:${DB_PASSWORD}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?prepareThreshold=0
SUPABASE_SECRET_KEY=${SECRET_KEY}

# Flyway configuration
FLYWAY_URL=jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:6543/postgres?user=postgres.${PROJECT_ID}&password=${DB_PASSWORD}
FLYWAY_USER=postgres.${PROJECT_ID}
FLYWAY_PASSWORD=${DB_PASSWORD}
EOF

echo ""
echo ".env created successfully."