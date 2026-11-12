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
   - Încarci fișierele media mari (>500KB) prin FTPS Explicit TLS (Port 21) în `tenants/<slug>/` și le validezi pe HTTPS pe **Hostico Media CDN** (`https://media-hostico.prinpreajma.ro/tenants/<slug>/` — vezi **Secțiunea 6**).
   - Faci `git commit` și `git push origin main` pe GitHub.
   - La final, generezi **Pachetul Standard de Handoff pentru Provizionare** (**Secțiunea 8**) sau execuți direct procedura de provizionare (**Secțiunea 7**) dacă operatorul îți aprobă accesul SSH la hosting.
   - **INTERZIS:** Nu copiezi niciodată cod pe servere prin `scp`/`rsync`/`sftp`, nu comiți `.env` în Git, nu hardcodezi porturi/IP-uri ale altor chiriași și nu modifici direct Nginx pe serverele de producție fără aprobare umană.
2. **Agentul de Infrastructură & Hosting (`proxmox-hosting&staff`):**
   - Alocă dinamic portul liber pe Hetzner (`2.31.102.36`) / VM1 (`192.168.57.51`), configurează cheia SSH GitHub Deploy Key, livrează `.env.<slug>` securizat (`chmod 0600`), provizionează vhost-ul Nginx + certificatul Let's Encrypt SSL fără downtime, înregistrează subdomeniul în `ethicalHacking/.env` și în `<sitemapindex>`-ul `prinpreajma.ro`, rulează cele 13 module de audit și declanșează indexarea în Google Search Console & IndexNow.

---

## 2. CELE 9 LEGI NON-NEGOCIABILE ALE PLATFORMEI

1. **STRICT RULE 1 — Zero Hardcodare:** Portul aplicației se citește din `process.env.PORT` (ex. default `3000` intern în container), iar URL-ul public din `process.env.NEXT_PUBLIC_SITE_URL` / `PUBLIC_URL`.
2. **STRICT RULE 2 — GitHub-Only Sync & HTTPS Autonomous Clone (Zero-Local-Copy):**
   - **ESTE STRICT INTERZISĂ COPIEREA DIRECTĂ PE VM (`scp`, `rsync`, `docker cp` de cod sursă sau build-uri de pe mașina de dev).**
   - Livrarea codului în hosting se face **100% prin GitHub (`origin/main`)**.
   - **Pre-condiție critică:** Depozitul `seboriginzero/<slug>.prinpreajma.ro` TREBUIE creat pe GitHub (ca depozit public) ÎNAINTE de lansarea sincronizării.
   - **Protocolul oficial de clonare pe VM:** Serverele de hosting (Hetzner / Proxmox VM1) clonează și actualizează exclusiv prin **HTTPS Public Origin** (`https://github.com/seboriginzero/<slug>.prinpreajma.ro.git`). Astfel, procesul GitOps rulează 100% autonom, fără configurare manuală de SSH Deploy Keys per tenant.
   - Dezvoltatorul pe Mac efectuează push prin SSH (`git@github.com:seboriginzero/<slug>.prinpreajma.ro.git`), iar serverul de hosting execută `git fetch --prune origin && git reset --hard origin/main`.
3. **STRICT RULE 3 — Secrete Izolate (`0600`):** Niciun secret, cheie API sau parolă SMTP/DB în cod sau în Git. Creezi doar `.env.example` în repo; valorile reale stau în `secrets/.env.<slug>` (`chmod 0600`) și se transmit exclusiv prin tunel SSH securizat (singura operațiune directă de transfer permisă).
4. **STRICT RULE 4 — Înregistrare Obligatorie în Ethical Hacking:** Niciun subdomeniu nu intră în trafic live înainte de a fi adăugat în `ethicalHacking/.env` și certificat cu **`100 / 100`** la scanarea de securitate.
5. **STRICT RULE 6 — Zero Pierderi de Date (`BKP PRIOR UPDATE`):** În `deploy-gitops.sh`, înainte de orice `git reset --hard origin/main`, migrare sau rebuild pe producție, se creează obligatoriu un backup timestampat imutabil (`.bak_<timestamp>` pentru SQLite/JSON sau `pg_dump` pentru PostgreSQL). Directorul `data/` are `chmod -R 0777` pe gazdă pentru ca userul non-root `node` (`UID 1000`) din container să nu primească niciodată `SQLITE_READONLY (1544)`.
6. **STRICT RULE 7 — Zero Nginx Touch la Sync:** Reverse proxy-ul Nginx (pe Hetzner sau VM3) se configurează **o singură dată la provizionarea inițială**. Actualizările ulterioare de cod reconstruiesc doar containerul local.
7. **STRICT RULE 8 — Standardul SEO Salon Sandy & Paritate 1:1 Googlebot WRS Chromium (`--dump-dom`):**
   - Sitemap curat la `/sitemap.xml` (`xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`), cu **trailing slash obligatoriu pe rădăcină** (`https://<slug>.prinpreajma.ro/`), dată strict `YYYY-MM-DD`, zero `&` neevadat, zero `<image:image>`, zero `sitemap.xsl`.
   - **CRITIC PENTRU NEXT.JS / REACT:** Atât HTML-ul SSR, cât și DOM-ul hidratat în Headless Chromium (`self.__next_f.push` RSC Flight) **TREBUIE să emită exact 1 tag `<link rel="canonical">`** identic caracter-cu-caracter cu `<loc>` din `sitemap.xml` (cu `/` la final pe rădăcină: `https://<slug>.prinpreajma.ro/`, niciodată fără `/` și niciodată `/ro` pe `/`)! Două tag-uri canonical diferite anulează indexarea în Google!
   - Fișierul `/robots.txt` este obligatoriu la rădăcină, indicând explicit sitemap-ul canonic.
