# Apartment Application Tracker (Germany)

Germany-focused SaaS workspace: **Next.js web dashboard** (auth, Kanban, Vorlagen, DSGVO-Export) + **Chrome extension** (lokal + optional Cloud-Sync per API-Token).

**Repository:** [github.com/elshafieeltayeb/apartment-tracker-saas](https://github.com/elshafieeltayeb/apartment-tracker-saas)

## Contents

| Path | Purpose |
|------|---------|
| [docs/SPECS.md](./docs/SPECS.md) | Product specification |
| [docs/CONVERSATION.md](./docs/CONVERSATION.md) | Archived brainstorming |
| [web/](./web/) | Next.js app — see [web/README.md](./web/README.md) |
| [extension/](./extension/) | Manifest V3 extension |

## Quick start (web)

```bash
cd web && cp .env.example .env && npm install && npx prisma migrate dev && npm run dev
```

## Extension

Chrome/Edge: **Erweiterungen** → **Entpackte Erweiterung laden** → Ordner `extension`. Optional: Dashboard-URL und unter „Cloud-Sync“ die API-Basis (`…/api/extension`) + Token aus den Web-Einstellungen.

## Docs

Details: [docs/SPECS.md](./docs/SPECS.md) and [docs/CONVERSATION.md](./docs/CONVERSATION.md).
