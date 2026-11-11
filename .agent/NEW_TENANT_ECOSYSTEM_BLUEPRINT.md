# 🚀 ORIGINZERO & PRINPREAJMA.RO — MASTER BLUEPRINT PENTRU TENANT / PROIECT NOU
> **FIȘIER UNIC DE INSTRUIRE PENTRU ORICE LLM / AGENT AI AL UNUI PROIECT NOU**  
> **Utilizare:** Oferă acest fișier (sau copiază-l în rădăcina noului proiect ca `ECOSYSTEM_BLUEPRINT.md`) agentului AI care construiește un site de client (`<slug>.prinpreajma.ro`) sau o aplicație nouă de platformă. Conține **100% din arhitectura, legile, șabloanele de fișiere și procedura exactă de provizionare** din ecosistemul **OriginZero Hosting**.

---

## 1. HARTA COMPLETĂ A ECOSISTEMULUI (CUM FUNCȚIONEAZĂ TOTUL)

Nu construiești o aplicație izolată, ci un **nod multi-tenant standardizat** în ecosistemul `OriginZero` + portalul regional `prinPreajma.ro`:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       ARHITECTURA MULTI-MEDIU ORIGINZERO & PRINPREAJMA.RO                       │
├──────────────────────────────┬─────────────────────────────────┬────────────────────────────────┤
│ 1. MAC WORKSTATION (DEV)     │ 2. HETZNER CLOUD cax21 (PROD)   │ 3. PROXMOX CLUSTER & CDN       │
│ Unde lucrează LLM-ul         │ IP: 2.31.102.36 (ARM64 Ampere)  │ • VM1 (192.168.57.51, AMD64):  │
│ proiectului nou:             │ IPv6: 2a01:4f8:c016:f3bb::1     │   DEV/Staging & Warm Standby   │
│ • Cale tenanți regionali:    │ • 100% Trafic Public Live HTTPS │   Bind: 0.0.0.0:<PORT>         │
│   tenants/<JUDET>/<NNN-Slug> │ • Bind STRICT: 127.0.0.1:<PORT> │ • VM3 (192.168.57.105):        │
│ • Cale aplicații platformă:  │ • Docker Bridge izolat per site │   Nginx SSL (DOAR la           │
│   apps/<slug>                │ • CapDrop: [ALL] + UID 1000     │   onboarding inițial!)         │
│ • Scrie cod, testează local  │ • Nginx 1.24 + TLSv1.3 + HSTS   │ • Hostico Media CDN:           │
│ • Push EXCLUSIV pe GitHub    │ • GitOps Poller (60s) / Webhook │   media-hostico.prinpreajma.ro │
│   (INTERZIS scp/rsync cod!)  │ • BKP imutabil ÎNAINTE de pull! │   FTPS Port 21 (fără media     │
│                              │                                 │   grea >500KB în Git!)         │
└──────────────────────────────┴─────────────────────────────────┴────────────────────────────────┘
```

### ⚖️ Delimitarea Strictă a Rolurilor între Agenți (STRICT RULE 5)
1. **TU (Agentul LLM al Noului Proiect pe macOS):**
   - Creezi codul aplicației, designul premium (Vanilla CSS / Next.js / Node.js), baza de date, endpoint-ul `/api/health`, SEO/JSON-LD și toate cele **7 Porți GitOps** în directorul proiectului (`tenants/<JUDET>/<NNN-Nume>/` sau `apps/<slug>/`).
   - Încarci fișierele media mari (>500KB) pe **Hostico Media CDN** (`https://media-hostico.prinpreajma.ro`).
   - Faci `git commit` și `git push origin main` pe GitHub.
   - La final, generezi **Pachetul Standard de Handoff pentru Provizionare** (Secțiunea 7) către Agentul de Hosting.
   - **INTERZIS:** Nu copiezi niciodată cod pe servere prin `scp`/`rsync`/`sftp`, nu comiți `.env` în Git, nu hardcodezi porturi/IP-uri ale altor chiriași și nu modifici direct Nginx pe serverele de producție fără aprobare umană.
