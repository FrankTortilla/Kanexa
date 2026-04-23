@AGENTS.md

## Color Scheme

- `--text-primary`: #CBD5E1
- `--accent-danger`: #FF1744
- `--accent-in-transit`: #38BDF8
- `--accent-pending`: #FF8C00
- Delivered green: #4a7c3f (unchanged)

## Surface Colors

- App background / dark surface: #1a1a1a (`--bg-primary`, `--bg-surface`)
- Stat tiles (individual): #1E293B
- Stat tiles wrapper + table `<thead>` background: #949494
- Table header text: #111827
- Row hover: #1E2A38

## POD Column (`PODCell.jsx`)

- No POD: faint `↑ Upload` label in #64748B (muted, non-distracting)
- Has POD: 📎 + "View" label in #38BDF8 (blue, matches In Transit)
- Upload/Replace pill: background #1E293B, border #334155 (hover: #949494), text #94A3B8, font-size 12px, padding 4px 10px, border-radius 6px
- Accepted: PDF, JPG, PNG — max 5 MB
- Storage bucket: `pod-documents` (private), path `shipments/{id}/pod.{ext}`
- `pod_file_path` column on shipments table stores the path; cleared on hard delete
