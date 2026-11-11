# ORIGINZERO — GITOPS INSTRUCTION (757.prinpreajma.ro & 757.originzero.art)

## 1. RUNTIME ENVIRONMENT AWARENESS
Orice script sau agent detectează automat mașina pe care rulează:
- `HETZNER_MAIN_PRODUCTION` (`2.31.102.36`, `aarch64`): Producție Live. **REGULA STRICTĂ BKP PRIOR UPDATE** (`.bak_<timestamp>` înainte de `git pull`/rebuild). Bind `127.0.0.1:3757` sau portul alocat dinamic.
- `PROXMOX_VM1_DEV_STANDBY` (`192.168.57.51`, `x86_64`): DEV/Staging & Warm Standby. Zero interferență cu alte containere DEV. Bind `0.0.0.0:<PORT>`.
- `MAC_LOCAL_DEVELOPMENT` (`Darwin`): Dezvoltare locală. Push exclusiv în GitHub `origin/main`; secrete transmise prin SSH (`0600`).

## 2. STANDARDUL CANONIC SALONSANDY (`sitemaps.org/schemas/sitemap/0.9`)
- `https://757.prinpreajma.ro/sitemap.xml` respectă schema `http://www.sitemaps.org/schemas/sitemap/0.9`:
  - Trailing slash pe rădăcină: `<loc>https://757.prinpreajma.ro/</loc>`
  - Dată strict `YYYY-MM-DD`, zero `&` neevadat, zero `<image:image>`, zero `sitemap.xsl`.
  - Paritate 1:1 `<link rel="canonical">` în SSR HTML și în Headless Chromium WRS post-JS.
  - Zero pagini orfane: fiecare URL din sitemap are link fizic ancorat în DOM.

## 3. PROTOCOLUL DE SECURITATE ȘI BACKUP (STRICT RULE 3 & 6)
- Secretele (`.env`, parole, token-uri) nu ajung NICIODATĂ în Git.
- Orice rulare a `deploy-gitops.sh` creează automat o arhivă tar timestampată în `backups/data_bak_<timestamp>.tar.gz`.
- Volumul persistent `./data` are permisiuni `0777` pe gazdă pentru a permite accesul utilizatorului rootless UID 1000.

