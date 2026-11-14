# ORIGINZERO GITOPS ALIGNMENT DIRECTIVE
- **Tenant FQDN:** `https://757.originzero.art/`
- **Secondary FQDN:** `https://757.prinpreajma.ro/`
- **County Code:** `HD` (Hunedoara)
- **Local Workspace Path:** `tenants/HD/001-mugur757`
- **GitOps Sync:** `npm run gitops:sync` (`./sync-gitops.sh`) — Zero-Local-Copy (GitHub `origin/main` only).
- **Secrets Policy:** `.env` este STRICT interzis în Git; livrare exclusivă prin SSH (`chmod 0600`).
- **Media CDN:** Imagini >500KB, video și audio stau pe `https://media-hostico.prinpreajma.ro/pictures/757/`.
- **Database Safety:** Backup imutabil `.bak_<timestamp>` obligatoriu înainte de orice deploy în producție.
- **SEO & WRS Canonical:** Rădăcina folosește obligatoriu slash final `https://757.originzero.art/` în `sitemap.xml` și în `<link rel="canonical">` (SSR + WRS Chromium).
- **Blue Team Hardening:** Container rootless UID 1000, `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, bridge network `757-net`.