8. **BLUE TEAM / SECOPS HARDENING:** Container rootless (`USER node`, UID 1000), `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, rețea Docker bridge proprie (`<slug>-net`), dezactivare `X-Powered-By`, protecție anti-SQLi și sanitizare Zero-Trust a logurilor/inputurilor.
9. **STRICT RULE 9 — Rigoare Lingvistică Românească & Puritate Curatorială UI (Muzeologie de Lux):**
   - **Regula Românească „și”:** Simbolul `&` **NU există** în limba română literară. În toate titlurile, meniurile, denumirile de secțiuni/săli și textele curatoriale este OBLIGATORIE folosirea conjuncției `și`. Caracterul `&` este permis exclusiv în entități tehnice HTML standard (`&times;`, `&middot;`, `&rarr;`) sau ca operator boolean de cod (`&&`).
   - **Zero Dubluri și Tripluri de Identificatori:** Fiecare operă/produs poartă un singur cod (`ART-XXXX`). Pe cardul de galerie pânza este 100% curată (fără etichete overlay), metadatele conțin doar categoria, iar identificatorul apare exact o singură dată ca titlu principal pe cartellino. În vizualizarea modală, identificatorul apare exclusiv pe plăcuța curatorială.
   - **Fără Contoare Cantitative Publice:** Nicio afișare de tip "167 de opere" sau "1 / 167" către publicul larg; arta și serviciile se contemplă calitativ.
   - **Fără Detalii Tehnice de Prelucrare:** Este interzisă afișarea de etichete tehnice precum „Curățat de interfață”, „Eveniment postare” sau „Restaurat prudent”.
   - **Comutator Audio Minimalist:** Butonul de sunet/ambianță este un icon pur vizual (difuzor tăiat cu roșu la mute, unde sonore la activare), fără text redundant (`SOUND: OFF`).
   - **Contrast Muzeal White Cube:** În tema deschisă (`[data-theme="light"]`), toate ramele au borduri distincte (`rgba(0,0,0,0.14)`), fundal passe-partout (`#f8fafc`) și drop shadow fin, iar textul este antracit nobil (`#0f172a` / `#334155`), garantând contrast WCAG AAA (15.5:1).
   - **Antet Simplificat și Centrat:** Nume brand/monogramă curat în stânga, linkuri principale centrate matematic (`grid-template-columns: 1fr auto 1fr`), comenzi minimale în dreapta. Autentificarea de admin nu este semnalizată public în antet.

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
- **Media CDN (FTPS + HTTPS):** Imagini >500KB (WebP), video (MP4 `+faststart`) și audio (MP3) stau izolate în `https://media-hostico.prinpreajma.ro/tenants/<slug>/`.
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
> [!IMPORTANT]
> **Zero-Direct-Copy Law & HTTPS GitOps:**
> Este STRICT INTERZISĂ copierea directă a fișierelor de cod din mașina de dezvoltare pe serverul de hosting (`scp`, `rsync`, `docker cp`). Toate modificările se livrează prin `git push origin main`.
> Serverul de hosting (Hetzner sau Proxmox VM1) clonează și actualizează repo-ul prin **HTTPS Public Origin** (`https://github.com/seboriginzero/<slug>.prinpreajma.ro.git`), permițând rularea 100% autonomă a scriptului fără probleme de chei SSH.

```bash
#!/usr/bin/env bash
set -euo pipefail

TENANT_SLUG="<slug>"
CONTAINER_NAME="originzero-tenant-${TENANT_SLUG}"
TENANT_DIR="/home/antigravity/tenants/${TENANT_SLUG}"
SOURCE_DIR="${TENANT_DIR}/source"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 [GitOps Deploy] ${TENANT_SLUG}.prinpreajma.ro pornit la ${TIMESTAMP}..."

# 1. Backup Tranzacțional Obligatoriu ÎNAINTE de update (STRICT RULE 6)
mkdir -p "${TENANT_DIR}/data" "${TENANT_DIR}/backups"
if ls "${TENANT_DIR}/data"/*.db "${TENANT_DIR}/data"/*.sqlite "${TENANT_DIR}/data"/*.json >/dev/null 2>&1; then
  tar -czf "${TENANT_DIR}/backups/data_bak_${TIMESTAMP}.tar.gz" -C "${TENANT_DIR}" data/
  echo "📦 Backup imutabil creat: ${TENANT_DIR}/backups/data_bak_${TIMESTAMP}.tar.gz"
fi

# 2. Preluare cod din GitHub (HTTPS GitOps) & Sanitizare Sitemap
if [[ -d "${SOURCE_DIR}/.git" ]]; then
  cd "${SOURCE_DIR}"
  git fetch --prune origin
  git reset --hard origin/main
  if [[ -f /opt/originzero-gitops/enforce-sitemap-compliance.py ]]; then
    python3 /opt/originzero-gitops/enforce-sitemap-compliance.py .
  fi
  cd "${TENANT_DIR}"
else
  git fetch --prune origin
  git reset --hard origin/main
  if [[ -f /opt/originzero-gitops/enforce-sitemap-compliance.py ]]; then
    python3 /opt/originzero-gitops/enforce-sitemap-compliance.py .
  fi
fi

# 3. Permisiuni volum persistent pentru UID 1000 (previne SQLite error 1544)
chmod -R 0777 "${TENANT_DIR}/data" 2>/dev/null || true

# 4. Build multi-arch nativ & Recreare Atomică
if [[ -d "${SOURCE_DIR}" ]]; then
  docker build -t "${CONTAINER_NAME}:latest" -f "${SOURCE_DIR}/Dockerfile" "${SOURCE_DIR}"
  docker compose up -d --force-recreate --remove-orphans
else
  docker compose build --pull=false
  docker compose up -d --force-recreate --remove-orphans
fi

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

### 4.6 Poarta 7: `public/sitemap.xml` & `public/robots.txt` (Standardul Canonic Salon Sandy)

**`public/sitemap.xml` (sau rută dinamică `app/sitemap.ts` care generează exact acest XML curat):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://<slug>.prinpreajma.ro/</loc>
    <lastmod>2026-11-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**`public/robots.txt`:**
```txt
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://<slug>.prinpreajma.ro/sitemap.xml
```

---

## 5. CERINȚE OBLIGATORII ÎN CODUL APLICAȚIEI (SEO, WRS, CWV 2026, EMAIL SMTP & SECURITATE)

Construiește din start aceste 6 elemente în aplicație pentru a obține **`100 / 100`** din prima la toate auditurile automate:

1. **Healthcheck Endpoint (`/api/health`):**
   - Returnează `HTTP 200 OK` cu `{"status":"ok","tenant":"<slug>"}` în `< 100ms`.
2. **Next.js / HTML Canonical Paritate 1:1 (Anti-Dublare WRS Chromium):**
   - În `next.config.mjs`, setează `poweredByHeader: false` și definește pe fiecare pagină canonicalul exact cu slash pe rădăcină:
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
4. **Google Core Web Vitals (2026) & SQLite WAL:**
   - Imaginea principală Hero (LCP) are obligatoriu `fetchpriority="high"`, `decoding="async"` și **NU are `loading="lazy"`**.
   - Toate imaginile au `width` și `height` explicite (sau `aspect-ratio`) pentru `CLS = 0`.
   - Dacă folosești SQLite (`better-sqlite3`), activează obligatoriu la conexiune:
     ```js
     db.pragma('journal_mode = WAL');
     db.pragma('synchronous = NORMAL');
     db.pragma('cache_size = -64000');
     ```
5. **CSP Compatibil Hostico CDN + GA4 Regional UE:**
   - Dacă aplicația setează `Content-Security-Policy`, permite explicit CDN-ul media și endpoint-urile GA4 UE:
     - `img-src 'self' data: blob: https://media-hostico.prinpreajma.ro https://*.google-analytics.com https://*.googletagmanager.com;`
     - `media-src 'self' https://media-hostico.prinpreajma.ro;`
     - `connect-src 'self' https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;`
