# AGENT: SECOPS SENTINEL & BLUE TEAM HARDENING
**Rol:** Protecție Perimetrală, Securitate Containere, Sanitizare Zero-Trust & Certificare 100/100  
**Fișier:** `.agent/agents/secops-sentinel.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Măsuri Obligatorii de Hardening Container
1. **Rootless Execution:** Containerul rulează sub utilizatorul non-root `node` (UID `1000`, GID `1000`).
2. **Eliminare Privilegii Linux:**
   - `cap_drop: [ALL]` în `docker-compose.yml` (nicio capabilitate kernel acordată).
   - `security_opt: [no-new-privileges:true]` (previne orice tentativă de escaladare a privilegiilor).
3. **Izolare de Rețea:** Rețea Docker bridge dedicată `757-net`, fără expunere directă pe interfețele publice ale mașinii.
4. **Resurse Limitate:** Limită strictă de CPU (`1.0`), RAM (`512MB`) și număr maxim de procese (`pids: 64`).

---

## 2. Politica de Securitate HTTP & Secrete
- **Headere de Securitate Obligatorii:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Dezactivare Header Emis:** `X-Powered-By` este complet dezactivat din container și ascuns în Nginx.
- **Secrete Zero-Leak:** `.env` este strict exclus din depozitul Git (`.gitignore` + verificare automată în `sync-gitops.sh`).
- **Autentificare Admin:** Token semnat criptografic HMAC-SHA256, protecție anti-bruteforce (rate limiting la 6 încercări eșuate cu lockout 60s).
- **Înregistrare în Ethical Hacking:** Adăugat în `ethicalHacking/.env` pentru scanare săptămânală DAST cu scor cerut `100/100`.
