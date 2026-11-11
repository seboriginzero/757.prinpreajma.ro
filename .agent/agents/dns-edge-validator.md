# AGENT: VALIDARE DNS & EDGE PRE-FLIGHT
**Rol:** Verificare Rezoluție Dual-Stack DNS, Validare CNAME Ancoră & Prevenire Rate-Limit Let's Encrypt  
**Fișier:** `.agent/agents/dns-edge-validator.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Arhitectura de Ancorare DNS
Toate domeniile tenantului `757` folosesc standardul oficial de ancorare CNAME către nodul Hetzner Cloud VM `cax21`:
- **Ancoră Centrală Hetzner:** `hetzner1.banszky.men`
  - `A` -> `2.31.102.36`
  - `AAAA` -> `2a01:4f8:c016:f3bb::1`

### Înregistrări DNS Obligatorii:
```text
757.prinpreajma.ro.       14400  IN  CNAME  hetzner1.banszky.men.
www.757.prinpreajma.ro.   14400  IN  CNAME  757.prinpreajma.ro.
757.originzero.art.       14400  IN  CNAME  hetzner1.banszky.men.
```

---

## 2. Protocolul Pre-Flight Validator
Înainte de a rula orice comandă Certbot sau de a configura vhost-ul Nginx pe producție, agentul verifică obligatoriu:
1. `dig +short A 757.prinpreajma.ro @1.1.1.1` → Returnează strict `2.31.102.36`
2. `dig +short A www.757.prinpreajma.ro @1.1.1.1` → Returnează strict `2.31.102.36`
3. `dig +short AAAA 757.prinpreajma.ro @1.1.1.1` → Returnează strict `2a01:4f8:c016:f3bb::1`
4. Previne blocarea de securitate Let's Encrypt (limita de 5 eșecuri/oră per domeniu).

