# builder.py
import json, os, html

def rebuild_site():
    with open('data/collection-index.json', 'r', encoding='utf-8') as f:
        items = json.load(f)

    with open('data/categories/taxonomy.json', 'r', encoding='utf-8') as f:
        categories = json.load(f)

    site_content_path = 'data/site-content.json'
    if os.path.exists(site_content_path):
        with open(site_content_path, 'r', encoding='utf-8') as f:
            sc = json.load(f)
    else:
        sc = {}

    gen = sc.get('general', {})
    hero = sc.get('hero', {})
    art = sc.get('artist', {})
    integ = sc.get('integrity', {})
    foot = sc.get('footer', {})

    site_title = gen.get('site_title', '757 — MUGUREL EMANUEL MANEA | Arhivă de Artă & Galerie Digitală')
    site_desc = gen.get('site_description', 'Arhivă curatorială și galerie digitală premium dedicată operelor artistului Mugurel Emanuel Manea (757). Suprarealism biomecanic, totemuri criptice și asamblaje cibernetice.')
    prim_dom = gen.get('primary_domain', 'https://757.prinpreajma.ro')
    sec_dom = gen.get('secondary_domain', '757.originzero.art')
    brand_name = gen.get('header_brand_name', 'MUGUREL EMANUEL MANEA')
    brand_sub = gen.get('header_brand_sub', 'ATELIER & ARHIVĂ CURATORIALĂ')
    announcement = gen.get('announcement_text', 'ARHIVĂ OFICIALĂ · FQDN: 757.prinpreajma.ro · Alias viitor: 757.originzero.art')

    hero_badge = hero.get('badge', 'CATALOGUL GENERAL AL OPERELOR')
    hero_title = hero.get('title', 'Suprarealism Biomecanic <br>& Tensiune Deconstructivistă')
    hero_lead = hero.get('lead', 'O explorare riguroasă a fuziunii dintre anatomie, osatură, circuite cibernetice și scrieri criptice. 167 de opere extrase, restaurate prudent fără alterarea desenului și clasificate în cinci axe estetice fundamentale.')
    stat_dig = hero.get('stat_digitized', '167')
    stat_cats = hero.get('stat_categories', '5')
    stat_posts = hero.get('stat_posts', '76')
    stat_clean = hero.get('stat_cleaned', '100%')

    art_name = art.get('name', 'Mugurel Emanuel Manea')
    art_ig = art.get('instagram', '@mugurelemanuelmanea')
    art_arch_ig = art.get('archive_instagram', '@bogdan_by757')
    art_sig = art.get('signature', '757')
    art_p1 = art.get('paragraph_1', 'Mugurel Emanuel Manea dezvoltă un limbaj vizual de o densitate rară, centrat pe anatomia internă a tehnologiei și hibridizarea formelor organice. Lucrările sale chestionează granița dintre corpul biologic vulnerabil și armatura mecanică indestructibilă.')
    art_p2 = art.get('paragraph_2', 'Semnătura recurentă 757 funcționează ca un sigiliu alchimic și tehnic, prezent în mod sistematic pe desene, pe registrele verticale și în titlurile poematice ale postărilor. Galeria digitală îi reunește creația într-un spațiu de contemplare purificat de orice element parazit de rețea socială.')

    b1_t = integ.get('box1_title', 'Principiul Conservării Surselor')
    b1_x = integ.get('box1_text', 'Toate cele 168 de capturi originale din tmp-insta-posts/ sunt conservate nemodificate ca arhivă master read-only. Fiecare operă păstrează o legătură de trasabilitate directă către captura sursă și decupajul lateral al postării.')
    b2_t = integ.get('box2_title', 'Eliminarea Elementelor Parazite')
    b2_x = integ.get('box2_text', 'Săgețile de navigare în carusel și punctele de paginare Instagram din subsol au fost îndepărtate cu maximă prudență prin interpolare perimetrală a texturii din imediata vecinătate, fără a recurge la generare artificială speculativă pe compoziție.')
    b3_t = integ.get('box3_title', 'Separarea Observației de Critică')
    b3_x = integ.get('box3_text', 'Catalogul delimitează strict observațiile factuale verificabile (hașură, suport, pigmenți, raport de aspect) de interpretările estetice și ipotezele formulate de criticul independent.')

    copy_txt = foot.get('copyright', '© 2026 Mugurel Emanuel Manea (757). Proiectat și arhivat de echipa interdisciplinară AI.')
    tech_txt = foot.get('tech_note', 'Construit pe standarde web moderne · HTML5 semantic · Imagini WebP responsive · Zero dependențe externe.')

    # Category counts
    cat_counts = {}
    for it in items:
        for c in it.get('categories', []):
            cat_counts[c] = cat_counts.get(c, 0) + 1

    # Render category pills
    pill_html = [f'<button class="cat-pill active" data-filter="all" role="tab" aria-selected="true">Toate Lucrările <span class="pill-count">{len(items)}</span></button>']
    for cat in categories:
        cid = cat['id']
        cnt = cat_counts.get(cid, 0)
        cname = cat.get('name_ro', cid)
        short_name = cname.split('&')[0].strip()
        pill_html.append(f'<button class="cat-pill" data-filter="{cid}" role="tab" aria-selected="false">{html.escape(short_name)} <span class="pill-count">{cnt}</span></button>')
    pills_rendered = '\n        '.join(pill_html)

    # Render directions section cards
    roman_map = {0: 'I', 1: 'II', 2: 'III', 3: 'IV', 4: 'V'}
    directii_cards = []
    for idx, cat in enumerate(categories):
        cid = cat['id']
        cnt = cat_counts.get(cid, 0)
        cname = cat.get('name_ro', cid)
        cdesc = cat.get('description', '')
        roman = roman_map.get(idx, str(idx+1))
        directii_cards.append(f'''        <article class="directie-card">
          <div class="directie-index">{roman}</div>
          <h3 class="directie-title">{html.escape(cname)}</h3>
          <p class="directie-desc">
            {html.escape(cdesc)}
          </p>
          <div class="directie-meta">
            <span class="badge">{cnt} Opere</span>
            <button class="btn-quick-filter" data-category="{cid}">Filtrează &rarr;</button>
          </div>
        </article>''')
    directii_rendered = '\n\n'.join(directii_cards)

    # Pre-render initial 24 artwork cards with 3D hanging rig for instant paint
    initial_cards = []
    for idx, item in enumerate(items[:24]):
        thumb_src = f"data/web-images/{item.get('thumbnail_file', '')}"
        item_id = item.get('id', '')
        item_title = item.get('title', f"Opus 757 — {item_id}")
        alt_text = item.get('alt_text', 'Biomechanical surrealist artwork by Mugurel Emanuel Manea')
        cat_name = item.get('category_name', '')
        critic_note = item.get('critic_note', '')
        initial_cards.append(f'''        <article class="art-card" data-idx="{idx}" role="button" tabindex="0" aria-label="Deschide {html.escape(item_title)}">
          <!-- 1. Pictura înrămată pe perete -->
          <div class="art-frame">
            <div class="card-specular-glare"></div>
            <div class="art-media">
              <span class="art-badge-overlay">{item_id}</span>
              <img src="{thumb_src}" alt="{html.escape(alt_text)}" loading="lazy" decoding="async">
            </div>
          </div>

          <!-- 2. Mecanism de atârnare: Cui bătut în perete + Sfoară 3D -->
          <div class="hanging-rig" aria-hidden="true">
            <div class="wall-nail">
              <span class="nail-shadow"></span>
              <span class="nail-cap"></span>
            </div>
            <svg class="hanging-twine" viewBox="0 0 160 48" preserveAspectRatio="none">
              <!-- Sfoară în V cu umbră 3D proiectată pe perete -->
              <line x1="82" y1="10" x2="38" y2="48" class="twine-shadow" />
              <line x1="82" y1="10" x2="126" y2="48" class="twine-shadow" />
              <line x1="80" y1="8" x2="36" y2="46" class="twine-cord" />
              <line x1="80" y1="8" x2="124" y2="46" class="twine-cord" />
            </svg>
          </div>

          <!-- 3. Plăcuța cu descriere atârnată de sfoară (Efect 3D) -->
          <div class="art-hanging-tag">
            <div class="tag-eyelets">
              <span class="eyelet left"></span>
              <span class="eyelet right"></span>
            </div>
            <div class="art-meta-row">
              <span class="art-id">{item_id}</span>
              <span class="archival-stamp">OPUS 757</span>
              <span class="art-cat-name">{html.escape(cat_name)}</span>
            </div>
            <h3 class="art-card-title">{html.escape(item_title)}</h3>
            <p class="art-critic-snippet">{html.escape(critic_note)}</p>
          </div>
        </article>''')
    initial_cards_rendered = '\n'.join(initial_cards)

    json_dataset = json.dumps(items, ensure_ascii=False)

    html_content = f'''<!DOCTYPE html>
<html lang="ro" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(site_title)}</title>
  <meta name="description" content="{html.escape(site_desc)}">
  <link rel="canonical" href="{prim_dom}">
  <meta property="og:title" content="{html.escape(site_title)}">
  <meta property="og:description" content="{html.escape(site_desc)}">
  <meta property="og:url" content="{prim_dom}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="{prim_dom}/data/web-images/ART-0001.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#07080b">

  <!-- Google Fonts: Cinzel, Cormorant Garamond & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="gallery.css">
</head>
<body>

  <!-- Bleeding-Edge Ambient Magnetic Spotlight -->
  <div id="ambient-spotlight" aria-hidden="true"></div>

  <!-- Top Announcement / FQDN Bar -->
  <aside class="luxury-topbar" aria-label="Notă oficială">
    <div class="topbar-inner">
      <span class="topbar-tag">ARHIVĂ OFICIALĂ</span>
      <span class="topbar-fqdn">FQDN: <a href="{prim_dom}" target="_blank" rel="noopener">{prim_dom.replace('https://', '')}</a> &middot; Alias viitor: <code>{sec_dom}</code></span>
      <span class="topbar-status"><span class="pulse-dot"></span> {len(items)} Opere &middot; Restaurare Prudentă Activă</span>
      <a href="/admin" class="topbar-admin-link" title="Panou de Administrare Curatorială" style="margin-left:auto; color:var(--text-primary); font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px; opacity:0.85;">🔒 Admin</a>
    </div>
  </aside>

  <!-- Kinetic Infinite Marquee Ticker -->
  <div class="kinetic-ticker" aria-hidden="true">
    <div class="ticker-track">
      <div class="ticker-item"><strong>757 ARCHIVE</strong> <span class="ticker-sep">//</span> MUGUREL EMANUEL MANEA</div>
      <div class="ticker-item"><strong>167 MASTER OPERA</strong> <span class="ticker-sep">//</span> RESTAURARE PRUDENTĂ DEFINITIVĂ</div>
      <div class="ticker-item"><strong>TENANT HD-001</strong> <span class="ticker-sep">//</span> HUNEDOARA RO</div>
      <div class="ticker-item"><strong>5 CRITICAL WINGS</strong> <span class="ticker-sep">//</span> BIOMECHANICAL OSTEOLOGY &middot; CRYPTIC TOTEMS &middot; CYBER-SURREALISM &middot; MONUMENTAL AXIS</div>
      <div class="ticker-item"><strong>FQDN</strong> <span class="ticker-sep">//</span> 757.PRINPREAJMA.RO &middot; 757.ORIGINZERO.ART</div>
      <div class="ticker-item"><strong>757 ARCHIVE</strong> <span class="ticker-sep">//</span> MUGUREL EMANUEL MANEA</div>
      <div class="ticker-item"><strong>167 MASTER OPERA</strong> <span class="ticker-sep">//</span> RESTAURARE PRUDENTĂ DEFINITIVĂ</div>
      <div class="ticker-item"><strong>TENANT HD-001</strong> <span class="ticker-sep">//</span> HUNEDOARA RO</div>
      <div class="ticker-item"><strong>5 CRITICAL WINGS</strong> <span class="ticker-sep">//</span> BIOMECHANICAL OSTEOLOGY &middot; CRYPTIC TOTEMS &middot; CYBER-SURREALISM &middot; MONUMENTAL AXIS</div>
      <div class="ticker-item"><strong>FQDN</strong> <span class="ticker-sep">//</span> 757.PRINPREAJMA.RO &middot; 757.ORIGINZERO.ART</div>
    </div>
  </div>

  <!-- Main Navigation Header -->
  <header class="luxury-header" id="site-header">
    <div class="header-container">
      <div class="brand-group">
        <a href="#hero" class="brand-link">
          <span class="brand-sig">757</span>
          <span class="brand-name">{html.escape(brand_name)}</span>
        </a>
        <span class="brand-sub">{html.escape(brand_sub)}</span>
      </div>

      <nav class="main-nav" aria-label="Navigare principală">
        <a href="#galerie" class="nav-item active">Colecție</a>
        <a href="#directii" class="nav-item">Direcții Critice</a>
        <a href="#artist" class="nav-item">Despre Artist</a>
        <a href="#raport" class="nav-item">Raport Critic</a>
      </nav>

      <div class="header-controls">
        <!-- Ambience Synthesizer Toggle -->
        <button id="ambience-toggle" class="btn-control btn-ambience" title="Comutare Ambianță Sonoră Biomecanică (Web Audio)">
          <span class="amb-dot"></span>
          <span id="amb-label">SOUND: OFF</span>
        </button>

        <!-- Ambience Switcher (TIP Recomandarea Echipei) -->
        <button id="theme-toggle" class="btn-control" title="Comutare ambianță (Tasta T)" aria-label="Comutare temă">
          <span class="theme-icon icon-dark">🌘 Obsidian</span>
          <span class="theme-icon icon-light">◻ White Cube</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section: Curatorial Overture -->
  <section class="hero-section" id="hero">
    <div class="hero-backdrop"></div>
    <div class="hero-content">
      <div class="hero-badge">{html.escape(hero_badge)}</div>
      <h1 class="hero-title">{hero_title}</h1>
      <p class="hero-lead">
        {html.escape(hero_lead)}
      </p>
      
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-num">{stat_dig}</span>
          <span class="stat-lbl">Opere Digitizate</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{stat_cats}</span>
          <span class="stat-lbl">Direcții Critice</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{stat_posts}</span>
          <span class="stat-lbl">Evenimente Postare</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{stat_clean}</span>
          <span class="stat-lbl">Curățat de Interfață</span>
        </div>
      </div>

      <div class="hero-actions">
        <a href="#galerie" class="btn-luxury primary">Explorează Galeria</a>
        <a href="#directii" class="btn-luxury secondary">Vezi Analiza Critică</a>
      </div>
    </div>
  </section>

  <!-- Gallery Control Center: Filters, Search, Display Modes -->
  <main class="gallery-wrapper" id="galerie">
    <div class="gallery-toolbar">
      
      <!-- Category Tabs (Cele 5 Direcții Critice) -->
      <div class="category-pills" role="tablist" aria-label="Filtrare categorii">
        {pills_rendered}
      </div>

      <!-- Action Row: Search & Luxury View Modes -->
      <div class="toolbar-actions">
        <!-- Live Search -->
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="gallery-search" placeholder="Căutare după ID, tehnică, tag..." aria-label="Căutare în colecție">
          <button id="search-clear" class="btn-clear" aria-label="Șterge căutarea">&times;</button>
        </div>

        <!-- Luxury Display Modes Switcher -->
        <div class="view-modes" aria-label="Moduri de afișare galerie">
          <button class="btn-view" data-view="wings" title="Cele 5 Săli Tematice (Clasificare Muzeală)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="3" width="5.5" height="18" rx="1"></rect>
              <rect x="9.25" y="3" width="5.5" height="18" rx="1"></rect>
              <rect x="16.5" y="3" width="5.5" height="18" rx="1"></rect>
            </svg>
            <span class="view-label">5 Săli</span>
          </button>

          <button class="btn-view active" data-view="editorial" title="Mod Salon Editorial (Grilă Asimetrică)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </svg>
            <span class="view-label">Salon</span>
          </button>
          
          <button class="btn-view" data-view="atelier" title="Mod Atelier Imersiv (Format Mare)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
            <span class="view-label">Atelier</span>
          </button>

          <button class="btn-view" data-view="ledger" title="Mod Catalog Muzeal (Registru Structurat)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span class="view-label">Catalog</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Result Count & Status -->
    <div class="gallery-feedback">
      <span id="results-count">Se afișează {len(items)} din {len(items)} de opere</span>
      <span class="restoration-badge" title="Toate săgețile și punctele Instagram au fost eliminate în faza de curățare">
        &check; Imagini Curățate &middot; Rezoluție Retina WebP
      </span>
    </div>

    <!-- Gallery Grid Container -->
    <div class="gallery-container view-editorial" id="gallery-grid">
{initial_cards_rendered}
    </div>

    <!-- Pagination / Progressive Load -->
    <div class="gallery-pagination" id="gallery-pagination">
      <button id="btn-load-more" class="btn-luxury secondary">Încarcă Mai Multe Opere</button>
    </div>
  </main>

  <!-- Thematic Sections: Cele 5 Direcții Critice Detaliate -->
  <section class="section-directii" id="directii">
    <div class="section-container">
      <div class="section-header">
        <span class="section-subtitle">TAXONOMIE &amp; DIRECȚIE CURATORIALĂ</span>
        <h2 class="section-title">Cele Cinci Axe ale Universului 757</h2>
        <p class="section-lead">Analiza criticului independent privind structura, tensiunea formei și materialitatea lucrărilor.</p>
      </div>

      <div class="directii-grid">
{directii_rendered}
      </div>
    </div>
  </section>

  <!-- Artist Identity Section -->
  <section class="section-artist" id="artist">
    <div class="section-container">
      <div class="artist-layout">
        <div class="artist-visual">
          <div class="avatar-frame">
            <img src="data/artist_avatar.png" alt="{html.escape(art_name)} ({art_sig})" class="artist-avatar" loading="lazy">
          </div>
          <div class="artist-monogram">{html.escape(art_sig)}</div>
        </div>

        <div class="artist-bio">
          <span class="section-subtitle">PROFILUL ARTISTULUI</span>
          <h2 class="artist-title">{html.escape(art_name)}</h2>
          <div class="artist-credentials">
            <span>Cont Instagram: <code>{html.escape(art_ig)}</code></span>
            <span>Arhivă anterioară: <code>{html.escape(art_arch_ig)}</code></span>
            <span>Semnătură canonică: <strong>{html.escape(art_sig)}</strong></span>
          </div>

          <div class="artist-text">
            <p>
              {html.escape(art_p1)}
            </p>
            <p>
              {html.escape(art_p2)}
            </p>
          </div>

          <div class="artist-domains">
            <div class="domain-card">
              <span class="domain-lbl">Domeniu Web Principal:</span>
              <a href="{prim_dom}" class="domain-link" target="_blank">{prim_dom}</a>
            </div>
            <div class="domain-card">
              <span class="domain-lbl">Alias Viitor:</span>
              <span class="domain-link">https://{sec_dom}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Curatorial Report Section -->
  <section class="section-raport" id="raport">
    <div class="section-container">
      <div class="section-header">
        <span class="section-subtitle">DOCUMENTAȚIE CURATORIALĂ &amp; CONTROL AL CALITĂȚII</span>
        <h2 class="section-title">Integritatea Arhivei și Trasabilitatea Surselor</h2>
      </div>

      <div class="raport-cards">
        <div class="raport-box">
          <h3>{html.escape(b1_t)}</h3>
          <p>
            {html.escape(b1_x)}
          </p>
        </div>

        <div class="raport-box">
          <h3>{html.escape(b2_t)}</h3>
          <p>
            {html.escape(b2_x)}
          </p>
        </div>

        <div class="raport-box">
          <h3>{html.escape(b3_t)}</h3>
          <p>
            {html.escape(b3_x)}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Luxury Modal Inspector (Deep View & Zoom) -->
  <dialog class="luxury-modal" id="artwork-modal" aria-labelledby="modal-title" aria-modal="true">
    <div class="modal-backdrop" id="modal-backdrop"></div>
    <div class="modal-dialog">
      
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-cat" id="modal-category">Categorie</span>
          <h2 class="modal-heading" id="modal-title">Opus 757 — ART-0001</h2>
        </div>
        
        <div class="modal-header-actions">
          <button id="modal-prev-btn" class="btn-icon" title="Opera Anterioară (←)" aria-label="Opera Anterioară">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span id="modal-counter-badge" class="modal-counter-pill" style="display:inline-flex; align-items:center; font-family:var(--font-mono); font-size:0.75rem; color:var(--text-primary); font-weight:700; padding:0 0.5rem;">1 / 167</span>
          <button id="modal-next-btn" class="btn-icon" title="Opera Următoare (→)" aria-label="Opera Următoare">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button id="modal-zoom-btn" class="btn-icon" title="Comutare Zoom Detaliu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button id="modal-fs-trigger-btn" class="btn-icon" title="Lansează Experiența Fullscreen (Tasta F)" aria-label="Fullscreen">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <button id="modal-close-btn" class="btn-icon" title="Închide (Esc)" aria-label="Închide fereastra">&times;</button>
        </div>
      </div>

      <!-- Modal Body (Two-Column Exhibition View) -->
      <div class="modal-body">
        <!-- Visual Column (100% Clean Artwork View, Zero Overlays) -->
        <div class="modal-canvas-pane">
          <div class="image-viewport" id="image-viewport" title="Click sau Lupă pentru Zoom / Panoramează cu mouse-ul">
            <div class="image-wrapper" id="image-wrapper">
              <img src="" alt="" id="modal-image" class="modal-img">
            </div>
          </div>
        </div>

        <!-- Curatorial Dossier Column (3D Hanging Plaque on Studio Wall) -->
        <div class="modal-info">
          
          <!-- Mecanism de Atârnare: Cui Bătut în Perete + Sfoară 3D -->
          <div class="modal-hanging-rig" aria-hidden="true">
            <div class="wall-nail">
              <span class="nail-shadow"></span>
              <span class="nail-cap"></span>
            </div>
            <svg class="hanging-twine" viewBox="0 0 220 54" preserveAspectRatio="none">
              <!-- Sfoară în V cu umbră 3D proiectată pe perete -->
              <line x1="112" y1="12" x2="42" y2="54" class="twine-shadow" />
              <line x1="112" y1="12" x2="178" y2="54" class="twine-shadow" />
              <line x1="110" y1="10" x2="40" y2="52" class="twine-cord" />
              <line x1="110" y1="10" x2="176" y2="52" class="twine-cord" />
            </svg>
          </div>

          <!-- Plăcuța Curatorială 3D Atârnată de Cui -->
          <div class="modal-plaque-card">
            <div class="plaque-eyelets">
              <span class="eyelet left"></span>
              <span class="eyelet right"></span>
            </div>

            <div class="plaque-top-meta">
              <span class="plaque-stamp">OPUS 757 &middot; ARHIVĂ DE ARTĂ</span>
              <span class="info-val code" id="modal-id">ART-0001</span>
            </div>

            <div class="info-section">
              <span class="info-label">OBSERVAȚIE CURATORIALĂ (OBIECTIVĂ)</span>
              <p class="info-text" id="modal-curatorial"></p>
            </div>

            <div class="info-section">
              <span class="info-label">ANALIZĂ CRITICĂ INDEPENDENTĂ</span>
              <blockquote class="info-quote" id="modal-critic"></blockquote>
            </div>

            <div class="info-section">
              <span class="info-label">IPOTEZĂ TEHNICĂ &amp; SUPORT</span>
              <span class="info-val medium-val" id="modal-medium"></span>
            </div>

            <div class="info-grid">
              <div class="grid-item">
                <span class="info-label">STATUS RESTAURARE</span>
                <span class="info-val status" id="modal-status">Curățat (Master)</span>
              </div>
              <div class="grid-item">
                <span class="info-label">EVENIMENT POSTARE</span>
                <span class="info-val" id="modal-post">POST-0001 (1/1)</span>
              </div>
              <div class="grid-item">
                <span class="info-label">RAPORT ASPECT</span>
                <span class="info-val code" id="modal-ratio">0.80</span>
              </div>
            </div>

            <div class="info-section">
              <span class="info-label">TAGURI VIZUALE</span>
              <div class="tag-cloud" id="modal-tags"></div>
            </div>

            <div class="info-section provenance">
              <span class="info-label">TRASABILITATE SURSĂ MASTER</span>
              <div class="provenance-row">
                <span class="prov-file" id="modal-source-file"></span>
                <a href="#" target="_blank" id="modal-source-link" class="btn-prov" title="Vezi captura completă a postării Instagram cu bara laterală">
                  Audit Captură &rarr;
                </a>
              </div>
            </div>

            <!-- Butoane Rapide Navigare Plăcuță -->
            <div class="modal-plaque-nav">
              <button id="modal-plaque-prev" class="btn-plaque-nav" title="Opera Anterioară">
                &larr; Anterior
              </button>
              <button id="modal-plaque-next" class="btn-plaque-nav" title="Opera Următoare">
                Următor &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <!-- Luxury Footer -->
  <footer class="luxury-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="f-sig">757</span>
          <span class="f-name">{html.escape(brand_name)}</span>
          <p class="f-desc">Arhivă de Artă Contemporană &middot; Suprarealism Biomecanic &middot; Toate drepturile rezervate artistului.</p>
        </div>

        <div class="footer-links">
          <h4>Navigare Arhivă</h4>
          <ul>
            <li><a href="#galerie">Colecția Completă</a></li>
            <li><a href="#directii">Cele 5 Direcții Critice</a></li>
            <li><a href="#artist">Despre Mugurel Emanuel Manea</a></li>
            <li><a href="#raport">Integritate &amp; Metodologie</a></li>
          </ul>
        </div>

        <div class="footer-domains">
          <h4>Domenii Oficiale</h4>
          <ul>
            <li><strong>Producție:</strong> <a href="{prim_dom}" target="_blank">{prim_dom.replace('https://', '')}</a></li>
            <li><strong>Alias Viitor:</strong> <code>{sec_dom}</code></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>{html.escape(copy_txt)}</p>
        <p class="footer-tech">{html.escape(tech_txt)}</p>
      </div>
    </div>
  </footer>

  <!-- Luxury Fullscreen Experience Overlay (5 Bespoke Classifications) -->
  <div class="luxury-fs-overlay fs-overlay" id="luxury-fullscreen-overlay" role="dialog" aria-modal="true" aria-label="Galerie Fullscreen Experiențială">
    <!-- Top HUD -->
    <div class="fs-hud-top">
      <div class="fs-meta-group">
        <span class="fs-wing-badge" id="fs-wing-badge">SALA I</span>
        <h2 class="fs-artwork-title" id="fs-opus-title">Opus 757 — ART-0001</h2>
        <span class="fs-anim-indicator" id="fs-anim-indicator">Animație: The Biomechanical Osteo-Pulse &amp; Calipers</span>
      </div>
      <div class="fs-controls-top">
        <button class="btn-fs-icon" id="fs-close-btn" title="Închide Fullscreen (Esc)">&times;</button>
      </div>
    </div>

    <!-- Main Stage -->
    <div class="fs-stage" id="fs-stage">
      <div class="fs-artwork-frame" id="fs-artwork-frame">
        <!-- Dynamic Layer Components for Bespoke Animations -->
        <div class="fs-caliper top-left"></div>
        <div class="fs-caliper top-right"></div>
        <div class="fs-caliper bottom-left"></div>
        <div class="fs-caliper bottom-right"></div>
        <div class="fs-osteo-scan"></div>
        <div class="fs-runic-beam"></div>
        <div class="fs-ambient-runes"></div>
        <div class="fs-pigment-aura"></div>
        <div class="fs-platter-gleam"></div>
        <div class="fs-telemetry-hud"><span>SCAN // 757 ARCHIVE</span><span>GYRO 3D // CALIBRATED</span></div>
        <div class="fs-axonometric-lines"></div>

        <img src="" alt="" id="fs-image" class="fs-artwork-img">
      </div>
    </div>

    <!-- Bottom HUD -->
    <div class="fs-hud-bottom">
      <div class="fs-nav-arrows">
        <button class="btn-fs-icon" id="fs-prev-btn" title="Opera Anterioară (&larr;)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="btn-fs-icon" id="fs-next-btn" title="Opera Următoare (&rarr;)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div class="fs-critic-strip">
        <p id="fs-critic-text"></p>
      </div>

      <div class="fs-category-pills" id="fs-category-pills">
        <!-- Injected by gallery.js for 5 classifications -->
      </div>
    </div>
  </div>

  <!-- Embed collection data directly for instant offline rendering -->
  <script>
    window.COLLECTION_DATA = {json_dataset};
  </script>

  <script src="gallery.js"></script>
</body>
</html>'''

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print('Rebuilt index.html successfully with updated content and dataset!')

if __name__ == '__main__':
    rebuild_site()