6. **Trimitere Emailuri Tranzacționale prin Hostico Authenticated SMTP Relay (SPF + DKIM + DMARC + FCrDNS 10/10):**
   - Aplicațiile de pe Hetzner trimit emailuri (rezervări, programări, comenzi, alerte) prin serverul autentificat `mail.prinpreajma.ro` (`188.241.72.12`, port `465` SSL/TLS, `SPF +ip4:2.31.102.36 +ip6:2a01:4f8:c016:f3bb::/64` deja autorizat):
     ```js
     import nodemailer from 'nodemailer';
     export const mailer = nodemailer.createTransport({
       host: process.env.SMTP_HOST || 'mail.prinpreajma.ro',
       port: parseInt(process.env.SMTP_PORT || '465', 10),
       secure: true, // TLS implicit pe portul 465
       auth: {
         user: process.env.SMTP_USER, // ex: prod.hetzner@prinpreajma.ro (din secrets/.env.<slug>)
         pass: process.env.SMTP_PASS,
       },
     });
     ```
7. **Standardul OpenGraph Social Preview & Mobile Sheet UX (WhatsApp, Telegram, iOS Safari):**
   - **Imagine Share Social (`og:image`):** Format JPEG optimizat la 1080px lățime, greutate strict **sub 300KB** (crawlerele WhatsApp pe iOS/Android resping sau refuză generarea de thumbnail dacă fișierul depășește 300KB sau este exclusiv WebP fără fallback). Definește obligatoriu: `og:image` primar cu `.jpg`, urmat de `.webp`, cu atribute explicite `og:image:width`, `og:image:height`, `og:image:type="image/jpeg"` și `twitter:image`.
   - **Descriere Share (`og:description`):** Text concis, structurat cu date de identitate cheie, curat de tag-uri HTML sau caractere corupte.
   - **Mobile Modal Inspector / Sheets:** Pe ecrane mobile (`<= 768px`), ferestrele modale de vizualizare trebuie să se comporte ca un **Fullscreen Sheet** nativ (`100vw × 100dvh`), fără margini laterale gri (`padding: 0; margin: 0; border: none;`), cu suport pentru iOS Notch / Dynamic Island (`env(safe-area-inset-top)`), buton de închidere `×` evidențiat și fixat permanent pe ecran, și derulare lină unificată fără capcane de scroll dublu.
   - **Paginare fără salt de scroll („Încarcă Mai Multe Opere”):** Inserție incrementală a noilor carduri prin `DocumentFragment`, dezactivare focus (`blur()`) și conservare a poziției de scroll (`window.scrollTo({ top: scrollPos, behavior: 'instant' })`) pentru a preveni saltul brusc al browserului la footer la afișarea conținutului nou.

---

## 6. HOSTICO MEDIA STORAGE & CDN (UPLOAD FTPS PORT 21 + LIVRARE HTTPS EDGE)

Toate resursele media mari (imagini `> 500 KB`, galerii foto, videoclipuri `.mp4`/`.webm`, fișiere `.mp3`) se stochează pe **Hostico Media Storage & CDN** pentru a păstra depozitele Git și containerele Docker de pe Hetzner ultra-ușoare (`< 512 MB RAM`).

### 6.1 Arhitectura & Parametrii de Conectare FTPS + HTTPS
- **URL Public Livrare HTTPS (LiteSpeed Enterprise HTTP/2 + HTTP/3):** `https://media-hostico.prinpreajma.ro`
- **Host / IP FTPS:** `188.241.72.12` (sau `media-hostico.prinpreajma.ro`)
- **Protocol & Port:** **`FTPS` (FTP over Explicit TLS/SSL — `AUTH TLS`) pe portul `21`**
- **Root Fizic pe Hostico (Jail cont FTPS):** `/home/eftrdnbo/media-hostico.prinpreajma.ro/`
- **Variabile de Autentificare (citite din `.env` rădăcină `proxmox-hosting&staff/.env` sau din `secrets/.env.<slug>` — NICIODATĂ hardcodate în Git!):**
  ```ini
  FTP_URL=https://media-hostico.prinpreajma.ro
  HOSTICO_FTP_HOST=188.241.72.12
  HOSTICO_FTP_PORT=21
  HOSTICO_FTP_USER=media-uploader@prinpreajma.ro   # (sau FTP_USERNAME=media-uploader)
  HOSTICO_FTP_PASSWORD=<citit_din_env_local>       # (FTP_PASSWORD în proxmox-hosting&staff/.env)
  ```

### 6.2 🚨 Clauza Critică de Izolare Shared Hosting (`STRICT TENANT JAIL`)
1. **Subdirector Exclusiv (`tenants/<slug>/`):** Ai drept de scriere/citire **EXCLUSIV** în `tenants/<slug>/`! Este **STRICT INTERZIS** să listezi, modifici sau ștergi folderele altor chiriași (`tenants/<alt-slug>/`).
2. **Interdicție Totală pe Rădăcina `/`:** Este **STRICT INTERZIS** să atingi sau să suprascrii fișierele globale din rădăcina storage-ului (`/.htaccess`, `/robots.txt`, `/index.html`, `/sitemap.xml`, `/llms.txt`, `/.well-known/security.txt`, `/.ftpquota`). Acestea asigură global pentru toți chiriașii:
   - Scutul anti-AI scrapers (`GPTBot`, `ByteSpider`, `CCBot`, `ClaudeBot` -> `HTTP 403` + `X-Robots-Tag: noai, noimageai`),
   - Protecția anti-hotlinking și **CORS dinamic** pentru `https://*.prinpreajma.ro`, `https://*.banszky.men` și `http://localhost:*`,
   - Caching agresiv `Cache-Control: public, max-age=31536000, immutable` și streaming video `HTTP 206 Partial Content` (`Accept-Ranges: bytes`, `no-gzip` pe binare).
