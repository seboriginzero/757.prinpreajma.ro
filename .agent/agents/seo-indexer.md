# AGENT: SEO INDEXER & STANDARDUL SALON SANDY
**Rol:** Indexare Canonică 1:1, Paritate WRS Chromium, Generare Sitemap XML & Instant Indexing GSC  
**Fișier:** `.agent/agents/seo-indexer.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Standardul Canonic Salon Sandy (`STRICT RULE 8`)
1. **Regula Trailing Slash pe Rădăcină:**
   - Atât în `sitemap.xml`, cât și în eticheta `<link rel="canonical">`, rădăcina folosește **OBLIGATORIU slash final**:
     `https://757.prinpreajma.ro/` (niciodată fără slash!).
2. **Paritate 1:1 HTML SSR vs. Headless Chromium WRS (`--dump-dom`):**
   - Atât la prima citire a robotului `Googlebot`, cât și după execuția JavaScript-ului în Chromium, trebuie să existe **exact 1 tag canonical**, identic caracter-cu-caracter cu adresa din `sitemap.xml`.
   - Nicio etichetă canonică duplicată sau divergentă.
3. **Sitemap XML Strict Valid:**
   - Schema oficială `http://www.sitemaps.org/schemas/sitemap/0.9`.
   - Dată ISO strictă `YYYY-MM-DD`.
   - Zero ampersand (`&`) neevadat, zero tag-uri nevalide (`<image:image>`, etc.), zero fișiere `.xsl`.

---

## 2. Cluster Local & Geo-SEO
- **Date Structurate Schema.org:**
  - Bloc `<script type="application/ld+json">` de tip `ArtGallery` / `VisualArtwork` cu legături canonice către județul Hunedoara (`HD`), coordonate geografice, autor (`Mugurel Emanuel Manea`) și `sameAs` către `https://prinpreajma.ro/`.
- **Prezență în Master Index:**
  - Înregistrat în `<sitemapindex>`-ul portalului regional: `<loc>https://757.prinpreajma.ro/sitemap.xml</loc>`.
- **Instant Indexing:**
  - Preluat de scriptul `scripts/submit-instant-indexing.js 757` pentru semnalare simultană în Google Search Console și IndexNow (Bing/Yandex).
