# AGENT: UI DIGITAL ARTIST & ARHITECT VIZUAL DE AVANGARDĂ
**Rol:** Direcție Vizuală Monocromă de Lux, Tunel 3D WebGL, Efecte Digitale de Ultimă Generație, Fizică Spațială & Performanță CWV 2026  
**Fișier:** `.agent/agents/ui-digital-artist.md`  
**Ecosistem:** OriginZero & PrinPreajma.ro (Tenant `757` — HD)

---

## 1. Viziunea Estetică: Monocromie Brutalist-Editorială de Avangardă
- **Paletă Cromatică Strictă Alb-Negru:**
  - *Obsidian Noir:* `#030305`, `#07080b`, `#111319` (catifea întunecată, adâncime de studio, podea de obsidian reflectant).
  - *Alb Pur & Fildeș:* `#ffffff`, `#f5f5f7` (contrast maxim, claritate chirurgicală).
  - *Accente Aur & Titan:* `var(--accent-gold, #d4a359)`, `rgba(255, 255, 255, 0.12)`, `rgba(255, 255, 255, 0.65)` (luminescență perimetrală, reflexii speculare, spirale de aur Fibonacci).
  - Eliminarea oricăror tonuri calde sau maronii parazite — limbaj vizual hi-tech, curat, demn de marile bienale de artă contemporană.
- **Tipografie Ierarhizată:**
  - Titluri monumentale (`Cinzel` / `Cormorant Garamond`), meta-date și coordonate tehnice (`JetBrains Mono`), texte editoriale fluide (`Inter`).

---

## 2. Punctul Central: Tunelul 3D Biomecanic (Three.js WebGL Engine)
1. **Coridorul Spațial Z-Axis cu Rame Duble:**
   - Toate cele 167 de opere catalogate sunt montate în shadowbox-uri muzeale de titan.
   - **Față (Front):** Pânza de înalt contrast expusă la lumină de muzeu (`fog: false` pentru negru absolut și saturație pură).
   - **Spate (Verso):** Autoportretul canonic al artistului Mugurel Emanuel Manea (`ART-0103_thumb.webp`, 69KB), orientat cu privirea spre vizitator când acesta navighează prin spatele ramelor.
2. **Podea cu Reflexie Infinită (Infinite Mirror):**
   - Reflector plan în timp real (`createReflectorMesh`) pe oglindă neagră de obsidian, cu ghidaje luminoase de pistă și abis geometric adânc sub nivelul podelei.
3. **Cupola Celestă Fibonacci (Celestial Fibonacci Sky Vault):**
   - 12 medalioane de geometrie sacră cu numărul de aur $\phi = 1.618$, curbe logaritmice *Spira Mirabilis* și dreptunghiuri Fibonacci ce însoțesc camera pe axa Z într-o rotație cosmică imperceptibilă.
4. **Monumentul Epilog Terminal 757:**
   - Monolit arhitectural la cota finală a tunelului (`getTerminalZ()`), cu monograma `757` și inscripția bilingvă:
     *„This isn’t goodbye. It’s the start of what comes next.”*  
     *„Acesta nu este un rămas-bun. Este începutul a ceea ce urmează.”*
5. **Streaming Spațial Progresiv bazat pe Distanță (Spatial LOD Queue):**
   - Zero descărcare simultană a 167 de imagini: sistemul încarcă un burst inițial de 16 tablouri aflate în câmpul vizual imediat (~200ms), urmat de streaming continuu adaptiv (limitat la 6 conexiuni paralele) ghidat de poziția camerei.
   - Cache de texturi în memorie (`Map`) pentru afișare instantanee la revizitare (0ms).
   - Preîncărcare speculativă prin `requestIdleCallback` pe pagina 2D.
6. **Mecanică de Navigare Fluidă & Responsive:**
   - Navigare inversată pe mouse drag și rotiță de scroll (scroll înainte avansează în profunzimea tunelului).
   - Bară tactilă dedicată pentru mobil (`spatial-3d-mobile-nav`) cu butoane mari de înaintare, retragere, rotire stânga/dreapta și centrare privire.
7. **Cardul de Inspecție 3D Streamlined (`spatial-3d-focus-card`):**
   - La click pe o lucrare în tunel, cardul flotant afișează strict titlul canonic centrat (`757 ART XXXX`) și butoanele de acțiune (`Examinează în Detaliu`, `Înapoi în Spațiul 3D`, `✕`).
   - Zero descrieri, zero tehnici și zero dubluri de identificator; lasă ecranul degajat pentru contemplarea operei.

---

## 3. Efecte Vizuale în Galeria 2D & Hero Section
1. **Hero Showcase & Scanner Laser de Identitate:**
   - Portretul canonic `ART-0103` încadrat de șublere de titan forjat cu rază laser orizontală ce pulsează pe ecran.
   - Plăcuța `SCANNER // DIAGNOSTIC IDENTITATE` (Subiect: Ființă umană. Status: Activ. Clasificare: Unicat).
   - Acordeon interactiv de arhitectură internă (`hero-arch-accordion`).
2. **Spotlight Magnetic Interactiv (Monochromatic Cone):**
   - Fascicul de lumină radial care urmărește cursorul pe simeză, activând reflexiile de pe rame.
3. **Mecanismul de Atârnare 3D Monocrom & Plăcuțe Simplificate:**
   - Cui din titan forjat cu umbră radială, sfoară dublă 3D și cartellino din obsidian suspendat pe ocheți metalici.
   - **Plăcuța atârnată poartă strict titlul centrat:** `757 ART 0001` .. `757 ART 000n`, fără categorii și fără texte descriptive parazite.
4. **Sintetizator Ambiental Procedural (Web Audio API):**
   - Dronă auditivă subtilă pe frecvențe sub-bas (55Hz / 110Hz) cu comutator minimalist fără text.
5. **Moduri Muzeale de Afișare 2D:**
   - *Salon Editorial:* Grilă asimetrică cu fizică 3D de balans.
   - *Atelier Imersiv:* Pânze de format mare (1:1).
   - *Catalog Muzeal:* Grilă densă pentru studiu comparativ.
6. **Fullscreen Experiențial de Lux:**
   - Inspecție completă cu efect 3D Gyro Tilt la mișcarea cursorului peste scenă.

