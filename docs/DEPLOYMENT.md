# Deployment ARMONI

## Current state

- Frontend static assets: ready.
- JavaScript syntax validation: passing.
- GitHub Actions validation workflow: passing.
- Supabase legal schema/RLS: deployed.
- GitHub Pages deployment workflow: ready, but the Pages site must be enabled once in repository settings.

## One-time GitHub setting

Open repository **Settings → Pages** and set **Source** to **GitHub Actions**.

After that, every push to `main` runs:

`checkout → configure-pages → upload artifact → deploy-pages`.

## Production boundary

GitHub Pages:
- Static frontend.
- Public Supabase publishable key only.
- No service-role, Google, or AI secrets.
- No confidential legal file storage.

Supabase:
- Auth.
- PostgreSQL system of record.
- RLS and authorization.
- Storage metadata/object store.
- Audit/workflow state.

Backend / Edge Functions:
- DOCX/PDF high-fidelity compilation.
- TTE adapter.
- Google Drive archive + retry + verification.
- AI/RAG calls and secrets.

Google Drive:
- Institutional archive / secondary copy.
- DB stores file/folder IDs and hash metadata.

## Expected Pages URL

https://rsudssma-pnk.github.io/legal/