2. **Agentul de Infrastructură & Hosting (`proxmox-hosting&staff`):**
   - Alocă dinamic portul liber pe Hetzner (`2.31.102.36`) / VM1 (`192.168.57.51`), configurează cheia SSH GitHub Deploy Key, livrează `.env.<slug>` securizat (`chmod 0600`), provizionează vhost-ul Nginx + certificatul Let's Encrypt SSL fără downtime, înregistrează subdomeniul în `ethicalHacking/.env` și în `<sitemapindex>`-ul `prinpreajma.ro`, rulează cele 13 module de audit și declanșează indexarea în Google Search Console & IndexNow.

---

## 2. CELE 8 LEGI NON-NEGOCIABILE ALE PLATFORMEI

1. **STRICT RULE 1 — Zero Hardcodare:** Portul aplicației se citește din `process.env.PORT` (ex. default `3000` intern în container), iar URL-ul public din `process.env.NEXT_PUBLIC_SITE_URL` / `PUBLIC_URL`.
2. **STRICT RULE 2 — GitHub-Only Sync (Zero-Local-Copy):** Livrarea codului în hosting se face **100% prin GitHub (`origin/main`)**. Zero `scp`/`rsync` de cod sursă sau build-uri.
3. **STRICT RULE 3 — Secrete Izolate (`0600`):** Niciun secret, cheie API sau parolă SMTP/DB în cod sau în Git. Creezi doar `.env.example` în repo; valorile reale stau în `secrets/.env.<slug>` (`chmod 0600`) și se transmit exclusiv prin tunel SSH securizat.
4. **STRICT RULE 4 — Înregistrare Obligatorie în Ethical Hacking:** Niciun subdomeniu nu intră în trafic live înainte de a fi adăugat în `ethicalHacking/.env` și certificat cu **`100 / 100`** la scanarea de securitate.
5. **STRICT RULE 6 — Zero Pierderi de Date (`BKP PRIOR UPDATE`):** În `deploy-gitops.sh`, înainte de orice `git reset --hard origin/main`, migrare sau rebuild pe producție, se creează obligatoriu un backup timestampat imutabil (`.bak_<timestamp>` pentru SQLite/JSON sau `pg_dump` pentru PostgreSQL). Directorul `data/` are `chmod -R 0777` pe gazdă pentru ca userul non-root `node` (`UID 1000`) din container să nu primească niciodată `SQLITE_READONLY (1544)`.
6. **STRICT RULE 7 — Zero Nginx Touch la Sync:** Reverse proxy-ul Nginx (pe Hetzner sau VM3) se configurează **o singură dată la provizionarea inițială**. Actualizările ulterioare de cod reconstruiesc doar containerul local.
7. **STRICT RULE 8 — Standardul SEO Salon Sandy & Paritate 1:1 Googlebot WRS Chromium (`--dump-dom`):**
   - Sitemap curat la `/sitemap.xml` (`xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`), cu **trailing slash obligatoriu pe rădăcină** (`https://<slug>.prinpreajma.ro/`), dată strict `YYYY-MM-DD`, zero `&` neevadat, zero `<image:image>`, zero `sitemap.xsl`.
   - **CRITIC PENTRU NEXT.JS / REACT:** Atât HTML-ul SSR, cât și DOM-ul hidratat în Headless Chromium (`self.__next_f.push` RSC Flight) **TREBUIE să emită exact 1 tag `<link rel="canonical">`** identic caracter-cu-caracter cu `<loc>` din `sitemap.xml` (cu `/` la final pe rădăcină: `https://<slug>.prinpreajma.ro/`, niciodată fără `/` și niciodată `/ro` pe `/`)! Două tag-uri canonical diferite anulează indexarea în Google!
