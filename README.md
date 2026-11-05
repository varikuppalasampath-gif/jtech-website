# Jtech Mechatronics & AI Solutions — Website Project

A full-stack Next.js 15 / React 19 / TypeScript website starter with public pages, product/service catalogue, enquiry workflow, secure admin authentication, content CRUD APIs, enquiry management, audit logging, PostgreSQL/Prisma and S3-compatible uploads.

## Stack and suggested cloud setup

- **Web hosting:** Vercel (Mumbai region configured as `bom1`)
- **Database:** Neon or Supabase managed PostgreSQL
- **ORM:** Prisma
- **Admin authentication:** HttpOnly signed session cookie (8-hour expiry), bcrypt password hashing, role checks
- **Media storage:** Cloudflare R2 using presigned upload URLs
- **Email:** Resend transactional email
- **Frontend:** Next.js 15, React 19, TypeScript, responsive CSS

## Local development

Requirements: Node.js 20.9+, npm and PostgreSQL.

1. Extract ZIP and open folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `AUTH_SECRET`, seed admin details.
4. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   npm run dev
   ```
5. Visit `http://localhost:3000`.
6. Admin login: `http://localhost:3000/admin` using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

Generate a strong secret using `openssl rand -base64 48`. Never commit `.env`.

## Routes

Public:
- `/` Home
- `/about`
- `/products` and `/products/[slug]`
- `/services`
- `/industries`
- `/projects`
- `/careers`
- `/contact`
- `/privacy`

Admin:
- `/admin` — secure sign-in and content management
- Admin API: `/api/admin/products`, `/services`, `/projects`, `/categories`
- Enquiries: `/api/enquiries` and `/api/admin/enquiries/[id]`
- Upload initialization: `/api/admin/upload`

## Admin capabilities

- Super admin login; no public sign-up.
- Super-admin-only administrator account creation, role assignment, activation/deactivation and password reset.
- Manage product, service, project and category records.
- Publish/unpublish catalogue entries.
- Upload media to configured S3-compatible object storage using short-lived presigned URLs.
- Search and filter enquiries; update enquiry lifecycle status.
- Audit logs for login and content changes.
- API role checks for content editors and enquiry managers.
- Login and public enquiry rate limiting backed by PostgreSQL.

## Seeded content

The seed script creates one super-admin user, seven categories and unpublished draft product/service entries based on the supplied visiting card. These drafts are deliberately unpublished until Jtech validates the technical descriptions, product/service scope, models and imagery.

## Cloud deployment (recommended: Vercel + Neon + Cloudflare R2)

1. Create a managed PostgreSQL database (Neon or Supabase) and copy its pooled connection string into `DATABASE_URL`. Ensure SSL is enabled.
2. Create a Cloudflare R2 bucket and API token with object read/write access. Configure bucket CORS to allow PUT from the production website origin. Configure a public custom asset domain and set the S3 variables.
3. Verify a sending domain in Resend; configure `RESEND_API_KEY`, `EMAIL_FROM`, and `ENQUIRY_TO_EMAIL`.
4. Push this project to a private GitHub repository and import it into Vercel.
5. Set all environment variables in Vercel Production and Preview environments. Use a separate database and secrets for Preview.
6. Deploy. Run Prisma migrations from a controlled release step:
   ```bash
   npx prisma migrate deploy
   ```
   If the project has no migration history yet, create the initial migration in a development environment with `npx prisma migrate dev --name init`, commit the generated `prisma/migrations` directory, and then run `npx prisma migrate deploy` in production.
7. Bootstrap the first administrator from a secure one-time environment setup. Run `npm run db:seed` once with `SEED_ADMIN_EMAIL` and a strong `SEED_ADMIN_PASSWORD`; remove the seed password from the environment after successful bootstrap.
8. Configure the custom domain, DNS, HTTPS, analytics, uptime monitoring and backups.
9. Test enquiry submission, email delivery, admin sign-in, role access, media upload, database restore and mobile responsiveness.

## Required environment variables

See `.env.example`. Do not expose server secrets using `NEXT_PUBLIC_` variables.

## Production hardening still required before launch

This repository is a substantial implementation starter, not a security-certified or independently audited production release. Before going live:
- Add CAPTCHA/Turnstile and bot detection to public enquiry forms.
- Review rate-limit atomicity and use a managed Redis limiter for high-traffic/serverless production.
- Add admin user management, invitation/reset-password workflow and MFA.
- Configure object storage CORS, lifecycle, access policy and file malware scanning.
- Configure transactional email domain authentication (SPF, DKIM, DMARC) and delivery monitoring.
- Review database backups, point-in-time recovery, migrations and restore drills.
- Add security headers, CSP, dependency scanning and vulnerability review.
- Have company/legal representatives approve privacy notice and data retention.
- Replace draft descriptions and generic stock images with Jtech-approved content.
- Validate all product specifications, safety claims, certifications, customer names, supported brands and GST details before publishing.
- Perform penetration testing and UAT before public launch.

## Important content note

The supplied visiting card describes a mix of technical domains and services. It does not establish detailed product models, manufacturing claims, NDT methods, certifications, performance metrics or client references. All seeded catalogue entries are unpublished drafts pending company verification.
