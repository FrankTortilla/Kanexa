# Waypoint Recovery Protocol

This project shares one Supabase production project between Waypoint and the Production Planner. Treat database changes as shared production changes.

## Production Systems

| System | Current Value |
| --- | --- |
| Waypoint app folder | `/Users/stephengutierrez/Desktop/Green Steel Shipment Tracker/.claude/worktrees/sleepy-ramanujan-27251b/shipment-tracker` |
| Supabase project | `FrankTortilla's Project` |
| Supabase project ref | `ntfblbamjejyctcgtmls` |
| Vercel project | `shipment-tracker` |
| Vercel project id | `prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv` |

## Recovery Layers

1. **Code rollback**: use git commits and Vercel rollback to return the website to a previous deployment.
2. **Database migration rollback**: prefer forward-fix migrations. Do not run destructive SQL without a backup checkpoint.
3. **Database backup restore**: use Supabase Dashboard backups or Point-in-Time Recovery when enabled.
4. **Manual export backup**: before major schema/data changes, export database schema and data with the Supabase CLI.
5. **Storage backup**: Supabase database backups do not restore deleted Storage files. Back up important Storage buckets separately.

## Before Any Migration

1. Confirm the project root, branch, git status, latest commit, and this handoff.
2. Confirm the target Supabase project is `ntfblbamjejyctcgtmls`.
3. List remote migrations and schema state.
4. Decide whether this change affects Waypoint, Production Planner, or both.
5. For risky changes, create a manual backup export or confirm Supabase PITR/daily backup coverage first.
6. Apply migrations one at a time.
7. Verify columns, functions, constraints, and affected app behavior after each migration group.
8. Run Supabase advisors and document any remaining warnings.

## Before Any Deployment

1. Confirm database migrations required by the code are already applied.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Confirm Vercel project link points to `prj_jBm73Pi0U4JyaBU2rGmLTQCRsgHv`.
5. Deploy only after listing any remaining blockers.
6. Verify the live feature that changed.

## Emergency Website Rollback

Use this when Vercel deploys but the live app breaks.

1. Identify the last known-good deployment in Vercel.
2. Roll back production to that deployment from the Vercel dashboard or CLI.
3. Verify the live site loads.
4. Do not run database rollback unless the database itself is the source of the incident.
5. Open a fix branch or continue on the current branch with a forward fix.

## Emergency Database Recovery

Use this when data is missing, corrupted, or a migration changed production data incorrectly.

1. Stop new migrations and deployments.
2. Capture the current time, last good time, and what changed.
3. Check Supabase Dashboard > Database > Backups.
4. If Point-in-Time Recovery is enabled, restore to the safest time before the incident.
5. If only daily backups are available, restore from the newest safe daily backup.
6. Remember: database backups do not restore deleted Storage objects.
7. After restore, verify both Waypoint and Production Planner tables.

## Manual Backup Export

When a database password / connection string is available, run:

```bash
SUPABASE_DB_URL="postgresql://..." ./scripts/supabase-backup.sh
```

The script writes schema and data dumps into `backups/`, which is intentionally gitignored.

## Data Safety Rules

- Never hard-delete shipment or production data unless the user explicitly confirms.
- Prefer soft deletes and archive fields.
- Prefer additive migrations over destructive migrations.
- If a destructive migration is unavoidable, document the rollback plan first.
- Treat Supabase changes as affecting both Waypoint and Production Planner until proven otherwise.
