# Apartment Application Tracker (Germany) — product workspace

Documentation-only repo for planning a Germany-focused SaaS: **web dashboard** + **browser extension**, with validation-first go-to-market notes preserved from the original conversation.

## Contents

| File | Purpose |
|------|--------|
| [docs/SPECS.md](./docs/SPECS.md) | Product specification: web app, extension, backend, phases, risks |
| [docs/CONVERSATION.md](./docs/CONVERSATION.md) | Archived brainstorming thread (ideas, extension rationale, MVP) |

## Browser extension (MVP)

- Code lives in [`extension/`](./extension/): Manifest V3, popup (Tab speichern, Status, Erinnerungen), lokale Speicherung (`chrome.storage.local`), optionale Dashboard-URL.
- In Chrome/Edge: **Erweiterungen** → **Entpackte Erweiterung laden** → Ordner `extension` wählen.
- Details: [docs/SPECS.md](./docs/SPECS.md) und [docs/CONVERSATION.md](./docs/CONVERSATION.md).

## Next steps (when you start building)

- Pick stack (e.g. Next.js + auth + Stripe + extension framework).
- Run validation (landing / Notion / sheet) before heavy engineering.
- Keep auto-capture on portals as phased, user-confirmed features.
- Extension ↔ API: Auth-Bridge und Sync (siehe SPECS §5.4).
