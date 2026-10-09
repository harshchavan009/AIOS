# MANUAL ACTIONS & ROTATION CHECKLIST

This document lists critical security actions that **cannot** be executed directly in the repository code and must be manually executed in cloud provider dashboards and infrastructure settings.

---

## 1. Secret Rotation Checklist

The following potential secrets and default credentials were discovered in the repository's working tree and Git history. Even after cleaning history, **these secrets must be rotated immediately in their respective provider consoles**:

- [ ] **Rotate Neo4j Database Password**
  - **Location**: `docker-compose.yml:51`, `backend/app/core/config.py:60`
  - **Committed Value**: `aios********************` (`aios_neo4j_password_2026`)
  - **Action**: Rotate Neo4j password in Neo4j Aura or deployment server. Update backend environment variables.
- [ ] **Rotate Default PostgreSQL Password**
  - **Location**: `docker-compose.yml:10`, `docker-compose.yml:77`
  - **Committed Value**: `aios*******************` (`aios_secure_pass_2026`)
  - **Action**: Update `POSTGRES_PASSWORD` in the database cluster and deployment env vars.
- [ ] **Rotate JWT Secret Key (`SECRET_KEY`)**
  - **Location**: `backend/app/core/config.py:21`
  - **Committed Value**: `aios************************************************************` (`aios_super_secret_enterprise_production_key_change_in_prod`)
  - **Action**: Generate a cryptographically random 64-character hex secret (`openssl rand -hex 32`) and set as `SECRET_KEY` in production (e.g. Render/Vercel/K8s). This will invalidate existing sessions.
- [ ] **Rotate MinIO Object Storage Keys**
  - **Location**: `docker-compose.yml:64-65`, `backend/app/core/config.py:66-67`
  - **Committed Values**: `aios_minio_admin`, `aios***********************` (`aios_minio_secure_secret`)
  - **Action**: Generate strong credentials in MinIO/S3 and configure via environment.
- [ ] **Rotate Seed Admin Credentials**
  - **Location**: `backend/app/database/init_db.py:62,86`, `frontend/src/pages/LoginPage.tsx:239-240`
  - **Committed Values**: `admin@aios.dev` / `Admi********` (`Admin@12345`), `engineer@aios.enterprise` / `Engi************` (`Engineer@12345`)
  - **Action**: Change the production password for any live user account with email `admin@aios.dev` or `engineer@aios.enterprise`.
- [ ] **Rotate Webhook Signer Secrets**
  - **Location**: `frontend/src/pages/SettingsPage.tsx:180`
  - **Committed Value**: `whse******************` (`whsec_98a72b1c3d4e5f`)
  - **Action**: Rotate webhook signing keys on target endpoint services.

---

## 2. Git History Scrubbing Plan (`git-filter-repo`)

> **IMPORTANT**: As per Rules of Engagement, history rewriting is **NOT** performed automatically. The user must review and approve this command sequence before execution, as rewriting git history alters commit SHAs and requires force-pushing to remote branches.

### History Scrubbing Proposal
To permanently remove previous commits that referenced placeholder keys or sensitive defaults from git history:

1. **Install `git-filter-repo`**:
   ```bash
   pip install git-filter-repo
   ```
2. **Create a fresh mirror/backup of the repository**:
   ```bash
   git clone --mirror https://github.com/harshchavan009/AIOS.git AIOS-backup.git
   ```
3. **Run replacement/filtering expressions**:
   Create `expressions.txt`:
   ```text
   aios_neo4j_password_2026==>[REDACTED_SECRET]
   aios_secure_pass_2026==>[REDACTED_SECRET]
   aios_super_secret_enterprise_production_key_change_in_prod==>[REDACTED_SECRET]
   aios_minio_secure_secret==>[REDACTED_SECRET]
   Admin@12345==>[REDACTED_PASSWORD]
   Engineer@12345==>[REDACTED_PASSWORD]
   whsec_98a72b1c3d4e5f==>[REDACTED_SECRET]
   ```
4. **Execute history scrub**:
   ```bash
   git filter-repo --replace-text expressions.txt
   ```
5. **Coordinate with team before force-push**:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

---

## 3. Cloud Provider & Infrastructure Settings Checklist

- [ ] **Vercel Dashboard (`aios-opal.vercel.app`)**:
  - Add backend proxy environment variable `VITE_DEV_BACKEND_URL` and `VITE_API_URL` to point to production backend.
  - Verify that **NO** backend secrets (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `POSTGRES_PASSWORD`, `SECRET_KEY`) are defined in Vercel environment variables under `VITE_` prefixes.
  - Enable Vercel Attack Challenge Mode / Rate Limiting in Security settings.
- [ ] **Render / Cloud Backend Environment**:
  - Set `ENVIRONMENT=production` (disables all automatic dev seeding).
  - Set `SECRET_KEY` to high-entropy 64-char random hex string.
  - Set `DEBUG=False`.
  - Set `BACKEND_CORS_ORIGINS` strictly to `["https://aios-opal.vercel.app"]`.
  - Set `API_KEY_ENCRYPTION_KEY` to a 32-byte url-safe base64 key (`python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`).
- [ ] **Database & Network Exposure**:
  - In production docker-compose or Kubernetes, ensure ports `5432` (Postgres), `6379` (Redis), `6333` (Qdrant), and `7687` (Neo4j) are **NOT** bound to `0.0.0.0` on the public host. Bind them only to internal bridge network (`127.0.0.1` or internal Docker network).
  - Enable authentication with strong passwords for Redis (`requirepass`).
  - Configure TLS for PostgreSQL, Neo4j, and Qdrant.
- [ ] **GitHub Repository Settings**:
  - Enable **Secret Scanning** and **Push Protection** in GitHub repository settings.
  - Enable **Dependabot Alerts** and **Dependabot Security Updates**.
  - Enable branch protection rules on `main` (require PR reviews and status checks to pass before merging).