3. **Protecție Cote CloudLinux LVE (`10–20 MB/s` I/O, `700–1024` IOPS):** Nu urca niciodată fișiere RAW necomprimate (`.jpg` de 15 MB din aparat sau `.mov` de 2 GB) și folosește maximum **2 conexiuni FTPS paralele**.

### 6.3 Taxonomia Ierarhică Obligatorie pe FTPS și HTTPS
```text
FTPS Path (relativ la jail):               URL Public HTTPS Livrat în Aplicație:
tenants/<slug>/                            https://media-hostico.prinpreajma.ro/tenants/<slug>/
├── pictures/
│   ├── hero/         (1920w/1280w/768w)   .../tenants/<slug>/pictures/hero/banner.webp
│   ├── gallery/      (WebP q82-85 <300KB) .../tenants/<slug>/pictures/gallery/foto-1.webp
│   └── thumbnails/   (WebP 400w <50KB)    .../tenants/<slug>/pictures/thumbnails/foto-1.webp
├── video/
│   ├── mp4/          (H.264 +faststart)   .../tenants/<slug>/video/mp4/prezentare.mp4
│   ├── webm/         (VP9/AV1 opțional)   .../tenants/<slug>/video/webm/prezentare.webm
│   └── posters/      (Poster WebP)        .../tenants/<slug>/video/posters/prezentare.webp
└── audio/
    └── mp3/          (128 kbps stereo)    .../tenants/<slug>/audio/mp3/ghid.mp3
```

### 6.4 Protocolul Obligatoriu în 5 Faze (`ZERO BLIND REPLACEMENT`)

#### Faza 1 — Conversie & Optimizare Locală (înainte de upload)
```bash
# 1. Imagini -> WebP calitate 84%:
cwebp -q 84 input.jpg -o banner.webp

# 2. Video -> MP4 H.264 cu -movflags +faststart OBLIGATORIU (pentru redare instantă HTTP 206) + Poster WebP:
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k prezentare.mp4
ffmpeg -ss 00:00:01 -i prezentare.mp4 -vframes 1 -q:v 2 prezentare.webp

# 3. Audio -> MP3 128 kbps stereo:
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k -ar 44100 ghid.mp3
```

#### Faza 2 — Upload Criptat prin FTPS (Port 21 Explicit TLS)
- **Opțiunea A — Din CLI (`curl` cu creare automată directoare în `tenants/<slug>/`):**
  ```bash
  curl -s -k --ssl-reqd --ftp-create-dirs \
    -T "./banner.webp" \
    -u "${FTP_USERNAME}:${FTP_PASSWORD}" \
    "ftp://188.241.72.12/tenants/<slug>/pictures/hero/banner.webp"
  ```
- **Opțiunea B — Prin utilitarul workspace-ului (`basic-ftp`):**
  ```bash
  HOSTICO_FTP_PASSWORD="$FTP_PASSWORD" node .agents-hostico-storage/templates/uploadToHostico.mjs \
    "./dist-media/<slug>" "tenants/<slug>"
  ```
- **Opțiunea C — Upload Programatic din Panoul Admin al Aplicației Tenantului (`basic-ftp` în Node.js):**
  ```js
  import * as ftp from 'basic-ftp';
  import path from 'path';

  export async function uploadTenantMedia(localFilePath, subPath /* ex: 'pictures/gallery/item-1.webp' */) {
    const remotePath = `tenants/<slug>/${subPath.replace(/^\/+/, '')}`;
    const client = new ftp.Client();
    try {
      await client.access({
        host: process.env.HOSTICO_FTP_HOST || '188.241.72.12',
        port: parseInt(process.env.HOSTICO_FTP_PORT || '21', 10),
        user: process.env.HOSTICO_FTP_USER || 'media-uploader@prinpreajma.ro',
        password: process.env.HOSTICO_FTP_PASSWORD,
        secure: true, // Explicit FTPS pe portul 21
        secureOptions: { rejectUnauthorized: false }, // Compatibil cPanel AutoSSL wildcard
      });
      await client.ensureDir(path.posix.dirname(remotePath));
      await client.uploadFrom(localFilePath, remotePath);
      return `https://media-hostico.prinpreajma.ro/${remotePath}`;
    } finally {
      client.close();
    }
  }
  ```

#### Faza 3 — Poarta Obligatorie de Validare HTTPS (`STOP` înainte de a înlocui linkurile în cod!)
Este **STRICT INTERZIS** să înlocuiești căile locale în cod până când fișierul nu răspunde live pe HTTPS cu header-ele corecte:
```bash
# 1. Validare Imagine (trebuie HTTP/2 200, content-type: image/webp, cache-control: public, max-age=31536000, immutable):
curl -sI -H "Origin: https://<slug>.prinpreajma.ro" \
  "https://media-hostico.prinpreajma.ro/tenants/<slug>/pictures/hero/banner.webp"

# 2. Validare Streaming Byte-Range pe Video (trebuie HTTP/2 206 Partial Content + Content-Range):
curl -sI -H "Range: bytes=0-100" \
  "https://media-hostico.prinpreajma.ro/tenants/<slug>/video/mp4/prezentare.mp4"
```

#### Faza 4 — Integrarea HTTPS în Aplicație (`next.config.mjs` & Componente UI)
```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media-hostico.prinpreajma.ro',
        pathname: '/tenants/**',
      },
    ],
  },
};
export default nextConfig;
```
```tsx
{/* Imagine Hero LCP (FĂRĂ loading="lazy"!) */}
<img
  src="https://media-hostico.prinpreajma.ro/tenants/<slug>/pictures/hero/banner.webp"
  alt="<NUME_AFACERE>"
  width={1920}
  height={1080}
  fetchpriority="high"
  decoding="async"
/>

{/* Video optimizat cu Poster WebP & Streaming 206 */}
<video
  controls
  preload="metadata"
  playsInline
  poster="https://media-hostico.prinpreajma.ro/tenants/<slug>/video/posters/prezentare.webp"
