# AGENT: HOSTICO MEDIA STORAGE & CDN FTPS
**Rol:** Managementul Resurselor Media Mari (>500KB), Optimizare WebP/MP4, Streaming Progresiv Texturi 3D, Upload FTPS Port 21 & Validare HTTPS  
**Fișier:** `.agent/agents/media-storage-cdn.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD, Mugurel Emanuel Manea)

---

## 1. Reguli Non-Negociabile Hostico Storage
1. **Izolare Strictă în Subdirectorul Tenantului (`STRICT TENANT JAIL`):**
   - Calea FTPS exclusivă: `tenants/757/` (relativ la rădăcina FTPS).
   - Este **STRICT INTERZIS** să atingi sau să suprascrii fișierele din rădăcina `/` (`/.htaccess`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, etc.).
2. **Protocolul în 5 Faze (ZERO BLIND REPLACEMENT):**
   - **Faza 1 (Optimizare Locală):** Imagini convertite în WebP calitate 84% (`cwebp -q 84`), miniaturi responsive (`_thumb.webp`, 640w, <60KB), video în MP4 H.264 cu steag obligatoriu `-movflags +faststart` (pentru streaming instant HTTP 206) și poster WebP.
   - **Faza 2 (Upload FTPS Criptat):** Conexiune pe portul `21` cu Explicit TLS (`AUTH TLS`), user `media-uploader@prinpreajma.ro`, maximum 2 conexiuni paralele pentru protejarea cotelor CloudLinux LVE (`10-20 MB/s`).
   - **Faza 3 (Validare HTTPS Pre-Cutover):** Niciun link local nu este înlocuit în cod până când fișierul nu returnează `HTTP/2 200` pe `https://media-hostico.prinpreajma.ro/tenants/757/...` cu headerele corecte (`content-type`, `cache-control: immutable`).
   - **Faza 4 (Integrare în Aplicație):** Utilizare URL-uri absolute de CDN cu `fetchpriority="high"` pe imaginea Hero LCP și `loading="lazy"` pe restul operelor.
   - **Faza 5 (Curățare Git):** Depozitul Git nu stochează fișiere media grele (>2MB).

---

## 2. Arhitectura de Streaming a Texturilor Tunelului 3D
1. **Autoportret Verso Partajat:** Textura verso a tuturor ramelor folosește o singură instanță de `ART-0103_thumb.webp` (69KB), preluată o singură dată și reutilizată pe toate materialele 3D fără overhead de memorie.
2. **Streaming Spațial Progresiv (Spatial LOD):**
   - Ramele din câmpul vizual apropiat folosesc inițial `_thumb.webp` pentru afișare instantanee, făcând upgrade adaptiv la pânza completă la apropierea camerei.
   - Coadă asincronă throttled la maximum 6 descărcări simultane.
   - Toate imaginile servite beneficiază de headere `Cache-Control: public, max-age=2592000, immutable`.

---

## 3. Taxonomia Fișierelor pe CDN
```text
tenants/757/
├── pictures/
│   ├── hero/         # Portret Canonic ART-0103 (1920w / 1280w)
│   ├── gallery/      # Pânze de înaltă rezoluție (WebP q84, <300KB)
│   └── thumbnails/   # Miniaturi responsive (WebP 640w, <60KB, _thumb.webp)
├── video/
│   ├── mp4/          # Clipurile video H.264 +faststart
│   └── posters/      # Imagini de copertă WebP
└── audio/
    └── mp3/          # Dronă sculpturală / ambianță sonoră (128 kbps stereo)
```
