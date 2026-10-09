# MANUAL ACTIONS & ROTATION CHECKLIST

This document lists critical security actions that **cannot** be executed directly in code and must be manually executed in cloud provider dashboards, third-party consoles, and production infrastructure environments.

---

## 1. Secret & Credential Rotation Checklist

The following secrets and default credentials were discovered in the repository's working tree and Git history. Even after code hardening, **these secrets must be rotated immediately in their respective provider consoles**:

- [ ] **Rotate Neo4j Database Password**
  - **Location**: `docker-compose.yml:51`, `backend/app/core/config.py:60`
  - **Committed Value**: `aios********************` (`aios_neo4j_password_2026`)
  - **Action**: Rotate Neo4j password in Neo4j Aura or deployment server. Update backend environment variables (`NEO4J_PASSWORD`).
- [ ] **Rotate Default PostgreSQL Password**
  - **Location**: `docker-compose.yml:10`, `docker-compose.yml:77`
  - **Committed Value**: `aios*******************` (`aios_secure_pass_2026`)
  - **Action**: Update `POSTGRES_PASSWORD` in the database cluster and deployment environment variables.
- [ ] **Rotate JWT Secret Key (`SECRET_KEY`)**
  - **Location**: `backend/app/core/config.py:21`
  - **Committed Value**: `aios************************************************************` (`aios_super_secret_enterprise_production_key_change_in_prod`)
  - **Action**: Generate a cryptographically random 64-character hex secret (`openssl rand -hex 32`) and set as `SECRET_KEY` in production (e.g. Render/Vercel/K8s). This will invalidate existing test sessions.
- [ ] **Rotate MinIO / S3 Object Storage Keys**
  - **Location**: `docker-compose.yml:64-65`, `backend/app/core/config.py:66-67`
  - **Committed Values**: `aios_minio_admin`, `aios***********************` (`aios_minio_secure_secret`)
  - **Action**: Generate strong random credentials in MinIO/AWS S3 and configure via environment (`MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`).
- [ ] **Rotate Stripe Webhook Secret**
  - **Location**: `backend/app/api/v1/billing.py`
  - **Action**: In the Stripe Dashboard under Developers > Webhooks, rotate the endpoint signing secret and set `STRIPE_WEBHOOK_SECRET` in production backend environment variables.
- [ ] **Rotate Seed / Development User Passwords**
  - **Location**: `backend/app/database/init_db.py`, `frontend/src/pages/LoginPage.tsx`
  - **Committed Values**: `admin@aios.dev` / `Admi********` (`Admin@12345`), `engineer@aios.enterprise` / `Engi************` (`Engineer@12345`)
  - **Action**: Change passwords for any pre-existing user accounts in production databases. Dev account seeding is now permanently gated behind `ENVIRONMENT=development`.
- [ ] **Rotate AI Provider API Keys**
  - **Action**: In OpenAI and Anthropic developer consoles, rotate any keys that may have been previously tested in development and provision new scoped API keys for `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`.

---

## 2. Cloud Provider & Infrastructure Settings Checklist