>
  <source src="https://media-hostico.prinpreajma.ro/tenants/<slug>/video/mp4/prezentare.mp4" type="video/mp4" />
</video>
```

#### Faza 5 — Curățare Git
După confirmarea afișării în browser fără erori `404` / `CORS`, șterge fișierele raw grele din repo (sau adaugă folderul temporar `dist-media/` în `.gitignore`).

---

## 7. PROVIZIONARE INFRASTRUCTURĂ, NGINX REVERSE PROXY & CERTIFICATE SSL LET'S ENCRYPT (ZERO-DOWNTIME)

Această secțiune conține arhitectura completă și comenzile exacte prin care un proiect nou este provizionat live cu **0 secunde downtime** și **0 impact asupra celorlalți tenanți** (`Blast Radius = 0`).

### 7.1 Pasul 1 — Provizionare DNS Dual-Stack & Validare Pre-Flight (`dns-edge-validator`)
Toate subdomeniile găzduite pe Hetzner Cloud VM `cax21` (`2.31.102.36` / `2a01:4f8:c016:f3bb::1`) folosesc standardul oficial de ancorare **CNAME** în **Hostico cPanel -> Zone Editor (`prinpreajma.ro`)**:
- **Ancoră Centrală Hetzner:** `hetzner1.banszky.men`
  - `A` -> `2.31.102.36`
  - `AAAA` -> `2a01:4f8:c016:f3bb::1`
- **Înregistrări DNS adăugate pentru Tenantul Nou (`<slug>`):**
  ```text
  <slug>.prinpreajma.ro.       14400  IN  CNAME  hetzner1.banszky.men.
  www.<slug>.prinpreajma.ro.   14400  IN  CNAME  <slug>.prinpreajma.ro.
  ```
- **Poarta Pre-Flight DNS (OBLIGATORIE înainte de Certbot pentru a preveni blocarea rate-limit Let's Encrypt de 5 eșecuri/oră):**
  ```bash
  dig +short A <slug>.prinpreajma.ro @1.1.1.1        # Trebuie să returneze: 2.31.102.36
  dig +short A www.<slug>.prinpreajma.ro @1.1.1.1    # Trebuie să returneze: 2.31.102.36
  dig +short AAAA <slug>.prinpreajma.ro @1.1.1.1     # Trebuie să returneze: 2a01:4f8:c016:f3bb::1
  ```

### 7.2 Pasul 2 — Port Dinamic, Standardul HTTPS GitOps (Zero Deploy Key Friction), Secrete (`0600`), Container & Auto-Sync pe Hetzner / Proxmox VM1
```bash
# 1. Descoperire dinamică a primului port liber 127.0.0.1:30XX pe server (STRICT RULE 3):
ssh antigravity@2.31.102.36 "ss -tulnp | grep -E '127\.0\.0\.1:30[0-9]{2}' | sort"
# -> Exemplu port liber alocat: 3040 (sau 3090 pe VM1)

# 2. Pre-condiție GitHub (OBLIGATORIE):
# Depozitul seboriginzero/<slug>.prinpreajma.ro TREBUIE creat pe GitHub ca repo public (sau accesibil via HTTPS).
# Dezvoltatorul de pe Mac efectuează push inițial prin SSH: git push -u origin main

# 3. Livrare criptată a secretelor cu permisiuni stricte 0600 (mirror păstrat local în proxmox-hosting&staff/secrets/.env.<slug>):
chmod 600 secrets/.env.<slug>
cat secrets/.env.<slug> | ssh antigravity@2.31.102.36 "mkdir -p /home/antigravity/secrets && cat > /home/antigravity/secrets/.env.<slug> && chmod 600 /home/antigravity/secrets/.env.<slug>"

# 4. Clonare directă prin HTTPS (Zero Deploy Key Friction, exact ca moneasa & cetateadeznei):
ssh antigravity@2.31.102.36 "mkdir -p /home/antigravity/tenants/<slug>/{data,backups} && \
  chmod -R 0777 /home/antigravity/tenants/<slug>/data && \
  git clone https://github.com/seboriginzero/<slug>.prinpreajma.ro.git /home/antigravity/tenants/<slug>/source && \
  cp /home/antigravity/tenants/<slug>/source/docker-compose.yml /home/antigravity/tenants/<slug>/ && \
  cat << 'EOF' > /home/antigravity/tenants/<slug>/deploy-gitops.sh
#!/usr/bin/env bash
set -euo pipefail
TENANT_DIR=\"/home/antigravity/tenants/<slug>\"
SOURCE_DIR=\"\${TENANT_DIR}/source\"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

echo \"🚀 [GitOps Deploy] <slug> deployment started at \${TIMESTAMP}...\"
cd \"\${SOURCE_DIR}\"
git fetch --prune origin
git reset --hard origin/main

cd \"\${TENANT_DIR}\"
docker build -t originzero-tenant-<slug>:latest -f \"\${SOURCE_DIR}/Dockerfile\" \"\${SOURCE_DIR}\"
chmod -R 0777 \"\${TENANT_DIR}/data\" 2>/dev/null || true
docker compose up -d --force-recreate
echo \"✅ [GitOps Deploy] <slug> deployed successfully via GitOps.\"
EOF
  chmod +x /home/antigravity/tenants/<slug>/deploy-gitops.sh && \
  cd /home/antigravity/tenants/<slug> && ./deploy-gitops.sh"

