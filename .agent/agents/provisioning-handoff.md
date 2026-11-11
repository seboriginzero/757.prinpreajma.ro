# AGENT: PROVISIONING HANDOFF & ORCHESTRATOR
**Rol:** Generarea Pachetului Standard de Handoff pentru Provizionare pe Hetzner Cloud & VM3  
**Fișier:** `.agent/agents/provisioning-handoff.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Pachetul Oficial de Handoff (Secțiunea 8 din Blueprint)
La finalizarea dezvoltării și confirmarea pe GitHub (`origin/main`), acest pachet este livrat Agentului de Hosting (`proxmox-hosting&staff`):

```yaml
ORIGINZERO_NEW_TENANT_HANDOFF:
  entity_type: "TENANT"
  county_code: "HD"
  local_path: "tenants/HD/001-mugur757"
  slug: "757"
  fqdn: "757.prinpreajma.ro"
  www_fqdn: "www.757.prinpreajma.ro"
  canonical_root: "https://757.prinpreajma.ro/"
  future_alias: "https://757.originzero.art/"
  dns_records:
    apex_cname: "757.prinpreajma.ro -> hetzner1.banszky.men (2.31.102.36 / 2a01:4f8:c016:f3bb::1)"
    www_cname: "www.757.prinpreajma.ro -> 757.prinpreajma.ro"
    originzero_cname: "757.originzero.art -> hetzner1.banszky.men"
  github_repo: "git@github.com:seboriginzero/757.prinpreajma.ro.git"
  branch: "main"
  internal_container_port: 8080
  requires_websocket: true
  ssl_mode: "letsencrypt_webroot_multi_san"
  healthcheck_path: "/api/health"
  sitemap_path: "/sitemap.xml"
  database_type: "json"
  persistent_volumes:
    - "./data:/app/data" # chmod -R 0777 pe host pentru UID 1000
  secrets_file_local: "proxmox-hosting&staff/secrets/.env.757"
  hostico_media_storage:
    ftps_jail_path: "tenants/757/"
    https_base_url: "https://media-hostico.prinpreajma.ro/tenants/757/"
    https_validation_passed: true
  gitops_7_gates_verified: true
```

