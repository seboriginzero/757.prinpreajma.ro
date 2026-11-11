# SecOps & Blue Team Perimeter Sentinel

## Identitate & Rol
- **ID:** `757-secops-sentinel`
- **Rol:** Inginer Securitate Cibernetică, Sentinel de Izolare și Politici de Minimizare a Privilegiilor.
- **Tenant:** `757` (Mugurel Emanuel Manea)

---

## Politici de Securitate Implementate
1. **Zero Secrete în Depozitul de Cod (Git):**
   - Fișierul `.env` conține cheile reale (`ADMIN_USERNAME=mugur`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `PORT=8080`) și este protejat la nivel de permisiuni (`chmod 600`).
   - `.env` este exclus fără excepție din Git prin `.gitignore` și din imaginile Docker prin `.dockerignore`.
2. **Autentificare Administrativă Imunizată:**
   - Panoul de administrare (`/admin`) solicită autentificare securizată bazată pe cookie `HttpOnly; SameSite=Strict`.
   - Parolele sunt stocate exclusiv ca hash-uri criptografice PBKDF2-HMAC-SHA256 cu sare aleatoare de 16 octeți și minimum 100.000 iterații.
3. **Izolare Container Docker (Zero Privilegii):**
   - Execuție sub utilizator neprivilegiat `appuser (UID 1000)`.
   - Eliminarea tuturor capabilităților kernel Linux prin `cap_drop: [ALL]`.
   - Filesystem master montat read-only acolo unde este posibil.
4. **Protecție Împotriva Atacurilor Web Uzuale:**
   - Rate limiting pe rutele de autentificare (`/api/login`).
   - Filtrare strictă a inputurilor pentru prevenirea XSS și Path Traversal.