### A. Vercel Dashboard (`aios-opal.vercel.app`)
- [ ] Verify that **NO** backend secrets (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `POSTGRES_PASSWORD`, `SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are configured in Vercel project environment variables.
- [ ] Ensure only public variables exist (e.g. `VITE_API_URL=https://aios-1-wc28.onrender.com`).
- [ ] In Vercel Project Settings > Security:
  - Enable **Vercel Attack Challenge Mode / Web Application Firewall**.
  - Verify security headers are active (defined in `vercel.json`).

### B. Render / Production Backend Host
- [ ] Set `ENVIRONMENT=production` (enforces startup validation and disables OpenAPI docs /dev seeding).
- [ ] Set `SECRET_KEY` to high-entropy 64-character random hex string (`openssl rand -hex 32`).
- [ ] Set `API_KEY_ENCRYPTION_KEY` to a 32-byte Fernet key:
  ```bash
  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  ```
- [ ] Set `BACKEND_CORS_ORIGINS` strictly to `["https://aios-opal.vercel.app"]`.
- [ ] Ensure `DEBUG=False` and `PYTHON_SANDBOX_ENABLED=False` (or provision a separate gVisor/Firecracker isolated container service for code execution).

### C. OAuth Providers (Google, GitHub, Microsoft)
- [ ] **Google Cloud Console**: Whitelist exact production redirect URI:
  - `https://aios-opal.vercel.app/api/v1/auth/oauth/callback/google`
  - Disallow any wildcard or HTTP URIs.
- [ ] **GitHub Developer Settings**: Configure OAuth app callback URL:
  - `https://aios-opal.vercel.app/api/v1/auth/oauth/callback/github`
- [ ] **Microsoft Entra ID**: Register app redirect URI:
  - `https://aios-opal.vercel.app/api/v1/auth/oauth/callback/microsoft`

### D. Databases & Private Network Peering
- [ ] Ensure Postgres (`5432`), Redis (`6379`), Qdrant (`6333`), and Neo4j (`7687`) are **NOT** bound to public host ports (`0.0.0.0`). Bind exclusively to internal private networks or `127.0.0.1`.
- [ ] Neo4j Aura / Qdrant Cloud: In cloud console, configure IP Allowlist to permit connections only from backend server CIDR blocks.
- [ ] Enable TLS/SSL on all remote managed database connection strings (`sslmode=require`).
- [ ] Configure Redis authentication (`requirepass <strong_password>`).

### E. GitHub Repository Settings
- [ ] Enable **Secret Scanning** and **Push Protection** in GitHub repository security settings.
- [ ] Enable **Dependabot Alerts** and **Dependabot Security Updates**.
- [ ] Enable branch protection rules on `main` branch (require pull request reviews, disallow force-pushing, require CI security workflow checks).
- [ ] Enforce **Two-Factor Authentication (2FA)** for all GitHub organization members and cloud dashboard administrators.

---

## 3. Database Backup & Disaster Recovery Procedures

### PostgreSQL
- **Automated Nightly Backup**:
  ```bash
  pg_dump -U aios_user -d aios_db -Fc -f /backups/postgres/aios_db_$(date +%Y%m%d_%H%M%S).dump
  ```
- **Restore**:
  ```bash
  pg_restore -U aios_user -d aios_db -c -v /backups/postgres/<filename>.dump
  ```

### Neo4j Property Graph
- **Backup**:
  ```bash
  neo4j-admin database dump aios --to-path=/backups/neo4j/
  ```
- **Restore**:
  ```bash
  neo4j-admin database load aios --from-path=/backups/neo4j/ --overwrite-destination=true
  ```

### Qdrant Vector Store
- **Snapshot Creation**:
  ```bash
  curl -X POST "http://localhost:6333/collections/aios_knowledge/snapshots"
  ```
- **Snapshot Restore**:
  ```bash
  curl -X POST "http://localhost:6333/collections/aios_knowledge/snapshots/upload" \
       -H "Content-Type:multipart/form-data" \
       -F "snapshot=@aios_knowledge_snapshot.snapshot"
  ```

---

## 4. Git History Scrubbing Plan (`git-filter-repo`)

> **IMPORTANT**: In accordance with the Rules of Engagement, history rewriting is **NOT** performed automatically. The user must review and approve this command sequence before execution, as rewriting git history changes commit SHAs across all historical commits.

### History Scrubbing Proposal
To permanently remove prior commits that contained sensitive default values or placeholder strings:

1. **Install `git-filter-repo`**:
   ```bash
   pip install git-filter-repo
   ```
2. **Create a fresh mirror/backup of the repository**:
   ```bash
   git clone --mirror https://github.com/harshchavan009/AIOS.git AIOS-backup.git
   ```
3. **Create replacement expressions file `expressions.txt`**:
   ```text
   aios_neo4j_password_2026==>[REDACTED_SECRET]
   aios_secure_pass_2026==>[REDACTED_SECRET]
   aios_super_secret_enterprise_production_key_change_in_prod==>[REDACTED_SECRET]
   aios_minio_secure_secret==>[REDACTED_SECRET]
   Admin@12345==>[REDACTED_PASSWORD]
   Engineer@12345==>[REDACTED_PASSWORD]
   whsec_98a72b1c3d4e5f==>[REDACTED_SECRET]
   aios_live_sec_98a72b1c==>[REDACTED_API_KEY]
   ```
4. **Execute history scrub**:
   ```bash
   git filter-repo --replace-text expressions.txt
   ```
5. **Coordinate with engineering team before force-push**:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

---

## 5. Verification Status

| Item | Status | Verification Detail |
|---|---|---|
| Hardcoded secrets in working tree | **VERIFIED RESOLVED** | Removed and replaced with environment variables |
| Password hashing (bcrypt cost 12, salt) | **VERIFIED RESOLVED** | Verified in `backend/app/core/security.py` & automated tests |
| Account lockout & timing mitigation | **VERIFIED RESOLVED** | Verified in `test_auth.py` and live dynamic curl check |
| Tenant isolation / IDOR prevention | **VERIFIED RESOLVED** | Verified in `test_organization.py` (22 automated tests) |
| File upload magic bytes & size limits | **VERIFIED RESOLVED** | Verified in `test_disallowed_file_upload_rejected` |
| Security headers (HSTS, CSP, COOP) | **VERIFIED RESOLVED** | Verified in `test_security_headers_present` & live curl |
| Rate limiting (429 & Retry-After) | **VERIFIED RESOLVED** | Verified in `test_rate_limiter_brute_force_protection` & live curl |
| Production OpenAPI/docs disabling | **VERIFIED RESOLVED** | Verified conditionally disabled when `ENVIRONMENT=production` |
| Cloud Dashboard Settings & 2FA | **REQUIRES MANUAL ACTION** | Must be configured in Vercel/Render/OAuth/Stripe dashboards |
| Cloud Key Rotation | **REQUIRES MANUAL ACTION** | Must be rotated in provider dashboards as detailed in Section 1 |
| Git History Rewrite | **AWAITING USER APPROVAL** | Prepared in Section 4, not executed without explicit authorization |

---

## 6. Public Launch Configuration Checklist (Gates A to D)

The following items must be configured in external provider dashboards before opening public traffic:

### A. Custom Domain & DNS Settings (Gate A)
1. **DNS Provider (Cloudflare / Route53 / Namecheap / GoDaddy)**:
   - Configure **Apex domain** (`example.com`): `A` record pointing to `76.76.21.21` (Vercel Anycast IP).
   - Configure **Subdomain** (`www.example.com`): `CNAME` record pointing to `cname.vercel-dns.com`.
   - Set single canonical host preference (recommend redirecting `example.com` -> `www.example.com` or vice-versa).
2. **Vercel Project Domains**:
   - In Vercel Project Settings > Domains, add the custom domain and verify SSL certificate issuance.
   - Set up automatic 308 redirect from `aios-opal.vercel.app` to your production domain.
3. **Backend Host (Render / AWS / Fly.io)**:
   - Update `BACKEND_CORS_ORIGINS` environment variable to include the custom production domain: `["https://your-custom-domain.com"]`.

### B. OAuth Provider Redirect URIs
Update client configurations to reflect the custom domain:
- **Google Cloud Console** (APIs & Services > Credentials > OAuth 2.0 Client IDs):
  - Add Authorized Redirect URI: `https://your-custom-domain.com/api/v1/auth/oauth/callback/google`
- **GitHub Developer Settings** (OAuth Apps):
  - Authorization callback URL: `https://your-custom-domain.com/api/v1/auth/oauth/callback/github`
- **Microsoft Entra ID** (App Registrations > Authentication):
  - Add Redirect URI (Web): `https://your-custom-domain.com/api/v1/auth/oauth/callback/microsoft`

### C. Legal Pages & Placeholders Review (Gate D)
> **LEGAL NOTICE**: The drafted `/privacy` and `/terms` pages are comprehensive technical drafts reflecting the actual data architecture of AIOS (incorporating Indian Digital Personal Data Protection Act 2023, EU GDPR, LLM processing by OpenAI/Anthropic/Google, and vector embeddings in Qdrant/Neo4j). However, **these documents are drafts and should be reviewed by a qualified lawyer before official launch**.

The following `[[FILL_ME]]` placeholders must be provided and replaced in production:
- [ ] `[[LEGAL_ENTITY_NAME]]`: Full registered legal name of entity or individual operator.
- [ ] `[[CONTACT_EMAIL]]`: Monitored support and privacy inquiry email (e.g., `support@yourdomain.com`).
- [ ] `[[POSTAL_ADDRESS]]`: Registered business address or headquarters.
- [ ] `[[GOVERNING_JURISDICTION]]`: Jurisdiction for dispute resolution and governing law (e.g., "Courts of Mumbai, India" or "State of Delaware, USA").

*(A build-time guard in `npm run launch:check` verifies that no `[[FILL_ME]]` placeholders exist when running in production mode).*