# 5. Verificare locală a containerului ÎNAINTE de expunerea în Nginx:
ssh antigravity@2.31.102.36 "curl -fsS -i http://127.0.0.1:<PORT>/api/health"
```

> [!IMPORTANT]
> **De ce HTTPS și nu SSH Deploy Keys pe serverul de hosting?**
> Depozitele de prezentare/frontend din ecosistemul PrinPreajma.ro au codul public pe GitHub (toate datele confidențiale, parolele și cheile API fiind 100% izolate pe server în `/home/antigravity/secrets/.env.<slug>` cu permisiuni `chmod 0600`).
> Utilizarea clonării prin HTTPS permite ca `deploy-gitops.sh` și `git-watcher.sh` să execute `git fetch` și `git reset --hard origin/main` în regim **complet autonom**, fără blocaje de tipul `Permission denied (publickey)` sau pași manuali pe interfața GitHub Settings -> Deploy Keys.
> Dezvoltatorul împinge codul de pe Mac prin SSH (`git@github.com:seboriginzero/<slug>.prinpreajma.ro.git`), iar serverul preia instantaneu prin HTTPS. Zero copiere directă prin SCP, 100% GitOps pur!

- **Înregistrare în Motoarele Autonome GitOps de pe Hetzner (`/opt/originzero-gitops/`):**
  1. În `/opt/originzero-gitops/webhook-server.py` (`127.0.0.1:9099`, validare `HMAC-SHA256` `X-Hub-Signature-256`), se adaugă în `TENANT_SCRIPTS`:
     `'seboriginzero/<slug>.prinpreajma.ro': '/home/antigravity/tenants/<slug>/deploy-gitops.sh'` + `sudo systemctl restart originzero-gitops-webhook.service`.
  2. În `/opt/originzero-gitops/git-watcher.sh` (timer systemd la 2 minute — fallback dacă GitHub pierde un webhook), se adaugă:
     `check_and_deploy "<slug>" "/home/antigravity/tenants/<slug>/source" "/home/antigravity/tenants/<slug>/deploy-gitops.sh"`.

---

### 7.3 Pasul 3 — Certificate SSL Let's Encrypt & Automatizare ACME (Cele 3 Scenarii Oficiale)

> [!CAUTION]
> **REGULI CRITICE ZERO-DOWNTIME PENTRU SSL & NGINX:**
> 1. Este **STRICT INTERZIS** `certbot --standalone` (oprește Nginx pe portul 80 și provoacă downtime tuturor clienților). Se folosește **EXCLUSIV** `certbot certonly --webroot -w /var/www/letsencrypt`.
> 2. Este **STRICT INTERZIS** `systemctl restart nginx` pe un server cu trafic activ. Se folosește **EXCLUSIV** `sudo nginx -t && sudo systemctl reload nginx` (`SIGHUP` grațios).

#### Scenariul A — Tenant 100% Nou direct pe Hetzner Cloud (`2.31.102.36`) [STANDARD]
1. **Varianta Automată prin Adaptorul CLI Zero-Downtime (`hetzner-vm/manage_domain.sh` -> `/opt/hetzner-provision/remote_domain_manage.sh`):**
   ```bash
   ./hetzner-vm/manage_domain.sh create <slug>.prinpreajma.ro 127.0.0.1:<PORT> \
     --websocket 1 --http2 1 --hsts 1 --client-max-body-size 50m
   ```
   **Ce execută atomic în spate `remote_domain_manage.sh` (Cele 6 Porți `zero-downtime-guardian`):**
   - **Poarta 1 & 2:** Validează sintaxa RFC a FQDN-ului, portul `127.0.0.1:<PORT>` și rezoluția DNS pre-flight către `2.31.102.36`.
   - **Poarta 3:** Salvează spec-ul în `/opt/hetzner-provision/vhosts/<fqdn>.env` (`0600`) și face backup configurației anterioare în `/opt/hetzner-provision/backups/<fqdn>/<timestamp>.conf`.
   - **Poarta 4 (ACME Webroot fără oprire Nginx):** Creează temporar `/etc/nginx/conf.d/00-oz-acme-<fqdn>.conf` pe portul `80`, validează `nginx -t`, face `systemctl reload nginx`, verifică local `/.well-known/acme-challenge/ping` și rulează Certbot webroot.
   - **Poarta 5 (Staging & Rollback Atomic):** Randează vhost-ul final în `/tmp/<fqdn>.stage.XXXXXX.conf`, îl mută atomic în `/etc/nginx/sites-available/<fqdn>.conf`, creează symlink în `/etc/nginx/sites-enabled/<fqdn>.conf`, șterge fișierul ACME temporar și rulează `nginx -t`. **Dacă `nginx -t` eșuează, șterge symlink-ul, restaurează automat ultimul backup și NU reîncarcă Nginx (`0%` impact pe ceilalți tenanți).**
   - **Poarta 6:** Execută `systemctl reload nginx` (`SIGHUP`).

2. **Emitere Certificat Multi-SAN (`apex` + `www.`) pentru Vhost-ul Enterprise Complet (Secțiunea 7.4):**
   Pentru acoperirea simultană a `<slug>.prinpreajma.ro` și `www.<slug>.prinpreajma.ro` pe același certificat Let's Encrypt:
   ```bash
   sudo certbot certonly --webroot \
     -w /var/www/letsencrypt \
     --non-interactive --agree-tos \
     -m prod.hetzner@prinpreajma.ro \
     -d <slug>.prinpreajma.ro \
     -d www.<slug>.prinpreajma.ro \
     --keep-until-expiring
   ```
   - **Căi Certificat Generat:**
     - `fullchain`: `/etc/letsencrypt/live/<slug>.prinpreajma.ro/fullchain.pem`
     - `privkey`: `/etc/letsencrypt/live/<slug>.prinpreajma.ro/privkey.pem`
   - **Reînnoire Automată:** Gestionată de `certbot.timer` + hook-ul `/etc/letsencrypt/renewal-hooks/deploy/zz-oz-nginx-reload.sh` (`nginx -t && systemctl reload nginx`).

#### Scenariul B — Migrare Tenant Existent din Proxmox VM3 pe Hetzner fără Downtime DNS (`Strategia 1`)
Dacă domeniul are deja certificat activ pe Proxmox VM3 (`192.168.57.105`) și DNS-ul încă pointează spre Proxmox:
```bash
# Copiază criptat archive/ + live/ + renewal/ de pe VM3 pe Hetzner, setează permisiunile 0600/0750,
# creează vhost-ul pe Hetzner și testează handshake-ul TLSv1.3 pre-cutover cu curl --resolve:
./hetzner-vm/sync_ssl_to_hetzner.sh <slug>.prinpreajma.ro --create-vhost 127.0.0.1:<PORT>
curl -Iv --resolve <slug>.prinpreajma.ro:443:2.31.102.36 https://<slug>.prinpreajma.ro/
```
*(Opțional la cerere expresă — `Strategia 3`: forward temporar `location ^~ /.well-known/acme-challenge/ { proxy_pass http://2.31.102.36:80; }` pe VM3 pentru emitere la rece pe Hetzner înainte de comutarea DNS).*

#### Scenariul C — Provizionare în Clusterul Local Proxmox (`VM4 -> VM3 -> VM1`)
Dacă un proiect intern sau de staging este expus prin Proxmox (`VM1 192.168.57.51` container -> `VM3 192.168.57.105` Nginx SSL):
```bash
# Executat EXCLUSIV la onboarding-ul inițial de pe nodul de provizionare VM4 (pro@192.168.57.101):
ssh pro@192.168.57.101 "/home/pro/nginx-reverse-proxy/manage_domain.sh create <slug>.prinpreajma.ro 192.168.57.51:<PORT> --websocket --http2 --hsts"
```
*(Conform `STRICT RULE 7`, după provizionarea inițială, VM3 nu se mai atinge niciodată la deploy-urile curente de cod!)*

---

### 7.4 Pasul 4 — Arhitectura Nginx Reverse Proxy & Șablonul Oficial Vhost Producție (`salonsandy` Gold Standard)

Infrastructura Nginx de pe Hetzner include global în `/etc/nginx/`:
- `/etc/nginx/conf.d/00-oz-default.conf` — Server implicit catch-all pe IP brut care închide conexiunile neautorizate cu **`HTTP 444`** (anti-scanner & anti-Host-Header-Injection), păstrând deschis doar `/.well-known/acme-challenge/`.
- `/etc/nginx/conf.d/00-oz-maps.conf` — Mapare dinamică WebSocket (`$http_upgrade -> $connection_upgrade`).
- `/etc/nginx/conf.d/00-oz-compression.conf` — Compresie duală **Brotli nivel 6** (`brotli on; brotli_comp_level 6; brotli_static on;`) + **Gzip nivel 6** pe `text/html`, `text/css`, `application/javascript`, `application/json`, `application/xml`, `image/svg+xml`.
- `/etc/nginx/snippets/oz-ssl-params.conf` — `TLSv1.2 TLSv1.3`, `ssl_session_cache shared:SSL:20m;`, `ssl_session_timeout 1d;`, `ssl_session_tickets off;`.
- `/etc/nginx/snippets/oz-security-headers.conf` — Setează cu `always`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=()`, și include automat `/etc/nginx/snippets/oz-indexnow.conf` (cheia globală IndexNow).
- `/etc/nginx/snippets/oz-proxy-headers.conf` — Transmite `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` și **ascunde headerele duplicate/sensibile din container** (`X-Powered-By`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `X-LiteSpeed-Cache-Control`, `Surrogate-Control`, `Pragma`).

> [!IMPORTANT]
> **Legea de Moștenire Nginx (`ngx_http_proxy_module`):** Nu adăuga NICIODATĂ un singur `proxy_hide_header` izolat într-un bloc `location` fără `include /etc/nginx/snippets/oz-proxy-headers.conf;`, deoarece ar anula moștenirea tuturor celorlalte directive `proxy_hide_header`! Iar pe `/sitemap.xml`, dacă adaugi `Content-Type`, pune obligatoriu `proxy_hide_header Content-Type;` ca să nu apară header dublat.

#### Șablonul Complet `/etc/nginx/sites-available/<slug>.prinpreajma.ro.conf`
```nginx
# Upstream connection pooling (Keepalive 32 -> TTFB < 200ms)
upstream <slug>_upstream {
    server 127.0.0.1:<PORT>;
    keepalive 32;
    keepalive_requests 1000;
}

# 1. HTTP (:80) -> ACME Challenge + GitOps Webhook + 301 Redirect la HTTPS Apex
server {
    listen 80;
    listen [::]:80;
    server_name <slug>.prinpreajma.ro www.<slug>.prinpreajma.ro;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type "text/plain";
        try_files $uri =404;
        access_log off;
    }

    location ~* ^/api/webhook/(?:github|deploy)$ {
        proxy_pass http://127.0.0.1:9099;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 301 https://<slug>.prinpreajma.ro$request_uri;
    }

    access_log /var/log/nginx/<slug>_access.log;
    error_log  /var/log/nginx/<slug>_error.log warn;
}

