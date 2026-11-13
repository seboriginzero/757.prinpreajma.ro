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

    site_title = gen.get('site_title', '757')
    site_desc = gen.get('site_description', 'SCANNER // DIAGNOSTIC IDENTITATE — Subiect: Ființă umană. Status: Activ. Operează în afara algoritmilor standard. Clasificare: Unicat (exemplar nereplicabil, fără copie de rezervă).')
    prim_dom = gen.get('primary_domain', 'https://757.prinpreajma.ro')
    sec_dom = gen.get('secondary_domain', '757.originzero.art')
    brand_name = gen.get('header_brand_name', '757')
    brand_sub = gen.get('header_brand_sub', 'ATELIER ȘI ARHIVĂ CURATORIALĂ')
    announcement = gen.get('announcement_text', '')

    hero_badge = hero.get('badge', 'CATALOG GENERAL RAȚIONAT')
    hero_title = hero.get('title', 'Suprarealism Biomecanic <br>și Morfologie Deconstructivistă')
    hero_lead = hero.get('lead', 'O investigație plastică de o intensă densitate grafică, situată la confluența dintre anatomia biologică, osatura sacră și mecanicismul post-industrial. Structurată în cinci axe estetice fundamentale din creația artistului Mugurel Emanuel Manea.')
    stat_dig = hero.get('stat_digitized', '')
    stat_cats = hero.get('stat_categories', '5')
    stat_posts = hero.get('stat_posts', 'Atelier')
    stat_clean = hero.get('stat_cleaned', 'Original')

    art_name = art.get('name', 'Mugurel Emanuel Manea')
    art_ig = art.get('instagram', '@mugurelemanuelmanea')
    art_arch_ig = art.get('archive_instagram', '@bogdan_by757')
    art_sig = art.get('signature', '757')
    art_p1 = art.get('paragraph_1', 'Mugurel Emanuel Manea dezvoltă un limbaj vizual de o densitate rară, centrat pe anatomia internă a tehnologiei și hibridizarea formelor organice. Lucrările sale chestionează granița dintre corpul biologic vulnerabil și armatura mecanică indestructibilă.')
    art_p2 = art.get('paragraph_2', 'Semnătura recurentă 757 funcționează ca un sigiliu alchimic și tehnic, prezent în mod sistematic pe desene, pe registrele verticale și în titlurile poematice ale postărilor. Galeria digitală îi reunește creația într-un spațiu de contemplare purificat de orice element parazit de rețea socială.')

    b1_t = integ.get('box1_title', 'Fidelitatea Față de Materia Grafică')
    b1_x = integ.get('box1_text', 'Fiecare operă din catalog este conservată cu respect absolut pentru fibra suportului, porozitatea hârtiei și gradienții naturali ai tușului și grafitului, excluzând orice alterare sintetică a desenului original.')
    b2_t = integ.get('box2_title', 'Unitatea Ciclurilor Estetice')
    b2_x = integ.get('box2_text', 'Corpusul operelor este articulat pe baza afinităților morfologice din atelier: de la osteologia biomecanică la scrierea runică ermetică, compozițiile piranesiene și asamblajul tridimensional.')
    b3_t = integ.get('box3_title', 'Monograma și Criptografia 757')
    b3_x = integ.get('box3_text', 'Semnul 757 străbate lucrările ca o emblemă identitară și liant conceptual, legând tradiția grafismului modern de o viziune oraculară asupra hibridizării om-mașină.')

    copy_txt = foot.get('copyright', '© 2026 Mugurel Emanuel Manea (757). Toate drepturile rezervate.')
    tech_txt = foot.get('tech_note', 'Catalog raționat oficial conceput pentru contemplare estetică desăvârșită.')

    # Category counts
    cat_counts = {}
    for it in items:
        for c in it.get('categories', []):
            cat_counts[c] = cat_counts.get(c, 0) + 1

    # Render category pills (clean, zero artwork counts)
    pill_html = ['<button class="cat-pill active" data-filter="all" role="tab" aria-selected="true">Toate Operele</button>']
    for cat in categories:
        cid = cat['id']
        cname = cat.get('name_ro', cid)
        short_name = cname.split(' și ')[0].strip() if ' și ' in cname else cname.split('&')[0].strip()
        pill_html.append(f'<button class="cat-pill" data-filter="{cid}" role="tab" aria-selected="false">{html.escape(short_name)}</button>')
    pills_rendered = '\n        '.join(pill_html)

    # Pre-render initial 24 artwork cards with 3D hanging rig for instant paint
    initial_cards = []
    for idx, item in enumerate(items[:24]):
        thumb_src = f"data/web-images/{item.get('thumbnail_file', '')}"
        item_id = item.get('id', '')
        item_title = item.get('title', item_id)
        if item_title.startswith('Opus 757 — '):
            item_title = item_id
        alt_text = item.get('alt_text', 'Biomechanical surrealist artwork by Mugurel Emanuel Manea')
        cat_name = item.get('category_name', '')
        critic_note = item.get('critic_note', '')
        initial_cards.append(f'''        <article class="art-card" data-idx="{idx}" role="button" tabindex="0" aria-label="Deschide {html.escape(item_id)}">
          <!-- 1. Pictura înrămată pe perete -->
          <div class="art-frame">
            <div class="card-specular-glare"></div>
            <div class="art-media">
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
              <span class="art-cat-name">{html.escape(cat_name)}</span>
            </div>
            <h3 class="art-card-title">{html.escape(item.get('title', item_id))}</h3>
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
  <link rel="canonical" href="{prim_dom if prim_dom.endswith('/') else prim_dom + '/'}">
  <meta property="og:title" content="{html.escape(site_title)}">
  <meta property="og:description" content="{html.escape(site_desc)}">
  <meta property="og:url" content="{prim_dom if prim_dom.endswith('/') else prim_dom + '/'}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="{prim_dom}/data/web-images/ART-0103.jpg">
  <meta property="og:image:secure_url" content="{prim_dom}/data/web-images/ART-0103.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1080">
  <meta property="og:image:height" content="1352">
  <meta property="og:image:alt" content="SCANNER // DIAGNOSTIC IDENTITATE — 757">
  <meta property="og:image" content="{prim_dom}/data/web-images/ART-0103.webp">
  <meta property="og:image:type" content="image/webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(site_title)}">
  <meta name="twitter:description" content="{html.escape(site_desc)}">
  <meta name="twitter:image" content="{prim_dom}/data/web-images/ART-0103.jpg">
  <meta name="theme-color" content="#07080b">

  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- Google Fonts: Cinzel, Cormorant Garamond, JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="gallery.css">
  <link rel="stylesheet" href="gallery-3d.css">
</head>
<body>

  <!-- Bleeding-Edge Ambient Magnetic Spotlight -->
  <div id="ambient-spotlight" aria-hidden="true"></div>

  <!-- Main Navigation Header -->
  <header class="luxury-header" id="site-header">
    <div class="header-container">
      <div class="brand-group">
        <a href="#hero" class="brand-link">
          <span class="brand-name">{html.escape(brand_name)}</span>
        </a>
      </div>

      <nav class="main-nav" aria-label="Navigare principală">
        <a href="#galerie" class="nav-item active">Colecție</a>
        <a href="#artist" class="nav-item">Despre Artist</a>
        <a href="#raport" class="nav-item">Notă Curatorială</a>
      </nav>

      <div class="header-controls">
        <!-- 3D Spatial Modern Tunnel Toggle -->
        <button id="gallery-3d-toggle" class="btn-control btn-3d-icon" title="Tunel 3D Biomecanic (Tasta 3)" aria-label="Deschide Tunelul 3D">
          <svg class="icon-3d-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span class="btn-3d-badge">3D</span>
        </button>

        <!-- Ambience Synthesizer Toggle: Speaker with Red Slash (Off) / Waves (On) -->
        <button id="ambience-toggle" class="btn-control btn-ambience-icon" title="Sunet Ambiental (Web Audio)" aria-label="Comutare Sunet">
          <!-- Difuzor tăiat cu linie roșie (OFF) -->
          <svg class="sound-svg sound-svg-off" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
            <line x1="22" y1="2" x2="2" y2="22" stroke="#ef4444" stroke-width="2.2"></line>
          </svg>
          <!-- Difuzor activ cu unde sonore (ON) -->
          <svg class="sound-svg sound-svg-on" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>

        <!-- Ambience Switcher -->
        <button id="theme-toggle" class="btn-control" title="Comutare ambianță (Tasta T)" aria-label="Comutare temă">
          <span class="theme-icon icon-dark">🌘 Obsidian</span>
          <span class="theme-icon icon-light">◻ White Cube</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Showcase: Portretul Canonic 757 cu Animație Pulsul Osteo-Mecanic și Șublere -->
  <section class="hero-showcase-section" id="hero">
    <div class="hero-showcase-container">
      <article class="art-card hero-portrait-card" id="hero-portrait-card" role="button" tabindex="0" aria-label="Deschide Portretul 757 (ART-0103)">
        <!-- 1. Pictura înrămată cu Șublere și Scanare Osteo-Mecanică -->
        <div class="art-frame hero-art-frame">
          <div class="hero-caliper top-left" aria-hidden="true"></div>
          <div class="hero-caliper top-right" aria-hidden="true"></div>
          <div class="hero-caliper bottom-left" aria-hidden="true"></div>
          <div class="hero-caliper bottom-right" aria-hidden="true"></div>
          <div class="hero-osteo-scan" aria-hidden="true"></div>
          <div class="card-specular-glare"></div>
          <div class="art-media hero-art-media">
            <img src="data/web-images/ART-0103.webp" alt="Portretul Canonic 757 — ART-0103" loading="eager" decoding="async">
          </div>
        </div>
        <!-- 2. Mecanism de atârnare: Cui bătut în perete + Sfoară 3D -->
        <div class="hanging-rig hero-hanging-rig" aria-hidden="true">
          <div class="wall-nail">
            <span class="nail-shadow"></span>
            <span class="nail-cap"></span>
          </div>
          <svg class="hanging-twine" viewBox="0 0 160 48" preserveAspectRatio="none">
            <line x1="82" y1="10" x2="38" y2="48" class="twine-shadow" />
            <line x1="82" y1="10" x2="126" y2="48" class="twine-shadow" />
            <line x1="80" y1="8" x2="36" y2="46" class="twine-cord" />
            <line x1="80" y1="8" x2="124" y2="46" class="twine-cord" />
          </svg>
        </div>

        <!-- 3. Plăcuța cu descriere atârnată de sfoară (Placa Originală, Ușor Mai Lată, Alb/Negru) -->
        <div class="art-hanging-tag hero-hanging-tag" id="hero-eye-plaque">
          <div class="tag-eyelets">
            <span class="eyelet left"></span>
            <span class="eyelet right"></span>
          </div>
          <div class="art-meta-row">
            <span class="art-cat-name hero-scanner-tag">SCANNER // DIAGNOSTIC IDENTITATE</span>
          </div>
          <div class="hero-diagnostic-meta">
            <div class="hero-diag-line"><span class="hero-diag-k">Subiect:</span> <span class="hero-diag-v">Ființă umană.</span></div>
            <div class="hero-diag-line"><span class="hero-diag-k">Status:</span> <span class="hero-diag-v">Activ. Operează în afara algoritmilor standard.</span></div>
            <div class="hero-diag-line"><span class="hero-diag-k">Clasificare:</span> <span class="hero-diag-v">Unicat (exemplar nereplicabil, fără copie de rezervă).</span></div>
          </div>
          <div class="hero-arch-interactive" id="hero-arch-accordion" tabindex="0" role="button" aria-expanded="false" aria-label="Afișează Arhitectură Internă">
            <div class="hero-arch-trigger" id="hero-arch-trigger">
              <span class="hero-arch-heading">Arhitectură internă</span>
              <span class="hero-arch-indicator" aria-hidden="true">+</span>
            </div>
            <div class="hero-arch-drawer" id="hero-arch-drawer">
              <p class="hero-arch-p">Între inginerie de precizie și anatomie emoțională. Nu produce obiecte, ci mecanisme care simt. Lucrează la intersecția unde linia rece a schiței tehnice întâlnește imperfecțiunea caldă a materiei vii. Pentru el, desenul nu este decor, ci o disecție a logicii interne din spatele lucrurilor, o încercare de a cartografia felul în care funcționează o idee înainte de a primi formă fizică.</p>
              <p class="hero-prototype-p">Fiecare lucrare din arhivă este un prototip: o urmă de grafit, un fragment de hardware, o tensiune mecanică sau o întrebare lăsată intenționat deschisă. Fără artificii, fără compromisuri estetice, doar structură pură și observație lucidă.</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- Gallery Control Center: Filters, Search, Display Modes -->
  <main class="gallery-wrapper" id="galerie">
    <div class="gallery-toolbar">
      
      <!-- Category Tabs (Cele 5 Direcții Critice) -->
      <div class="category-pills" role="tablist" aria-label="Filtrare categorii">
        {pills_rendered}
      </div>

      <!-- Action Row: Căutare și Moduri de Afișare -->
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

    <!-- Gallery Grid Container -->
    <div class="gallery-container view-editorial" id="gallery-grid">
{initial_cards_rendered}
    </div>

    <!-- Pagination / Progressive Load -->
    <div class="gallery-pagination" id="gallery-pagination">
      <button id="btn-load-more" class="btn-luxury secondary">Încarcă Mai Multe Opere</button>
    </div>
  </main>

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
        <span class="section-subtitle">NOTĂ CURATORIALĂ ȘI METODOLOGIE DE ATELIER</span>
        <h2 class="section-title">Fundamentele Teoretice ale Operei</h2>
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

  <!-- Luxury Modal Inspector (Vizualizare Detaliată și Zoom) -->
  <dialog class="luxury-modal" id="artwork-modal" aria-labelledby="modal-title" aria-modal="true">
    <div class="modal-backdrop" id="modal-backdrop"></div>
    <div class="modal-dialog">
      
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-cat" id="modal-category">Categorie</span>
        </div>
        
        <div class="modal-header-actions">
          <button id="modal-prev-btn" class="btn-icon" title="Opera Anterioară (←)" aria-label="Opera Anterioară">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
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
              <span class="plaque-stamp">CATALOG GENERAL</span>
            </div>

            <div class="plaque-heading-group">
              <span class="plaque-category-badge" id="modal-plaque-wing">Anatomie Biomecanică</span>
              <h3 class="plaque-title" id="modal-plaque-title">ART-0001</h3>
            </div>

            <div class="info-section">
              <span class="info-label">TEHNICĂ ȘI SUPORT</span>
              <span class="info-val medium-val" id="modal-medium"></span>
            </div>

            <div class="info-section">
              <span class="info-label">COMENTARIU CURATORIAL</span>
              <p class="info-text" id="modal-curatorial"></p>
            </div>

            <div class="info-section">
              <span class="info-label">MOTIVE ȘI VECTORI VIZUALI</span>
              <div class="tag-cloud" id="modal-tags"></div>
            </div>

            <!-- Butoane Rapide Navigare Plăcuță -->
            <div class="modal-plaque-nav">
              <button id="modal-plaque-prev" class="btn-plaque-nav" title="Opera Anterioară">
                &larr; Opera Anterioară
              </button>
              <button id="modal-plaque-next" class="btn-plaque-nav" title="Opera Următoare">
                Opera Următoare &rarr;
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
          <p class="f-desc">Suprarealism Biomecanic &middot; Toate drepturile rezervate artistului.</p>
        </div>

        <div class="footer-links">
          <h4>Navigare Arhivă</h4>
          <ul>
            <li><a href="#galerie">Colecția Completă</a></li>
            <li><a href="#directii">Cele 5 Axe Estetice</a></li>
            <li><a href="#artist">Despre Artist</a></li>
            <li><a href="#raport">Notă Curatorială</a></li>
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
        <h2 class="fs-artwork-title" id="fs-opus-title">ART-0001</h2>
        <span class="fs-anim-indicator" id="fs-anim-indicator">Animație Experiențială</span>
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

  <!-- 3D Spatial Modern Photo Gallery Container -->
  <div id="spatial-3d-gallery" class="spatial-3d-gallery" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Galeria 3D Spațială 757">
    <!-- WebGL Canvas Mount -->
    <div id="spatial-3d-canvas-container" class="spatial-3d-canvas-container"></div>
    
    <!-- 3D Top Bar HUD -->
    <div class="spatial-3d-hud-top">
      <div class="spatial-3d-brand">
        <span class="spatial-3d-logo">757</span>
        <span class="spatial-3d-divider">/</span>
        <span class="spatial-3d-mode-label" id="spatial-3d-mode-label">TUNEL BIOMECANIC 3D</span>
        <span class="spatial-3d-counter" id="spatial-3d-counter">167 LUCRĂRI</span>
      </div>

      <div class="spatial-3d-hud-actions">
        <!-- Auto-Flight Toggle -->
        <button id="spatial-3d-spin-btn" class="spatial-hud-btn" title="Pornire / Oprire Zbor Automat (Spațiu)">
          <svg class="spin-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
        </button>

        <!-- Theme Switcher in 3D -->
        <button id="spatial-3d-theme-btn" class="spatial-hud-btn" title="Comutare Ambianță (Obsidian / White Cube)">
          <span class="spatial-theme-dark">🌘</span>
          <span class="spatial-theme-light">◻</span>
        </button>

        <!-- Close Button -->
        <button id="spatial-3d-close-btn" class="spatial-hud-btn spatial-close-btn" title="Închide Galeria 3D (ESC)" aria-label="Închide Galeria 3D">
          <span class="spatial-close-label">✕ ESC</span>
        </button>
      </div>
    </div>

    <!-- 3D Bottom Floating Instruction HUD -->
    <div class="spatial-3d-hud-bottom">
      <div class="spatial-3d-instructions">
        <span class="spatial-hint">⟵ Trage pentru rotire 3D ⟶</span>
        <span class="spatial-hint-dot">·</span>
        <span class="spatial-hint">Scroll pentru navigare</span>
        <span class="spatial-hint-dot">·</span>
        <span class="spatial-hint">Click pe tablou pentru detalii</span>
      </div>
    </div>

    <!-- Mobile Touch Navigation Toolbar -->
    <div class="spatial-3d-mobile-nav" id="spatial-3d-mobile-nav" role="toolbar" aria-label="Comenzi Navigare Mobil">
      <button id="spatial-mobile-fwd" class="spatial-mobile-btn" aria-label="Avansează în Tunel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        <span>Înainte</span>
      </button>
      <div class="spatial-mobile-group">
        <button id="spatial-mobile-left" class="spatial-mobile-btn-icon" aria-label="Rotește Stânga" title="Rotește Stânga">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button id="spatial-mobile-center" class="spatial-mobile-btn-icon" aria-label="Centrare Privire" title="Centrare Privire">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
        </button>
        <button id="spatial-mobile-right" class="spatial-mobile-btn-icon" aria-label="Rotește Dreapta" title="Rotește Dreapta">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <button id="spatial-mobile-back" class="spatial-mobile-btn" aria-label="Mergi Înapoi">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        <span>Înapoi</span>
      </button>
    </div>

    <!-- Curatorial Inspection Card (Plaque) when an artwork is focused in 3D -->
    <div id="spatial-3d-focus-card" class="spatial-3d-focus-card" aria-hidden="true">
      <button id="spatial-card-dismiss-btn" class="spatial-card-dismiss" title="Revino la explorare 3D">✕</button>
      <div class="spatial-card-header">
        <span class="spatial-card-id" id="spatial-card-id">ART-0001</span>
        <span class="spatial-card-wing" id="spatial-card-wing">SALA I</span>
      </div>
      <h3 class="spatial-card-title" id="spatial-card-title">Titlu Operă</h3>
      <p class="spatial-card-medium" id="spatial-card-medium">Tehnică mixtă</p>
      <p class="spatial-card-note" id="spatial-card-note">Analiză curatorială a operei...</p>
      <div class="spatial-card-actions">
        <button id="spatial-card-detail-btn" class="spatial-btn-primary">Examinează în Detaliu</button>
        <button id="spatial-card-back-btn" class="spatial-btn-secondary">Înapoi în Spațiul 3D</button>
      </div>
    </div>
  </div>

  <!-- Embed collection data directly for instant offline rendering -->
  <script>
    window.COLLECTION_DATA = {json_dataset};
  </script>

  <script src="gallery.js"></script>
  <script src="three.min.js" defer></script>
  <script src="gallery-3d.js" defer></script>
</body>
</html>'''

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print('Rebuilt index.html successfully with updated content and dataset!')

if __name__ == '__main__':
    rebuild_site()
