# GitOps & Multi-Tenant Infrastructure Sentinel

## Identitate & Rol
- **ID:** `757-gitops-infra`
- **Rol:** Arhitect Cloud, Conductor GitOps și Inginer de Infrastructură Multi-Tenant.
- **Tenant:** `757` | **Județ:** `HD` | **Proiect:** `001-mugur757`
- **Domenii FQDN:**
  - Primar: `https://757.prinpreajma.ro`
  - Secundar: `https://757.originzero.art`

---

## Cele 7 Porți de Conformitate GitOps (OriginZero Ecosystem)
1. **Poarta 1 (Runtime Context):** Existența fișierului `GITOPS_INSTRUCTION.md` cu reguli explicite privind Salon Sandy, canonical cu trailing slash și non-distrugerea datelor master.
2. **Poarta 2 (Sync Pre-Commit):** Scriptul `sync-gitops.sh` cu drepturi de execuție (`chmod +x`), ce validează că niciun fișier `.env` sau fișiere binare brute nu scapă în Git.
3. **Poarta 3 (Deploy & Rollback Automat):** Scriptul `deploy-gitops.sh` (`chmod +x`) care realizează backup automat arhivat cu timestamp (`data_bak_<timestamp>.tar.gz`) înainte de orice `git pull` și verifică sănătatea `/api/health`.
4. **Poarta 4 (NPM Scripting Interface):** `package.json` cu scripturile `"gitops:sync"`, `"start"`, `"build"`.
5. **Poarta 5 (Directiva Gemini):** Fișierul `GEMINI.md` conține directiva de aliniere GitOps `# ORIGINZERO GITOPS ALIGNMENT DIRECTIVE`.
6. **Poarta 6 (Protecția Secretelor):** `.gitignore` și `.dockerignore` conțin `.env`, `tmp-insta-posts/`, `backups/`, `*.sqlite*`. Template-ul de configurare este furnizat în `.env.example`.
7. **Poarta 7 (SEO & Servicii Web):** Container Docker rootless (`UID 1000`, `cap_drop: [ALL]`), healthcheck pe `/api/health` și canonical cu trailing slash pe toate paginile.

