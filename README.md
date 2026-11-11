# 757 — MUGUREL EMANUEL MANEA
## Arhivă de Artă Contemporană & Galerie Digitală Premium

**Site oficial în producție (FQDN):** [https://757.prinpreajma.ro](https://757.prinpreajma.ro)  
**Alias viitor confirmat:** `https://757.originzero.art`  
**Artist:** Mugurel Emanuel Manea (`@mugurelemanuelmanea` / `@bogdan_by757` / monograma `757`)  

---

## 1. Prezentarea Proiectului

Acest proiect reprezintă conversia riguroasă a unei arhive de 168 de capturi de ecran Instagram într-o arhivă digitală de muzeu și o galerie web luxury premium. Fiecare operă a fost extrasă, restaurată prudent de orice element parazit de rețea socială (săgeți și puncte de paginare), catalogată cu metadate de nivel academic și clasificată în cinci direcții critice distincte.

### Structura Colecției (167 de Opere):
1. **Anatomie Biomecanică & Osteologie Tehnologică** (107 opere) — Desene minuțioase în grafit și cărbune pur.
2. **Studii Cromatice & Guașă/Acrilic pe Hârtie** (30 opere) — Compoziții policrome cu pigmenți de teracotă, ocru, cobalt și turcoaz.
3. **Totemuri Criptice & Registre Runic-Arhitecturale** (16 opere) — Formate verticale cu litere ermetice („WRIGHT”, „MYSTERY”, „757”).
4. **Obiecte Sculpturale & Asamblaje Cyber-Surrealiste** (9 opere) — Instalații 3D cu platane HDD, pistoane hidraulice și încălțăminte.
5. **Perspectivă Deconstructivistă & Arhitectură Monumentală** (5 opere) — Viziuni spațiale monumentale și bolți subterane.

---

## 2. Arhitectura Tehnică & Sistemul de Galerie

- **Standarde:** HTML5 semantic, CSS modern (variabile CSS, CSS Grid, Flexbox, Container Queries), Vanilla ES6+ JavaScript.
- **Performanță:** Zero dependențe externe de rețea (node_modules), timp de încărcare sub 200ms, suport complet offline.
- **Formate media:** WebP responsive generat la calitate 88 (până la 1600px) și miniaturi WebP la calitate 82 (până la 500px).
- **Moduri Luxury de Vizualizare:**
  - `Salon Editorial`: Grilă dinamică asimetrică cu dezvăluire treptată a notelor critice.
  - `Atelier Imersiv`: Scară 1:1, fundal negru pur și zoom de înaltă rezoluție.
  - `Catalog Muzeal`: Registru tehnic arhivistic cu toate detaliile de proveniență.
- **Ambianță Duală (Recomandarea TIP):**
  - *Atelier Biomecanic / Dark Obsidian* (`#07080B`) — activ implicit.
  - *Sala de Lectură / Arhivă Pergament* (`#F6F3EB`) — comutare instantanee din interfață sau prin tasta `T`.

---

## 3. Rularea și Previzualizarea Locală

Pentru a vizualiza galeria local, folosiți serverul intern Python:

```bash
# În directorul rădăcină al proiectului:
python3 -m http.server 8080
```

Deschideți apoi în browser: [http://localhost:8080](http://localhost:8080)

### Scurtături de Tastatură în Galerie:
- `T` — Comutare ambianță (Dark Obsidian / Sala Pergament).
- `1` — Modul Salon Editorial.
- `2` — Modul Atelier Imersiv.
- `3` — Modul Catalog Muzeal.
- `Săgeți Stânga / Dreapta` — Navigare între opere în fereastra de inspecție.
- `Z` — Zoom / Pan pe detaliile hașurii.
- `Esc` — Închide fereastra de detaliu.

---

## 4. Server Integrat & Panou de Administrare Securizat

Proiectul include un server HTTP integrat cu suport REST API și interfață completă de administrare:

```bash
# Pornire server
python3 server.py
```

- **Galerie Publică:** `http://localhost:8080/`
- **Panou Administrare Securizat:** `http://localhost:8080/admin`
- **Utilizator Admin:** `mugur`
- **Parolă Generată:** `0%aKrKOeaJRaAxDQ$J8z` (configurabilă în `.env`)

### Capabilități Panou Admin:
- **Editare 167 Opere:** Modificare titlu, note curatoriale, note critice, suport/tehnică, clasificare taxonomică, taguri vizuale.
- **Editare Texte Generale:** Titlu pagină, meta descriere, anunț FQDN (`https://757.prinpreajma.ro` / `757.originzero.art`), secțiune Hero și statistici.
- **Profil Artist:** Nume, conturi Instagram, semnătură, texte biografice.
- **Taxonomie:** Cele 5 direcții critice în română și engleză cu descrieri detaliate.
- **Reconstrucție Instantanee:** Salvarea din admin rescrie baza de date și compilează automat `index.html`.

---

## 5. Publicare și Găzduire (Deploy)

Galeria este 100% statică și gata pentru publicare pe orice CDN modern:

### Netlify:
```bash
netlify deploy --prod --dir=.
```

### GitHub Pages / Vercel / Cloudflare Pages:
Rădăcina repository-ului conține direct `index.html`, `gallery.css`, `gallery.js` și folderul `data/`. Nu este necesară nicio etapă de build intermediar.

---

## 5. Structura Fișierelor din Proiect

```
001-mugur757/
├── index.html                 # Punctul de intrare al galeriei web premium
├── gallery.css                # Sistemul de design luxury (Dark Obsidian + Pergament)
├── gallery.js                 # Motorul interactiv (filtrare, căutare, moduri, modal)
├── README.md                  # Ghid tehnic și instrucțiuni de operare
├── tmp-insta-posts/           # [MASTER SURSĂ] 168 capturi originale needitate
└── data/
    ├── clean-crops/           # 167 decupaje master PNG restaurate prudent
    ├── sidebar-crops/         # 167 decupaje ale panoului Instagram (audit trasabilitate)
    ├── web-images/            # 334 imagini WebP responsive (full + thumbs)
    ├── metadata/              # 167 fișiere Markdown individuale cu YAML frontmatter
    ├── categories/            # taxonomy.json cu descrierea celor 5 direcții
    ├── artist_avatar.png      # Portretul de atelier al artistului
    ├── collection-index.json  # Catalogul structurat JSON complet
    ├── collection-index.csv   # Catalogul tabelar CSV complet
    ├── collection-index.md    # Indexul narativ și sinteza structurală
    ├── review-queue.md        # Registrul operațiunilor de verificare
    ├── decisions-log.md       # Jurnalul deciziilor tehnice și curatoriale
    └── internal-curatorial-report.md # Raportul critic extins
```

---

## 6. Unelte, Versiuni și Licențe Verificate

- **Python:** 3.14.3 (Licență PSF)
- **Pillow:** 13.0.0 (Licență HPND)
- **Node.js:** 25.8.2 (Licență MIT)
- **Fonturi Google:** Cormorant Garamond (OFL), Cinzel (OFL), JetBrains Mono (OFL)
- **Operele de Artă:** &copy; 2026 Mugurel Emanuel Manea. Toate drepturile rezervate artistului.