# 2. HTTPS www.<slug>.prinpreajma.ro -> 301 Redirect Canonic la HTTPS Apex (fără www)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.<slug>.prinpreajma.ro;

    ssl_certificate     /etc/letsencrypt/live/<slug>.prinpreajma.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<slug>.prinpreajma.ro/privkey.pem;

    include /etc/nginx/snippets/oz-ssl-params.conf;
    include /etc/nginx/snippets/oz-security-headers.conf;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type "text/plain";
        try_files $uri =404;
        access_log off;
    }

    location / {
        return 301 https://<slug>.prinpreajma.ro$request_uri;
    }

    access_log /var/log/nginx/<slug>_ssl_access.log;
    error_log  /var/log/nginx/<slug>_ssl_error.log warn;
}

# 3. HTTPS Canonic (<slug>.prinpreajma.ro) — Reverse Proxy Multi-Tenant
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name <slug>.prinpreajma.ro;

    ssl_certificate     /etc/letsencrypt/live/<slug>.prinpreajma.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<slug>.prinpreajma.ro/privkey.pem;

    include /etc/nginx/snippets/oz-ssl-params.conf;
    include /etc/nginx/snippets/oz-security-headers.conf;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # GitOps Auto-Deploy Webhook Fast-Path (HMAC-SHA256 verificat pe :9099)
    location ~* ^/api/webhook/(?:github|deploy)$ {
        proxy_pass http://127.0.0.1:9099;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # Sitemap XML curat (fără Content-Type duplicat)
    location = /sitemap.xml {
        proxy_pass http://<slug>_upstream;
        include /etc/nginx/snippets/oz-proxy-headers.conf;
        proxy_hide_header Content-Type;
        proxy_hide_header Cache-Control;
        add_header Content-Type "application/xml; charset=utf-8" always;
        add_header Cache-Control "public, max-age=3600, must-revalidate" always;
        proxy_set_header Connection "";
    }

    # Active statice locale cu cache imutabil 30 zile
    location ~* \.(?:webp|avif|jpg|jpeg|gif|png|ico|svg|css|js|woff2|woff|ttf)$ {
        proxy_pass http://<slug>_upstream;
        include /etc/nginx/snippets/oz-proxy-headers.conf;
        proxy_set_header Connection "";
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable" always;
        include /etc/nginx/snippets/oz-security-headers.conf;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        access_log off;
    }

    # SSR, API & WebSocket Path cu Keepalive
    location / {
        include /etc/nginx/snippets/oz-proxy-headers.conf;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        client_max_body_size 50m;
        proxy_connect_timeout 10s;
        proxy_read_timeout    60s;
        proxy_send_timeout    60s;

        proxy_pass http://<slug>_upstream;
    }

    access_log /var/log/nginx/<slug>_ssl_access.log;
    error_log  /var/log/nginx/<slug>_ssl_error.log warn;
}
```

- **Activare Atomică & Validare Vhost pe Hetzner:**
  ```bash
  sudo ln -sf /etc/nginx/sites-available/<slug>.prinpreajma.ro.conf /etc/nginx/sites-enabled/<slug>.prinpreajma.ro.conf
  sudo nginx -t && sudo systemctl reload nginx
  ./hetzner-vm/manage_domain.sh status <slug>.prinpreajma.ro
  ```
- **Notă Avansată `sub_filter` pentru Next.js RSC Flight:** Dacă aplicația generează nativ canonical corect cu `/` (Secțiunea 5.2), **nu** este nevoie de `sub_filter`. Dacă vreodată se aplică o corecție `sub_filter` în Nginx pe un site Next.js, este obligatorie rescrierea simultană a HTML-ului SSR **și** a JSON-ului RSC cu **dublu-backslash (`\\"`)** (`sub_filter '\\"rel\\":\\"canonical\\",\\"href\\":\\"https://<slug>.prinpreajma.ro\\"' '\\"rel\\":\\"canonical\\",\\"href\\":\\"https://<slug>.prinpreajma.ro/\\"';` + `sub_filter_once off;`), urmată la `>= 500ms` după reload de verificarea cu Headless Chromium (`--headless=new --dump-dom`).