8. **BLUE TEAM / SECOPS HARDENING:** Container rootless (`USER node`, UID 1000), `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, rețea Docker bridge proprie (`<slug>-net`), dezactivare `X-Powered-By`, protecție anti-SQLi și sanitizare Zero-Trust a logurilor/inputurilor.

---

## 3. ARHITECTURA DE FIȘIERE OBLIGATORIE (CELE 7 PORȚI GITOPS)

Sentinelul automat [`scripts/audit-tenant-fleet-gitops.js`](../scripts/audit-tenant-fleet-gitops.js) scanează săptămânal fiecare proiect și verifică determinist **7 Porți de Calitate**. Proiectul tău TREBUIE să conțină în rădăcină această structură:

```text
<NNN-NumeTenant>/
├── GEMINI.md                # [Poarta 5] Trebuie să conțină header-ul: ORIGINZERO GITOPS ALIGNMENT DIRECTIVE
├── GITOPS_INSTRUCTION.md    # [Poarta 1] Conține RUNTIME ENVIRONMENT AWARENESS, BKP PRIOR UPDATE, SALONSANDY
├── sync-gitops.sh           # [Poarta 2] Script executabil (chmod 0755) — Protocolul Triplu de Sync
├── deploy-gitops.sh         # [Poarta 3] Script executabil (chmod 0755) — Backup + Pull + Sitemap Guard + Build + Health
├── package.json             # [Poarta 4] Conține obligatoriu în "scripts": { "gitops:sync": "./sync-gitops.sh" }
├── .gitignore               # [Poarta 6] Exclude obligatoriu .env, .env.*, *.db, *.sqlite*, *.bak*, node_modules
├── .dockerignore            # Exclude .git, node_modules, .next, .env*, *.bak*
├── Dockerfile               # Multi-stage ARM64/AMD64 compatibil (node:20-bookworm-slim, USER node UID 1000)
├── docker-compose.yml       # Bind variabil ${BIND_IP:-127.0.0.1}:${PORT}:3000, cap_drop: [ALL], unless-stopped
├── .env.example             # Documentația variabilelor necesare (fără secrete reale!)
├── public/
│   ├── robots.txt           # User-agent: Googlebot Allow: / + Sitemap: https://<slug>.prinpreajma.ro/sitemap.xml
│   └── llms.txt             # Rezumat structurat GEO (Generative Engine Optimization) al afacerii
└── app/ (sau src/)          # Sitemap dinamic/static la /sitemap.xml + Healthcheck la /api/health
```

---

## 4. ȘABLOANE GATA DE COPIAT ÎN PROIECTUL NOU

Înlocuiește `<slug>` (ex: `cofetaria-ana`), `<PORT>` (ex: `3040`, confirmat la provizionare) și `<NUME_AFACERE>` în fișierele de mai jos:

### 4.1 Poarta 5: Antet obligatoriu în `GEMINI.md`
```markdown
# ORIGINZERO GITOPS ALIGNMENT DIRECTIVE
- **Tenant FQDN:** `https://<slug>.prinpreajma.ro/`
- **GitOps Sync:** `npm run gitops:sync` (`./sync-gitops.sh`) — Zero-Local-Copy (GitHub `origin/main` only).
- **Secrets Policy:** `.env` este STRICT interzis în Git; livrare exclusivă prin SSH (`chmod 0600`).
- **Media CDN:** Imagini >500KB, video și audio stau pe `https://media-hostico.prinpreajma.ro/pictures/<slug>/`.
- **Database Safety:** Backup imutabil `.bak_<timestamp>` obligatoriu înainte de orice deploy în producție.
- **SEO & WRS Canonical:** Rădăcina folosește obligatoriu slash final `https://<slug>.prinpreajma.ro/` în `sitemap.xml` și în `<link rel="canonical">` (SSR + Next.js RSC).
```

### 4.2 Poarta 1: `GITOPS_INSTRUCTION.md`
```markdown
# ORIGINZERO — GITOPS INSTRUCTION (`<slug>.prinpreajma.ro`)

## 1. RUNTIME ENVIRONMENT AWARENESS
Orice script sau agent detectează automat mașina pe care rulează:
- `HETZNER_MAIN_PRODUCTION` (`2.31.102.36`, `aarch64`): Producție Live. **REGULA STRICTĂ BKP PRIOR UPDATE** (`.bak_<timestamp>` înainte de `git pull`/rebuild). Bind `127.0.0.1:<PORT>`.
- `PROXMOX_VM1_DEV_STANDBY` (`192.168.57.51`, `x86_64`): DEV/Staging & Warm Standby. Zero interferență cu alte containere DEV. Bind `0.0.0.0:<PORT>`.
- `MAC_LOCAL_DEVELOPMENT` (`Darwin`): Dezvoltare locală. Push exclusiv în GitHub `origin/main`; secrete transmise prin SSH (`0600`).

