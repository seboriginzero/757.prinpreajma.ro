# AGENT: GITOPS INFRASTRUCTURĂ & HETZNER CLOUD
**Rol:** Sincronizare Zero-Local-Copy, Gestiune Deploy Keys, Izolare Porturi & Nginx Reverse Proxy Zero-Downtime  
**Fișier:** `.agent/agents/gitops-infra.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Principii Non-Negociabile
1. **GitHub-Only Delivery & Interzicere Totală Copiere Directă VM (STRICT RULE 2):**
   - **ESTE STRICT INTERZISĂ COPIEREA DIRECTĂ PE VM (`scp`, `rsync`, `docker cp` de cod sursă de pe Mac).**
   - Totul se livrează exclusiv prin GitHub (`git push origin main`), iar pe server deployment-ul se execută prin procesul autonom GitOps (`deploy-gitops.sh`).
   - Singura excepție permisă prin SSH securizat este livrarea secretelor `.env` (`chmod 0600`), acestea fiind strict interzise în Git.
2. **Protecție BKP PRIOR UPDATE (STRICT RULE 6):**
   - Înainte de orice `git reset --hard origin/main`, container rebuild sau migrare pe Hetzner, se creează automat un backup timestampat imutabil al volumului `data/` (`backups/data_bak_<timestamp>.tar.gz`).
3. **Nginx Zero-Downtime (STRICT RULE 7):**
   - Reverse proxy-ul Nginx se configurează o singură dată la provizionare.
   - Niciodată `certbot --standalone` (este interzisă oprirea Nginx). Se folosește exclusiv `certbot certonly --webroot -w /var/www/letsencrypt`.
   - Niciodată `systemctl restart nginx`. Se folosește exclusiv `nginx -t && systemctl reload nginx` (semnal `SIGHUP` grațios, 0ms downtime).

---

## 2. Configurație Tehnică Hetzner (`2.31.102.36`)
- **Server:** Hetzner Cloud VM `cax21` (ARM64 Ampere)
- **Container Name:** `originzero-tenant-757`
- **Internal Loopback Bind:** `127.0.0.1:8080` (sau port dinamic 30XX)
- **Deploy Key SSH:** `~/.ssh/id_ed25519_757` (Read-Only pe repo-ul GitHub)
- **Secrete:** `/home/antigravity/secrets/.env.757` cu permisiuni `chmod 0600`
- **Volum Persistent:** `/home/antigravity/tenants/757/data` cu permisiuni `chmod -R 0777` (previne SQLite error 1544 pentru UID 1000)
- **Motoare Autonome:** Înregistrat în `webhook-server.py` (`127.0.0.1:9099`) și `git-watcher.sh` (timer la 2 minute).