---

### 7.5 Pasul 5 — Înregistrare în Guvernanța Platformei, Certificare `100/100` & Indexare GSC
1. **Înregistrare în Registrele Platformei (`STRICT RULE 4 & 8`):**
   - Adăugare `SUBDOMAINX="<slug>.prinpreajma.ro"` (sau `APPX="..."`) în `ethicalHacking/.env`.
   - Adăugare în `hetzner-vm/.tenants-hetzner-vm` (lista exclusivă a tenanților LIVE pe Hetzner).
   - Adăugare intrare `<sitemap><loc>https://<slug>.prinpreajma.ro/sitemap.xml</loc><lastmod>YYYY-MM-DD</lastmod></sitemap>` în Master Sitemap Index-ul `https://prinpreajma.ro/sitemap.xml` (`<sitemapindex>`) și card cu link canonic `https://<slug>.prinpreajma.ro/` în `prinpreajma.ro/data/index.json` + `index.html`.
2. **Rularea Suitei Complete de Certificare & Indexare:**
   ```bash
   node scripts/audit-tenant-fleet-gitops.js                            # 1. Certificare 7/7 Porți GitOps + inventar dinamic
   node ethicalHacking/scripts/runner.js <slug>.prinpreajma.ro          # 2. Certificare DAST, SSL/TLS, Headers, CORS -> 100/100
   node ethicalHacking/scripts/audit-blue-team-secops.js <slug>.prinpreajma.ro # 3. Certificare L3/L4/L7 & CapDrop -> 100/100
   node ethicalHacking/scripts/audit-seo-crawlers.js <slug>.prinpreajma.ro     # 4. Certificare Sitemap & Canonical -> 100/100
   node ethicalHacking/scripts/audit-performance.js <slug>.prinpreajma.ro      # 5. Certificare Core Web Vitals 2026 & Brotli
   node scripts/submit-instant-indexing.js <slug>                       # 6. Înregistrare GSC Property + Sitemap + IndexNow
   node ethicalHacking/scripts/audit-live-serp.js <slug>.prinpreajma.ro # 7. Verificare WRS Headless Chromium 1:1 Canonical
   ```
   *(Pas final UI: după rularea `submit-instant-indexing.js <slug>`, operatorul apasă o singură dată **Request Indexing** pe `https://<slug>.prinpreajma.ro/` în Google Search Console UI pentru a declanșa crawl-ul `Googlebot/2.1` în `< 2 minute`).*

---

## 8. FORMATUL PACHETULUI DE HANDOFF (PE CARE ÎL GENEREZI CÂND TERMINI CODUL)

Când ai terminat dezvoltarea proiectului nou, ai validat resursele media pe Hostico HTTPS (Faza 3 din Secțiunea 6.4) și ai făcut `git push origin main`, livrează utilizatorului acest bloc complet gata de executat în `proxmox-hosting&staff`:

```yaml
ORIGINZERO_NEW_TENANT_HANDOFF:
  entity_type: "TENANT" # sau "APPLICATION"
  county_code: "<AR|TM|BH|HD|...>"
  local_path: "tenants/<JUDET>/<NNN-NumeTenant>"
  slug: "<slug>"
  fqdn: "<slug>.prinpreajma.ro"
  www_fqdn: "www.<slug>.prinpreajma.ro"
  canonical_root: "https://<slug>.prinpreajma.ro/"
  dns_records:
    apex_cname: "<slug>.prinpreajma.ro -> hetzner1.banszky.men (2.31.102.36 / 2a01:4f8:c016:f3bb::1)"
    www_cname: "www.<slug>.prinpreajma.ro -> <slug>.prinpreajma.ro"
  github_repo_ssh: "git@github.com:seboriginzero/<slug>.prinpreajma.ro.git"
  github_repo_https_clone: "https://github.com/seboriginzero/<slug>.prinpreajma.ro.git"
  branch: "main"
  internal_container_port: 3000
  requires_websocket: true
  ssl_mode: "letsencrypt_webroot_multi_san" # /var/www/letsencrypt (-d <fqdn> -d www.<fqdn>)
  healthcheck_path: "/api/health"
  sitemap_path: "/sitemap.xml"
  database_type: "sqlite_wal | postgres | json | static"
  persistent_volumes:
    - "./data:/app/data" # chmod 0777 pe host pentru UID 1000
  secrets_file_local: "proxmox-hosting&staff/secrets/.env.<slug>"
  hostico_media_storage:
    ftps_jail_path: "tenants/<slug>/"
    https_base_url: "https://media-hostico.prinpreajma.ro/tenants/<slug>/"
    https_validation_passed: true
  gitops_7_gates_verified: true
  zero_direct_copy_verified: true
  linguistic_romanian_si_verified: true
  non_redundant_identifiers_verified: true
```
