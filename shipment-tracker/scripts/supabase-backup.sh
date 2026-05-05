#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is required."
  echo "Get it from Supabase Dashboard > Connect, then run:"
  echo 'SUPABASE_DB_URL="postgresql://..." ./scripts/supabase-backup.sh'
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
backup_dir="backups/${timestamp}"
mkdir -p "${backup_dir}"

cache_dir="${NPM_CONFIG_CACHE:-/private/tmp/npm-cache-waypoint}"

echo "Writing Supabase backup exports to ${backup_dir}"

NPM_CONFIG_CACHE="${cache_dir}" npx supabase db dump \
  --db-url "${SUPABASE_DB_URL}" \
  -f "${backup_dir}/schema.sql"

NPM_CONFIG_CACHE="${cache_dir}" npx supabase db dump \
  --db-url "${SUPABASE_DB_URL}" \
  --use-copy \
  --data-only \
  -f "${backup_dir}/data.sql"

NPM_CONFIG_CACHE="${cache_dir}" npx supabase db dump \
  --db-url "${SUPABASE_DB_URL}" \
  --role-only \
  -f "${backup_dir}/roles.sql"

echo "Backup export complete: ${backup_dir}"
