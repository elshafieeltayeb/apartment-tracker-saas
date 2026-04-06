# Wohnungs-Tracker (Web)

Next.js dashboard: Registrierung, Pipeline (Kanban), Vorlagen, Einstellungen, API für die Browser-Erweiterung.

## Setup

```bash
cp .env.example .env
# AUTH_SECRET mindestens 32 Zeichen setzen
npx prisma migrate dev
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000). Erweiterung: API-Basis `http://localhost:3000/api/extension` und Token aus **Dashboard → Einstellungen**.

## Scripts

- `npm run dev` — Entwicklung
- `npm run build` — Produktion
- `npm run db:studio` — Prisma Studio

Siehe auch das Repo-Root-`README.md` und `docs/SPECS.md`.