## 2. STANDARDUL CANONIC SALONSANDY (`sitemaps.org/schemas/sitemap/0.9`)
- `https://<slug>.prinpreajma.ro/sitemap.xml` respectă schema `http://www.sitemaps.org/schemas/sitemap/0.9`:
  - Trailing slash pe rădăcină: `<loc>https://<slug>.prinpreajma.ro/</loc>`
  - Dată strict `YYYY-MM-DD`, zero `&` neevadat, zero `<image:image>`, zero `sitemap.xsl`.
  - Paritate 1:1 `<link rel="canonical">` în SSR HTML și în Headless Chromium WRS post-JS.
```

### 4.3 Poarta 2: `sync-gitops.sh` (`chmod 0755 sync-gitops.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

TENANT_SLUG="<slug>"
CURRENT_OS="$(uname -s)"
CURRENT_ARCH="$(uname -m)"
CURRENT_HOST="$(hostname 2>/dev/null || uname -n)"

if [[ "$CURRENT_ARCH" == "aarch64" ]] && [[ "$CURRENT_OS" == "Linux" ]]; then
  ENV_MODE="HETZNER_MAIN_PRODUCTION"
elif [[ "$CURRENT_ARCH" == "x86_64" ]] && [[ "$CURRENT_OS" == "Linux" ]]; then
  ENV_MODE="PROXMOX_VM1_DEV_STANDBY"
else
  ENV_MODE="MAC_LOCAL_DEVELOPMENT"
fi

echo "================================================================================"
echo "🚀 ORIGINZERO GITOPS SYNC — Tenant: ${TENANT_SLUG} | Env: ${ENV_MODE} (${CURRENT_HOST})"
echo "   Rules: Zero-Local-Copy | Zero .env in Git | Hostico CDN | BKP Prior Update"
echo "================================================================================"

# Poarta 1: Blocare scurgere secrete .env în Git
if git status --porcelain | grep -E '(^|\s)\.env($|\.)' | grep -v '\.env\.example'; then
  echo "❌ [BLOCAT] S-a detectat un fișier .env în Git! Mută-l în secrets/ și adaugă-l în .gitignore."
  exit 1
fi

# Poarta 2: Avertisment fișiere media grele (> 2MB)
LARGE_FILES=$(find . -maxdepth 4 -not -path '*/.*' -not -path './node_modules/*' -not -path './data/*' -type f -size +2M || true)
if [[ -n "$LARGE_FILES" ]]; then
  echo "⚠️  [ATENȚIE MEDIA] Fișiere >2MB detectate (urcă-le pe https://media-hostico.prinpreajma.ro):"
  echo "$LARGE_FILES"
fi

if [[ "$ENV_MODE" == "MAC_LOCAL_DEVELOPMENT" ]]; then
  echo "✅ [Mac Dev] Verificările GitOps au trecut. Rulează git commit & git push origin main."
else
  exec ./deploy-gitops.sh
fi
```

### 4.4 Poarta 3: `deploy-gitops.sh` (`chmod 0755 deploy-gitops.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

TENANT_SLUG="<slug>"
CONTAINER_NAME="originzero-tenant-${TENANT_SLUG}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 [GitOps Deploy] ${TENANT_SLUG}.prinpreajma.ro pornit la ${TIMESTAMP}..."

