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

    site_title = gen.get('site_title', '757 | Catalog Raisonné și Arhivă de Artă')
    site_desc = gen.get('site_description', 'Catalogul general raționat și arhiva operei artistului 757. Suprarealism biomecanic, morfologii osteologice, totemuri criptice și viziuni deconstructiviste.')
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
        <div class="hanging-rig hero-hanging-rig" aria-hidden="true">
          <div class="wall-nail">
            <span class="nail-shadow"></span>
            <span class="nail-cap"></span>
          </div>
          <svg class="hanging-twine" viewBox="0 0 200 44" preserveAspectRatio="none">
            <line x1="102" y1="10" x2="42" y2="44" class="twine-shadow" />
            <line x1="102" y1="10" x2="162" y2="44" class="twine-shadow" />
            <line x1="100" y1="8" x2="40" y2="44" class="twine-cord" />
            <line x1="100" y1="8" x2="160" y2="44" class="twine-cord" />
          </svg>
        </div>

        <!-- 3. Placă Curatorială Simplă (Albă / Neagră — Pur Monocrom Fără Alte Culori) -->
        <div class="hero-curatorial-plaque hero-eye-plaque" id="hero-eye-plaque">
          
          <!-- Ocheți de suspendare sfoară -->
          <div class="plaque-eyelets" aria-hidden="true">
            <span class="plaque-eyelet left"></span>
            <span class="plaque-eyelet right"></span>
          </div>

          <div class="plaque-inner-content">
            <!-- Header Diagnostic -->
            <div class="plaque-header-row">
              <span class="plaque-scanner-badge">SCANNER // DIAGNOSTIC IDENTITATE</span>
            </div>

            <!-- Telemetrie Diagnostic -->
            <div class="plaque-telemetry-body">
              <p class="plaque-telemetry-item">
                <span class="plaque-key">Subiect:</span>
                <span class="plaque-val">Ființă umană.</span>
              </p>
              <p class="plaque-telemetry-item">
                <span class="plaque-key">Status:</span>
                <span class="plaque-val">Activ. Operează în afara algoritmilor standard.</span>
              </p>
              <p class="plaque-telemetry-item">
                <span class="plaque-key">Clasificare:</span>
                <span class="plaque-val">Unicat (exemplar nereplicabil, fără copie de rezervă).</span>
              </p>
            </div>

            <!-- Arhitectură Internă: Expandabil la Hover / Click -->
            <div class="hero-arch-interactive plaque-arch-interactive" id="hero-arch-accordion" tabindex="0" role="button" aria-expanded="false" aria-label="Afișează Arhitectură Internă">
              <div class="hero-arch-trigger plaque-arch-trigger" id="hero-arch-trigger">
                <span class="plaque-arch-heading">
                  <svg class="plaque-arch-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                  </svg>
                  Arhitectură internă
                </span>
                <span class="hero-arch-indicator" aria-hidden="true">+</span>
              </div>
              <div class="hero-arch-drawer plaque-arch-drawer" id="hero-arch-drawer">
                <p class="plaque-prose">Între inginerie de precizie și anatomie emoțională. Nu produce obiecte, ci mecanisme care simt. Lucrează la intersecția unde linia rece a schiței tehnice întâlnește imperfecțiunea caldă a materiei vii. Pentru el, desenul nu este decor, ci o disecție a logicii interne din spatele lucrurilor, o încercare de a cartografia felul în care funcționează o idee înainte de a primi formă fizică.</p>
                <p class="plaque-prose plaque-prototype">Fiecare lucrare din arhivă este un prototip: o urmă de grafit, un fragment de hardware, o tensiune mecanică sau o întrebare lăsată intenționat deschisă. Fără artificii, fără compromisuri estetice, doar structură pură și observație lucidă.</p>
              </div>
            </div>
          </div>
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

        <!-- 2. Mecanism de atârnare: Cui bătut în perete + Sfoară 3D (Conexiune Directă Fără Distanță) -->
        <div class="hanging-rig hero-ocular-rig" aria-hidden="true">
          <div class="wall-nail">
            <span class="nail-shadow"></span>
            <span class="nail-cap"></span>
          </div>
          <svg class="hanging-twine" viewBox="0 0 540 48" preserveAspectRatio="none">
            <line x1="272" y1="10" x2="162" y2="48" class="twine-shadow" />
            <line x1="272" y1="10" x2="382" y2="48" class="twine-shadow" />
            <line x1="270" y1="8" x2="160" y2="48" class="twine-cord" />
            <line x1="270" y1="8" x2="380" y2="48" class="twine-cord" />
          </svg>
        </div>

        <!-- 3. Ochi Anatomic Realist (Design Avansat Ocular, Retină & Text Cursiv) -->
        <div class="realistic-eye-card hero-eye-plaque" id="hero-eye-plaque">
          
          <!-- Ochi Realist SVG Multi-Strat (Fără Fier Forjat, Sclera Sferică, Iris Anatomic, Luciu Corneean 3D) -->
          <svg class="realistic-eye-svg" viewBox="0 0 540 330" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <!-- Gradiente Dark (Obsidian) -->
              <radialGradient id="scleraSphereDark" cx="50%" cy="50%" r="52%" fx="50%" fy="45%">
                <stop offset="0%" stop-color="#181b24" />
                <stop offset="65%" stop-color="#0e1017" />
                <stop offset="85%" stop-color="#07080b" />
                <stop offset="100%" stop-color="#030305" />
              </radialGradient>
              <radialGradient id="irisAnatomyDark" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#030406" />
                <stop offset="30%" stop-color="#1a150e" />
                <stop offset="60%" stop-color="#3d2c16" />
                <stop offset="82%" stop-color="#6b4e24" />
                <stop offset="94%" stop-color="#9c7336" />
                <stop offset="98%" stop-color="#2e2010" />
                <stop offset="100%" stop-color="#0a0805" />
              </radialGradient>
              <radialGradient id="retinaChamberDark" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stop-color="#07080c" />
                <stop offset="70%" stop-color="#0a0b10" />
                <stop offset="92%" stop-color="#10131a" />
                <stop offset="100%" stop-color="#181c26" />
              </radialGradient>

              <!-- Gradiente Light (White Cube) -->
              <radialGradient id="scleraSphereLight" cx="50%" cy="50%" r="52%" fx="50%" fy="45%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="60%" stop-color="#faf8f5" />
                <stop offset="85%" stop-color="#ebe6dc" />
                <stop offset="95%" stop-color="#d8cfc4" />
                <stop offset="100%" stop-color="#b8aba0" />
              </radialGradient>
              <radialGradient id="irisAnatomyLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#0f172a" />
                <stop offset="30%" stop-color="#2c2014" />
                <stop offset="65%" stop-color="#5c401e" />
                <stop offset="85%" stop-color="#946932" />
                <stop offset="95%" stop-color="#b88846" />
                <stop offset="98%" stop-color="#3d2710" />
                <stop offset="100%" stop-color="#1a1006" />
              </radialGradient>
              <radialGradient id="retinaChamberLight" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="65%" stop-color="#fbf9f6" />
                <stop offset="90%" stop-color="#f2ede4" />
                <stop offset="100%" stop-color="#e4dcd0" />
              </radialGradient>

              <!-- Umbra anatomică a pleoapei superioare pe globul ocular -->
              <linearGradient id="eyelidCastShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(0,0,0,0.65)" />
                <stop offset="55%" stop-color="rgba(0,0,0,0.22)" />
                <stop offset="100%" stop-color="rgba(0,0,0,0)" />
              </linearGradient>

              <!-- Luciu Corneean 3D (Strat de Sticlă Umedă pe Iris) -->
              <linearGradient id="corneaGlassSheen" x1="25%" y1="15%" x2="80%" y2="85%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
                <stop offset="40%" stop-color="rgba(255,255,255,0.12)" />
                <stop offset="75%" stop-color="rgba(255,255,255,0.02)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0)" />
              </linearGradient>

              <!-- Punct Specular Primar la Ora 10:30 -->
              <radialGradient id="specularCoreGlint" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
                <stop offset="45%" stop-color="#ffffff" stop-opacity="0.75" />
                <stop offset="80%" stop-color="#ffffff" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </radialGradient>

              <!-- Clip Path Anatomie Palpebrală (Formă de Ochi Migdalat) -->
              <clipPath id="ocularPalpebralClip">
                <path d="M 18,165 C 65,38 160,12 270,12 C 380,12 475,38 522,165 C 475,292 380,318 270,318 C 160,318 65,292 18,165 Z" />
              </clipPath>

              <!-- Fibră Radială Iris -->
              <g id="irisRadialFibers">
                <line x1="270" y1="100" x2="270" y2="45" />
                <line x1="270" y1="230" x2="270" y2="285" />
                <line x1="205" y1="165" x2="150" y2="165" />
                <line x1="335" y1="165" x2="390" y2="165" />
                <line x1="224" y1="119" x2="185" y2="80" />
                <line x1="316" y1="211" x2="355" y2="250" />
                <line x1="316" y1="119" x2="355" y2="80" />
                <line x1="224" y1="211" x2="185" y2="250" />
                <line x1="245" y1="105" x2="225" y2="55" />
                <line x1="295" y1="225" x2="315" y2="275" />
                <line x1="295" y1="105" x2="315" y2="55" />
                <line x1="245" y1="225" x2="225" y2="275" />
                <line x1="210" y1="140" x2="160" y2="120" />
                <line x1="330" y1="190" x2="380" y2="210" />
                <line x1="330" y1="140" x2="380" y2="120" />
                <line x1="210" y1="190" x2="160" y2="210" />
              </g>
            </defs>

            <!-- 1. Structură Oculară în Fanta Palpebrală -->
            <g clip-path="url(#ocularPalpebralClip)">
              <!-- Sclera (Volum Sferic Tridimensional) -->
              <path d="M 18,165 C 65,38 160,12 270,12 C 380,12 475,38 522,165 C 475,292 380,318 270,318 C 160,318 65,292 18,165 Z" class="ocular-sclera" />
              
              <!-- Iris (Anatomie Cromatică Bogată) -->
              <circle cx="270" cy="165" r="135" class="ocular-iris" />
              <use href="#irisRadialFibers" class="ocular-iris-fibers" />
              <use href="#irisRadialFibers" class="ocular-iris-fibers" transform="rotate(7.5 270 165)" opacity="0.6" />
              <circle cx="270" cy="165" r="135" class="ocular-limbal-ring" />

              <!-- Retină & Câmp Receptiv Central (Fundal Catifelat pentru Text) -->
              <ellipse cx="270" cy="165" rx="192" ry="110" class="ocular-retina-receptive-field" />
              
              <!-- Inele Biometrice Subtile de Calibrare -->
              <ellipse cx="270" cy="165" rx="178" ry="98" class="retina-bio-ring outer" />
              <ellipse cx="270" cy="165" rx="130" ry="72" class="retina-bio-ring mid" />
              <line x1="270" y1="60" x2="270" y2="270" class="retina-bio-axis" />
              <line x1="85" y1="165" x2="455" y2="165" class="retina-bio-axis" />

              <!-- Umbra Pleoapei Superioare -->
              <path d="M 18,165 C 65,38 160,12 270,12 C 380,12 475,38 522,165 C 450,75 365,60 270,60 C 175,60 90,75 18,165 Z" fill="url(#eyelidCastShadow)" class="ocular-eyelid-shadow" />

              <!-- Reflexii Corneene 3D & Luciu Umed (Best Practices Realism) -->
              <ellipse cx="270" cy="165" rx="200" ry="115" fill="url(#corneaGlassSheen)" class="ocular-cornea-glass" />
              <ellipse cx="215" cy="115" rx="34" ry="16" transform="rotate(-26 215 115)" fill="url(#specularCoreGlint)" class="ocular-specular-primary" />
              <ellipse cx="330" cy="225" rx="16" ry="10" transform="rotate(20 330 225)" class="ocular-specular-secondary" />
              <path d="M 55,180 C 120,285 200,312 270,312 C 340,312 420,285 485,180" class="ocular-waterline" />
            </g>

            <!-- 2. Muchie Palpebrală Fină și Puncte de Ancorare Sfoară (Aliniate 1:1) -->
            <path d="M 18,165 C 65,38 160,12 270,12 C 380,12 475,38 522,165 C 475,292 380,318 270,318 C 160,318 65,292 18,165 Z" class="ocular-palpebral-contour" />
            <circle cx="160" cy="36" r="4.5" class="ocular-anchor-point" />
            <circle cx="380" cy="36" r="4.5" class="ocular-anchor-point" />
          </svg>

          <!-- 3. Camera Retinei & Fluxul Textului Cursiv -->
          <div class="ocular-retina-content">
            
            <!-- Badge Biometric Scanare -->
            <div class="retina-header-wrap">
              <span class="retina-scanner-tag">
                <span class="retina-pulse-dot" aria-hidden="true"></span>
                SCANNER // DIAGNOSTIC IDENTITATE
              </span>
            </div>

            <!-- Telemetrie Cursivă pe Retină -->
            <div class="retina-cursive-telemetry">
              <p class="retina-telemetry-row">
                <span class="retina-tag-label">Subiect:</span>
                <span class="retina-tag-cursive">Ființă umană.</span>
              </p>
              <p class="retina-telemetry-row">
                <span class="retina-tag-label">Status:</span>
                <span class="retina-tag-cursive">Activ. Operează în afara algoritmilor standard.</span>
              </p>
              <p class="retina-telemetry-row">
                <span class="retina-tag-label">Clasificare:</span>
                <span class="retina-tag-cursive">Unicat (exemplar nereplicabil, fără copie de rezervă).</span>
              </p>
            </div>

            <!-- Arhitectură Internă: Apertură Interactivă (Hover pe Desktop / Click pe Mobil) -->
            <div class="retina-arch-interactive" id="hero-arch-accordion" tabindex="0" role="button" aria-expanded="false" aria-label="Afișează Arhitectură Internă">
              <div class="retina-arch-trigger" id="hero-arch-trigger">
                <span class="retina-arch-label">
                  <svg class="retina-aperture-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                  </svg>
                  Arhitectură internă
                </span>
                <span class="retina-arch-indicator" aria-hidden="true">+</span>
              </div>
              <div class="retina-arch-drawer" id="hero-arch-drawer">
                <p class="retina-arch-prose">Între inginerie de precizie și anatomie emoțională. Nu produce obiecte, ci mecanisme care simt. Lucrează la intersecția unde linia rece a schiței tehnice întâlnește imperfecțiunea caldă a materiei vii. Pentru el, desenul nu este decor, ci o disecție a logicii interne din spatele lucrurilor, o încercare de a cartografia felul în care funcționează o idee înainte de a primi formă fizică.</p>
                <p class="retina-arch-prototype">Fiecare lucrare din arhivă este un prototip: o urmă de grafit, un fragment de hardware, o tensiune mecanică sau o întrebare lăsată intenționat deschisă. Fără artificii, fără compromisuri estetice, doar structură pură și observație lucidă.</p>
              </div>
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
        <h2 class="section-title">Fundamentele Teoretice ale Catalogului Raisonné</h2>
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
          <p class="f-desc">Arhivă de Artă Contemporană &middot; Suprarealism Biomecanic &middot; Toate drepturile rezervate artistului.</p>
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
