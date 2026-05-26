# DEPLOYMENT.md — Rules for shipping the Green Steel Shipment Tracker

This file exists so that a paying client never loses access to the app because of a
preventable mistake. Read it before making any change that could reach production.

---

## The one rule that matters most

**Never experiment on production.** The client's live site is something you *promote
finished work to*, never something you test on. If you are about to "just try something"
on the live site, stop — that is exactly the move that causes downtime.

---

## The environments

| Environment | Where | Built from | Who uses it |
|---|---|---|---|
| Production | `shipment-tracker-one.vercel.app` | `main` branch | The client |
| Preview / staging | a Vercel preview URL | `dev` branch | You, for testing |
| Local | your computer | your working files | You, while coding |

Code only ever flows ONE direction: **local → dev (preview) → main (production)**.
It never flows backward.

---

## Ground truth (confirmed, do not re-litigate)

- The ONLY correct working directory is `~/Desktop/green-steel-clean` on branch `main`.
- The permanent Vercel home is the project named **`green-steel-clean`**. It owns the
  production domain `shipment-tracker-one.vercel.app` and has the Supabase env vars set.
- Do NOT deploy to the old `shipment-tracker` project or any other Vercel project.
  Several stale projects exist on the account — ignore all of them.
- GitHub repo: `https://github.com/FrankTortilla/green-steel-shipment-tracker`
- Git commit email must always be `steve@kanexagroup.com`.

---

## How to deploy (the only approved method)

1. Make changes locally.
2. Push to the `dev` branch. Vercel auto-builds a preview URL.
3. Open the preview URL and TEST. Confirm data loads and your change works.
4. Only when satisfied, merge `dev` into `main`.
5. Pushing `main` to GitHub triggers a Vercel **cloud build** that goes live.

That's it. Pushing to GitHub is the deploy. No CLI gymnastics required.

---

## Hard "never do this" list

- **Never** use `vercel --prod` directly. It caused a failed deployment.
- **Never** use the local prebuilt path (`vercel build` then `vercel deploy --prebuilt`).
  Prebuilt deployments do NOT pick up environment variables and caused a full outage.
  If a build must be triggered manually, use a fresh **cloud** build only.
- **Never** move the production domain between projects casually. It lives on
  `green-steel-clean` and should stay there.
- **Never** add or edit Supabase env vars and assume the live site updates. Env vars are
  baked in **at build time** — you must trigger a NEW build (push to GitHub) for changes
  to take effect.

---

## Why "no data" happens (and how to fix it)

If the app loads but shows no shipments, it is almost always this: the live build was
created BEFORE the Supabase keys were present, so it has empty credentials baked in.

Fix: confirm the env vars exist on `green-steel-clean`, then trigger a fresh cloud build
by pushing a commit to `main` (even a one-character README change works). The new build
bakes the keys in and data returns.

The data itself lives in Supabase and is never at risk from deployment changes. Deploys
only affect the code and which keys the app uses to connect.

---

## One change, one commit

Keep each commit scoped to a single fix. It makes problems easy to find and easy to undo.
Before writing a Claude Code prompt, identify the edge cases and get explicit approval
before any code changes.

---

## Housekeeping deadlines

- **GitHub two-factor authentication is required by June 19, 2026.** Enable it before then
  or you risk losing repo access — which would block the push-to-deploy workflow entirely.
