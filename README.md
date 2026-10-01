# Primeiros Encantos

A nanny-matching platform for Angola. The platform is the employer/mediator between families and nannies — it runs matching, interviews, contracts and payments; families and nannies never exchange contact details directly.

Stack: Next.js (App Router) + TypeScript, MongoDB + Mongoose, Auth.js v5, Tailwind + shadcn/ui, Brevo (email/SMS), Cloudinary (file storage), `@react-pdf/renderer` (contract/receipt PDFs).

## Getting started

```bash
npm install
npm run seed   # idempotent: 1 admin, 5 nannies, 3 families
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seeded users all share the password `Password123!` (admin: `admin@nannyplatform.ao`).

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` / `npm run typecheck` — ESLint / `tsc --noEmit`
- `npm run seed` — (re-)seed local MongoDB with demo data
- `npm run cron` — local/dev payment-reminder worker (`node-cron`, daily at 08:00 Africa/Luanda)
- `npm run test:e2e` — Playwright end-to-end tests against a local production build (see below)

## End-to-end tests

`tests/e2e/` covers the PRD's four required flows: nanny registration → approval, family request → recommendation → approval, contract signing, and payment recording. The suite builds and boots a real production server (not `next dev`) on port 3100 and connects directly to `MONGODB_URI` to set up fixtures, so run it against a seeded database:

```bash
npm run seed
npm run test:e2e
```

## Deployment checklist

Not deployed yet — going live is a separate decision. Before it happens:

- [ ] Choose hosting (Vercel, or a Node host if the payment-reminder cron worker needs to run continuously)
- [ ] Register/point the production domain, and confirm HTTPS is enforced
- [ ] Provision a production MongoDB cluster with automated backups (separate from any development database)
- [ ] Provision production storage (Cloudinary) and a production Brevo sender identity, separate from development credentials
- [ ] Set `AUTH_SECRET` to a fresh production value and set `APP_BASE_URL` to the real domain
- [ ] Wire up error tracking (e.g. Sentry)
- [ ] Create the real admin account(s) for launch
- [ ] Remove/replace all seed data in the production database
- [ ] Have `/termos` and `/privacidade` reviewed by a licensed lawyer before launch — `/privacidade` still holds placeholder text, and `/termos` holds real content but should be re-confirmed against the company's actual legal entity name
- [ ] Decide how the payment-reminder worker (`npm run cron`) runs continuously in production (a long-running process, or a hosted cron trigger hitting an API route)
