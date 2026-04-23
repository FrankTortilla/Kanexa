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
- Stat tiles wrapper + table `<thead>` background: #363636
- Table header text: #94A3B8
- Row hover: #1E2A38

## POD Column (`PODCell.jsx`)

- No POD: icon-only ↑ in #64748B, brightens to #94A3B8 on hover. No border, no background, no text.
- Has POD: 📎 + "View" label in #38BDF8 (matches In Transit color). Replace also available via ↑ icon.
- Accepted: PDF, JPG, PNG — max 5 MB
- Storage bucket: `pod-documents` (private), path `shipments/{id}/pod.{ext}`
- `pod_file_path` column on shipments table stores the path; file deleted from storage on shipment delete