# 1. Backup Tranzacțional Obligatoriu ÎNAINTE de update (STRICT RULE 6)
mkdir -p data backups
if ls data/*.db data/*.sqlite data/*.json >/dev/null 2>&1; then
  tar -czf "backups/data_bak_${TIMESTAMP}.tar.gz" data/
  echo "📦 Backup imutabil creat: backups/data_bak_${TIMESTAMP}.tar.gz"
fi

# 2. Preluare cod din GitHub & Sanitizare Sitemap
git fetch origin main
git reset --hard origin/main
if [[ -f /opt/originzero-gitops/enforce-sitemap-compliance.py ]]; then
  python3 /opt/originzero-gitops/enforce-sitemap-compliance.py .
fi

# 3. Permisiuni volum persistent pentru UID 1000 (previne SQLite error 1544)
chmod -R 0777 data

# 4. Build multi-arch nativ & Recreare Atomică
docker compose build --pull=false
docker compose up -d --force-recreate --remove-orphans

# 5. Poartă Healthcheck cu Rollback Automat
for i in {1..20}; do
  STATUS=$(docker inspect --format '{{.State.Status}}:{{if .State.Health}}{{.State.Health.Status}}{{else}}ok{{end}}' "${CONTAINER_NAME}" 2>/dev/null || echo "starting")
  if [[ "$STATUS" == "running:healthy" || "$STATUS" == "running:ok" ]]; then
    echo "✅ [SUCCESS] ${CONTAINER_NAME} este activ și sănătos (${STATUS})!"
    exit 0
  fi
  sleep 2
done

echo "❌ [EROARE] Healthcheck eșuat pe ${CONTAINER_NAME}!"
docker logs --tail 40 "${CONTAINER_NAME}" || true
exit 1
```

### 4.5 `Dockerfile` & `docker-compose.yml` (Hardening Blue Team `CapDrop: [ALL]` + Rootless UID 1000)

**`Dockerfile` (exemplu Next.js Standalone / Node.js 20 LTS):**
```dockerfile
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=node:node /app ./
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

**`docker-compose.yml`:**
```yaml
services:
  app:
    build: .
    image: originzero-${TENANT_SLUG:-<slug>}:latest
    container_name: originzero-tenant-<slug>
    restart: unless-stopped
    env_file:
      - /home/antigravity/secrets/.env.<slug>
    ports:
      - "${BIND_IP:-127.0.0.1}:${HOST_PORT:-<PORT>}:3000"
    volumes:
      - ./data:/app/data
    networks:
      - <slug>-net
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
          pids: 64
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://127.0.0.1:3000/api/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3

networks:
  <slug>-net:
    driver: bridge
```

---

## 5. CERINȚE OBLIGATORII ÎN CODUL APLICAȚIEI (SEO, WRS, CWV 2026, CDN & SECURITATE)

Construiește din start aceste 6 elemente în aplicație pentru a obține **`100 / 100`** din prima la toate auditurile automate:

1. **Healthcheck Endpoint (`/api/health`):**
   - Returnează `HTTP 200 OK` cu `{"status":"ok","tenant":"<slug>"}` în `< 100ms`.
2. **Next.js / HTML Canonical Paritate 1:1 (Anti-Dublare WRS Chromium):**
   - În Next.js `app/layout.tsx`, dezactivează `x-powered-by` în `next.config` (`poweredByHeader: false`) și definește pe fiecare pagină canonicalul exact cu slash pe rădăcină:
     ```ts
     export const metadata: Metadata = {
       metadataBase: new URL('https://<slug>.prinpreajma.ro'),
       alternates: { canonical: 'https://<slug>.prinpreajma.ro/' }, // pe subpagini: 'https://<slug>.prinpreajma.ro/servicii'
     };
     ```
   - **Zero Pagini Orfane:** Fiecare URL prezent în `/sitemap.xml` TREBUIE să aibă cel puțin un link `<a href="...">` randat pe server în HTML-ul paginii principale/meniului/footer-ului.
   - **Header Cache HTML:** Folosește `Cache-Control: public, max-age=0, must-revalidate` pe rutele HTML publice (niciodată `no-store`, care degradează indexarea).
3. **Legătura de Cluster Local & Schema JSON-LD (`LocalBusiness` / Google Business Profile):**
   - Include în `<head>` un bloc `<script type="application/ld+json">` cu `@type` specific (`LocalBusiness`, `Restaurant`, `HairSalon`, `VeterinaryCare`, `Store`, `LodgingBusiness`), `"url": "https://<slug>.prinpreajma.ro/"`, `telephone`, `address`, `geo`, `hasMap` și `sameAs` (pagina Google Maps / Facebook + `"https://prinpreajma.ro/"`).
   - Include în footer un link *dofollow* discret către portalul mamă: `<a href="https://prinpreajma.ro/">Partener prinPreajma.ro</a>`.
4. **Google Core Web Vitals (2026):**
   - Imaginea principală Hero (LCP) are obligatoriu `fetchpriority="high"`, `decoding="async"` și **NU are `loading="lazy"`**.
   - Toate imaginile au `width` și `height` explicite (sau `aspect-ratio`) pentru `CLS = 0`.
   - Dacă folosești SQLite (`better-sqlite3`), activează la conexiune:
     `db.pragma('journal_mode = WAL'); db.pragma('synchronous = NORMAL');`
5. **Hostico Media Storage CDN (`https://media-hostico.prinpreajma.ro`):**
   - Orice imagine >500KB (convertită `.webp`), video (`.mp4`) sau audio se încarcă pe CDN și se referențiază prin `https://media-hostico.prinpreajma.ro/pictures/<slug>/<fisier>.webp`:
     ```bash
     curl --ftp-ssl --user "$HOSTICO_FTP_USER:$HOSTICO_FTP_PASS" \
       -T imagine.webp "ftp://media-hostico.prinpreajma.ro/public_html/pictures/<slug>/imagine.webp"
     ```
6. **CSP Compatibil GA4 Regional UE (dacă se folosește Google Analytics `G-*`):**
   - Dacă aplicația setează `Content-Security-Policy`, include în `connect-src`:
     `https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`.

---

## 6. PROCEDURA END-TO-END DE PROVIZIONARE A UNUI TENANT NOU

### Faza A — Executată de TINE (LLM-ul Noului Proiect pe macOS)
1. Plasează proiectul în `tenants/<COD_JUDET>/<NNN-NumeTenant>/` (ex: `tenants/AR/007-Cofetaria-Ana/`) sau `apps/<slug>/` pentru aplicații de platformă.
2. Generează aplicația + toate cele **7 Porți GitOps** din Secțiunea 4 (`chmod +x sync-gitops.sh deploy-gitops.sh`).
3. Testează local build-ul, endpoint-ul `/api/health`, `/sitemap.xml`, `/robots.txt` și verifică cu `./sync-gitops.sh` că toate porțile trec.
4. Salvează variabilele de producție în `proxmox-hosting&staff/secrets/.env.<slug>` (`chmod 0600`) și împinge codul curat în repository-ul GitHub dedicat (`seboriginzero/<slug>.prinpreajma.ro`, branch `main`).
5. Emite **Pachetul de Handoff** (Secțiunea 7) către Agentul de Hosting.

### Faza B — Executată de Agentul de Hosting (`proxmox-hosting&staff` pe Hetzner `2.31.102.36`)
*(Referință operațională exactă a ecosistemului pentru provizionare Zero-Downtime)*:
1. **Descoperire Dinamică Port Liber (`STRICT RULE 3`):**
   ```bash
   ssh antigravity@2.31.102.36 "ss -tulnp | grep -E '127\.0\.0\.1:30[0-9]{2}'"
   # Se alege următorul port liber (ex: 3040)
   ```
2. **Livrare Secrete (`0600`) & Clonare GitOps pe Hetzner (`2.31.102.36`):**
   ```bash
   cat secrets/.env.<slug> | ssh antigravity@2.31.102.36 "cat > /home/antigravity/secrets/.env.<slug> && chmod 600 /home/antigravity/secrets/.env.<slug>"
   ssh antigravity@2.31.102.36 "git clone git@github-<slug>:seboriginzero/<slug>.prinpreajma.ro.git /home/antigravity/tenants/<slug> && cd /home/antigravity/tenants/<slug> && HOST_PORT=<PORT> BIND_IP=127.0.0.1 ./deploy-gitops.sh"
   ```
3. **Validare DNS Pre-Flight (`A` / `CNAME` -> `2.31.102.36`) & Provizionare Nginx + SSL Let's Encrypt (`--webroot`, Zero Downtime):**
   ```bash
   dig +short <slug>.prinpreajma.ro
   ./hetzner-vm/manage_domain.sh create <slug>.prinpreajma.ro 127.0.0.1:<PORT> --websocket 1 --http2 1 --hsts 1
   # (Dacă se provizionează pe Proxmox VM1/VM3: /opt/originzero/bin/oz-domain-adapter create <slug>.prinpreajma.ro <PORT> --websocket 1 --http2 1)
   ```
4. **Înregistrare Obligatorie în Guvernanța Platformei (`STRICT RULE 4 & 8`):**
   - Adăugare `SUBDOMAINX="<slug>.prinpreajma.ro"` (sau `APPX="..."`) în `ethicalHacking/.env`.
   - Adăugare în `hetzner-vm/.tenants-hetzner-vm` (doar după ce este LIVE activ pe Hetzner).
   - Adăugare `<sitemap><loc>https://<slug>.prinpreajma.ro/sitemap.xml</loc>...</sitemap>` în `prinpreajma.ro/sitemap.xml` (`<sitemapindex>`) și card cu slash final `https://<slug>.prinpreajma.ro/` în `prinpreajma.ro/data/index.json`.
5. **Certificare Completă de Securitate, SEO, WRS, Performanță & Indexare:**
   ```bash
   node scripts/audit-tenant-fleet-gitops.js                       # Validează 7/7 Porți GitOps + inventar dinamic
   node ethicalHacking/scripts/runner.js <slug>.prinpreajma.ro     # Certificare DAST & Runtime -> 100/100
   node ethicalHacking/scripts/audit-seo-crawlers.js <slug>.prinpreajma.ro  # Certificare Sitemap & Canonical -> 100/100
   node ethicalHacking/scripts/audit-blue-team-secops.js <slug>.prinpreajma.ro # Certificare L3/L4/L7 & CapDrop -> 100/100
   node ethicalHacking/scripts/audit-performance.js <slug>.prinpreajma.ro   # Certificare Core Web Vitals 2026
   node scripts/submit-instant-indexing.js <slug>                  # Înregistrare GSC Property + Sitemap + IndexNow + WRS Check
   ```
   *(Notă finală GSC: după rularea `submit-instant-indexing.js <slug>`, operatorul apasă o singură dată **Request Indexing** pe `https://<slug>.prinpreajma.ro/` în Google Search Console UI pentru crawl `Googlebot/2.1` în `< 2 minute`, deoarece API-ul `indexing.googleapis.com` declanșează crawl instantaneu doar pentru scheme `JobPosting`/`BroadcastEvent`).*

---

## 7. FORMATUL PACHETULUI DE HANDOFF (PE CARE ÎL GENEREZI CÂND TERMINI CODUL)

Când ai terminat dezvoltarea proiectului nou și ai făcut `git push origin main`, livrează utilizatorului acest rezumat gata de trimis Agentului de Hosting:

```yaml
ORIGINZERO_NEW_TENANT_HANDOFF:
  entity_type: "TENANT" # sau "APPLICATION"
  county_code: "<AR|TM|BH|HD|...>"
  local_path: "tenants/<JUDET>/<NNN-NumeTenant>"
  slug: "<slug>"
  fqdn: "<slug>.prinpreajma.ro"
  canonical_root: "https://<slug>.prinpreajma.ro/"
  github_repo: "git@github.com:seboriginzero/<slug>.prinpreajma.ro.git"
  branch: "main"
  internal_container_port: 3000
  healthcheck_path: "/api/health"
  sitemap_path: "/sitemap.xml"
  database_type: "sqlite_wal | postgres | json | static"
  persistent_volumes:
    - "./data:/app/data" # chmod 0777 pe host
  secrets_file_local: "proxmox-hosting&staff/secrets/.env.<slug>"
  hostico_cdn_prefix: "https://media-hostico.prinpreajma.ro/pictures/<slug>/"
  gitops_7_gates_verified: true
```
