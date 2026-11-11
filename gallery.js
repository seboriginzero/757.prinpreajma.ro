// gallery.js — Luxury Digital Gallery Engine for 757 (Mugurel Emanuel Manea)
(function () {
  'use strict';

  // 5 Curated Classifications Taxonomy Metadata
  const CURATED_WINGS = [
    {
      id: 'biomechanical-osteology',
      badge: 'SALA I',
      title: 'Anatomie Biomecanică & Osteologie Tehnologică',
      animName: 'The Biomechanical Osteo-Pulse & Calipers',
      description: 'Explorare viscerală a osaturii organice fuzionate cu vertebre de titan, pistoane pneumatice și cablaje nervoase. Carnalitate sintetică de mare rigoare anatomică.'
    },
    {
      id: 'cryptic-totems',
      badge: 'SALA II',
      title: 'Totemuri Criptice & Registre Runic-Arhitecturale',
      animName: 'The Monolithic Ascension & Runic Reveal',
      description: 'Structuri monolitice stratificate în registre verticale arhaice. Glife hermetice, alfabete oculte și geometrie sacră transpusă în tehno-arheologie.'
    },
    {
      id: 'chromatic-expressions',
      badge: 'SALA III',
      title: 'Studii Cromatice & Guașă/Acrilic pe Hârtie',
      animName: 'The Prismatic Pigment Bloom',
      description: 'Lucrări intime pe hârtie și carton. Explozii controlate de ocru mineral, oxid de cupru, roșu de cadmiu și negru de fum, marcate de gestualitate pură.'
    },
    {
      id: 'cybernetic-assemblages',
      badge: 'SALA IV',
      title: 'Obiecte Sculpturale & Asamblaje Cyber-Surrealiste',
      animName: 'The 3D Kinetic Hologram & Specular Gleam',
      description: 'Tensiunea tridimensională dintre ready-made tehnologic (platane hard disk, rulmenți, arcuri industriale) și încălțăminte de copil sau sfere reflectante.'
    },
    {
      id: 'monumental-perspectives',
      badge: 'SALA V',
      title: 'Perspectivă Deconstructivistă & Arhitectură Monumentală',
      animName: 'The Infinite Vanishing Point Zoom',
      description: 'Volume arhitecturale masive, secțiuni transversale și axe axonometrice ce converg spre puncte de fugă infinite. Gravitație deconstructivistă.'
    }
  ];

  const state = {
    items: window.COLLECTION_DATA || [],
    activeFilter: 'all',
    searchQuery: '',
    currentView: 'editorial', // 'editorial', 'atelier', 'ledger', 'wings'
    theme: localStorage.getItem('theme_757') || 'dark',
    pageSize: 24,
    currentPage: 1,
    modalIndex: 0,
    filteredItems: [],
    fullscreenActive: false,
    fullscreenIndex: 0
  };

  // DOM Elements
  const grid = document.getElementById('gallery-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('gallery-search');
  const searchClear = document.getElementById('search-clear');
  const catPills = document.querySelectorAll('.cat-pill');
  const viewBtns = document.querySelectorAll('.btn-view');
  const themeToggle = document.getElementById('theme-toggle');
  const loadMoreBtn = document.getElementById('btn-load-more');
  const paginationContainer = document.getElementById('gallery-pagination');

  // Ambience Audio
  const ambienceToggle = document.getElementById('ambience-toggle');
  const ambLabel = document.getElementById('amb-label');

  // Modal Elements
  const modal = document.getElementById('artwork-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalZoomBtn = document.getElementById('modal-zoom-btn');
  const modalFsTriggerBtn = document.getElementById('modal-fs-trigger-btn');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');
  const modalCounterBadge = document.getElementById('modal-counter-badge');
  const modalImage = document.getElementById('modal-image');
  const imageWrapper = document.getElementById('image-wrapper');
  const imageViewport = document.getElementById('image-viewport');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalId = document.getElementById('modal-id');
  const modalCuratorial = document.getElementById('modal-curatorial');
  const modalCritic = document.getElementById('modal-critic');
  const modalMedium = document.getElementById('modal-medium');
  const modalStatus = document.getElementById('modal-status');
  const modalPost = document.getElementById('modal-post');
  const modalRatio = document.getElementById('modal-ratio');
  const modalTags = document.getElementById('modal-tags');
  const modalSourceFile = document.getElementById('modal-source-file');
  const modalSourceLink = document.getElementById('modal-source-link');

  // Luxury Fullscreen Overlay Elements
  const fsOverlay = document.getElementById('luxury-fullscreen-overlay');
  const fsCloseBtn = document.getElementById('fs-close-btn');
  const fsPrevBtn = document.getElementById('fs-prev-btn');
  const fsNextBtn = document.getElementById('fs-next-btn');
  const fsWingBadge = document.getElementById('fs-wing-badge');
  const fsAnimIndicator = document.getElementById('fs-anim-indicator');
  const fsImage = document.getElementById('fs-image');
  const fsArtworkFrame = document.getElementById('fs-artwork-frame');
  const fsOpusTitle = document.getElementById('fs-opus-title');
  const fsCriticText = document.getElementById('fs-critic-text');
  const fsCategoryPills = document.getElementById('fs-category-pills');
  const fsStage = document.getElementById('fs-stage');

  // Initialize
  function init() {
    applyTheme(state.theme);
    setupEvents();
    renderFsCategoryPills();
    filterItems();
  }

  // Theme Management
  function applyTheme(newTheme) {
    state.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme_757', newTheme);
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // =========================================================================
  // Web Audio API: Procedural Biomechanical Gallery Drone
  // =========================================================================
  let audioCtx = null;
  let droneMaster = null;
  let isAmbiencePlaying = false;

  function toggleAmbience() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        droneMaster = audioCtx.createGain();
        droneMaster.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        droneMaster.connect(audioCtx.destination);

        // Lowpass filter
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, audioCtx.currentTime);
        filter.connect(droneMaster);

        // Sub 55Hz Saw
        const osc1 = audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, audioCtx.currentTime);
        const gain1 = audioCtx.createGain();
        gain1.gain.setValueAtTime(0.07, audioCtx.currentTime);
        osc1.connect(gain1);
        gain1.connect(filter);
        osc1.start();

        // 110Hz Sine Harmonic
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110.2, audioCtx.currentTime);
        const gain2 = audioCtx.createGain();
        gain2.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc2.connect(gain2);
        gain2.connect(filter);
        osc2.start();

        // LFO Organic Drift
        const lfo = audioCtx.createOscillator();
        lfo.frequency.setValueAtTime(0.1, audioCtx.currentTime);
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(35, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!isAmbiencePlaying) {
        droneMaster.gain.setTargetAtTime(0.12, audioCtx.currentTime, 1.2);
        isAmbiencePlaying = true;
        if (ambienceToggle) ambienceToggle.classList.add('active');
        if (ambLabel) ambLabel.textContent = 'SOUND // ON';
      } else {
        droneMaster.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.8);
        isAmbiencePlaying = false;
        if (ambienceToggle) ambienceToggle.classList.remove('active');
        if (ambLabel) ambLabel.textContent = 'SOUND: OFF';
      }
    } catch (err) {
      console.warn('Web Audio not allowed without user interaction:', err);
    }
  }

  // Filter & Search Engine
  function filterItems() {
    const q = state.searchQuery.trim().toLowerCase();
    const cat = state.activeFilter;

    state.filteredItems = state.items.filter(item => {
      const matchCat = (cat === 'all') || (item.categories && item.categories.includes(cat));
      if (!matchCat) return false;

      if (!q) return true;

      const inId = item.id.toLowerCase().includes(q);
      const inTitle = item.title && item.title.toLowerCase().includes(q);
      const inCat = item.category_name && item.category_name.toLowerCase().includes(q);
      const inCritic = item.critic_note && item.critic_note.toLowerCase().includes(q);
      const inCurator = item.curatorial_note && item.curatorial_note.toLowerCase().includes(q);
      const inTags = item.visual_tags && item.visual_tags.some(t => t.toLowerCase().includes(q));

      return inId || inTitle || inCat || inCritic || inCurator || inTags;
    });

    state.currentPage = 1;
    renderGallery();
  }

  // Card HTML Generator (With Physical 3D Hanging Rig)
  function renderCardHtml(item, globalIdx) {
    const thumbSrc = `data/web-images/${item.thumbnail_file}`;
    return `
      <article class="art-card" data-idx="${globalIdx}" role="button" tabindex="0" aria-label="Deschide ${item.title}">
        <!-- 1. Pictura înrămată pe perete -->
        <div class="art-frame">
          <div class="art-media">
            <span class="art-badge-overlay">${item.id}</span>
            <img src="${thumbSrc}" alt="${item.alt_text}" loading="lazy" decoding="async">
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
            <span class="art-id">${item.id}</span>
            <span class="archival-stamp">OPUS 757</span>
            <span class="art-cat-name">${item.category_name}</span>
          </div>
          <h3 class="art-card-title">${item.title}</h3>
          <p class="art-critic-snippet">${item.critic_note}</p>
        </div>
      </article>
    `;
  }

  // Render Gallery Views
  function renderGallery() {
    const total = state.filteredItems.length;
    resultsCount.textContent = `Se afișează ${total} din 167 de opere`;

    if (total === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); font-family: var(--font-mono);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nicio operă nu corespunde filtrelor selectate.</p>
          <p style="font-size: 0.8rem;">Încercați să resetați căutarea sau alegeți altă categorie.</p>
        </div>
      `;
      paginationContainer.style.display = 'none';
      return;
    }

    // View: 5 Săli / Curated Wings
    if (state.currentView === 'wings') {
      renderWingsView();
      paginationContainer.style.display = 'none';
      attachCardEvents();
      return;
    }

    // Standard paginated views (editorial, atelier, ledger)
    const visibleItems = state.filteredItems.slice(0, state.currentPage * state.pageSize);
    grid.innerHTML = visibleItems.map((item, idx) => renderCardHtml(item, idx)).join('');

    // Pagination visibility
    if (visibleItems.length < total) {
      paginationContainer.style.display = 'block';
      loadMoreBtn.textContent = `Încarcă Mai Multe Opere (${total - visibleItems.length} rămase)`;
    } else {
      paginationContainer.style.display = 'none';
    }

    attachCardEvents();
  }

  // Render 5 Curated Wings Mode
  function renderWingsView() {
    const wingsHtml = CURATED_WINGS.map(wing => {
      const wingItems = state.filteredItems.filter(it => it.categories && it.categories.includes(wing.id));
      if (wingItems.length === 0) return '';

      const itemsHtml = wingItems.map(item => {
        const globalIdx = state.filteredItems.indexOf(item);
        return renderCardHtml(item, globalIdx);
      }).join('');

      return `
        <section class="gallery-wing" data-wing-id="${wing.id}">
          <header class="wing-header">
            <div class="wing-header-top">
              <span class="wing-roman-badge">${wing.badge}</span>
              <span class="wing-count-pill">${wingItems.length} Opere</span>
              <button class="btn-wing-fullscreen" data-wing-cat="${wing.id}" title="Lansează Sala ${wing.badge} în Fullscreen Experiențial">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                <span>Experiență Fullscreen Sala ${wing.badge}</span>
              </button>
            </div>
            <h2 class="wing-title">${wing.title}</h2>
            <p class="wing-curatorial-desc">${wing.description}</p>
          </header>
          <div class="wing-artworks-grid">
            ${itemsHtml}
          </div>
        </section>
      `;
    }).join('');

    grid.innerHTML = `<div class="gallery-wings-container">${wingsHtml}</div>`;

    grid.querySelectorAll('.btn-wing-fullscreen').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = btn.getAttribute('data-wing-cat');
        const firstIdx = state.filteredItems.findIndex(it => it.categories && it.categories.includes(catId));
        if (firstIdx !== -1) {
          openLuxuryFullscreen(firstIdx);
        }
      });
    });
  }

  // Attach card click & keyboard handlers
  function attachCardEvents() {
    const cards = grid.querySelectorAll('.art-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        openModal(idx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.getAttribute('data-idx'), 10);
          openModal(idx);
        }
      });
    });
  }

  // =========================================================================
  // Modal Inspector Engine (Clean Canvas, Deep Zoom & Pan)
  // =========================================================================
  function openModal(idx) {
    if (idx < 0 || idx >= state.filteredItems.length) return;
    state.modalIndex = idx;
    const item = state.filteredItems[idx];

    modalId.textContent = item.id;
    modalTitle.textContent = item.title;
    modalCategory.textContent = item.category_name;
    modalCuratorial.textContent = item.curatorial_note;
    modalCritic.textContent = item.critic_note;
    modalMedium.textContent = item.medium_hypothesis;
    modalStatus.textContent = item.cleaning_status === 'retouched' ? 'Restaurat Prudent (Master)' : 'Curățat (Master)';
    modalPost.textContent = `${item.source_post_id} (${item.carousel_position}/${item.carousel_total})`;
    modalRatio.textContent = item.aspect_ratio;

    if (modalCounterBadge) {
      modalCounterBadge.textContent = `${idx + 1} / ${state.filteredItems.length}`;
    }

    modalTags.innerHTML = (item.visual_tags || []).map(t => `<span class="tag">#${t}</span>`).join('');
    modalSourceFile.textContent = item.source_file;
    modalSourceLink.href = `data/sidebar-crops/${item.sidebar_file}`;

    // Reset zoom state cleanly
    resetZoom();

    modalImage.src = `data/web-images/${item.image_file}`;
    modalImage.alt = item.alt_text;

    modal.showModal();
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (modal.open) {
      modal.close();
    }
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    resetZoom();
  }

  function resetZoom() {
    if (imageWrapper) {
      imageWrapper.classList.remove('zoomed');
      imageWrapper.style.transform = '';
    }
    if (modalZoomBtn) {
      modalZoomBtn.classList.remove('active');
    }
    if (imageViewport) {
      imageViewport.onmousemove = null;
    }
  }

  function toggleZoom() {
    if (!imageWrapper) return;
    const isZoomed = imageWrapper.classList.toggle('zoomed');
    if (modalZoomBtn) modalZoomBtn.classList.toggle('active', isZoomed);

    if (isZoomed) {
      imageWrapper.style.transform = 'scale(2.5)';
      if (imageViewport) {
        imageViewport.onmousemove = function (e) {
          if (!imageWrapper.classList.contains('zoomed')) return;
          const rect = imageViewport.getBoundingClientRect();
          const normX = (e.clientX - rect.left) / rect.width - 0.5;
          const normY = (e.clientY - rect.top) / rect.height - 0.5;
          imageWrapper.style.transform = `scale(2.5) translate(${-normX * 35}%, ${-normY * 35}%)`;
        };
      }
    } else {
      resetZoom();
    }
  }

  function nextModalItem() {
    if (state.modalIndex < state.filteredItems.length - 1) {
      openModal(state.modalIndex + 1);
    } else {
      openModal(0);
    }
  }

  function prevModalItem() {
    if (state.modalIndex > 0) {
      openModal(state.modalIndex - 1);
    } else {
      openModal(state.filteredItems.length - 1);
    }
  }

  // =========================================================================
  // LUXURY FULLSCREEN EXPERIENCE ENGINE (5 BESPOKE ANIMATIONS)
  // =========================================================================

  function renderFsCategoryPills() {
    if (!fsCategoryPills) return;
    fsCategoryPills.innerHTML = CURATED_WINGS.map(wing => `
      <button class="btn-fs-cat-switch fs-cat-pill" data-cat="${wing.id}">
        <span class="pill-badge">${wing.badge}</span>
        <span class="pill-name">${wing.title}</span>
      </button>
    `).join('');

    fsCategoryPills.querySelectorAll('.btn-fs-cat-switch').forEach(pill => {
      pill.addEventListener('click', () => {
        const targetCat = pill.getAttribute('data-cat');
        const targetIdx = state.filteredItems.findIndex(it => it.categories && it.categories.includes(targetCat));
        if (targetIdx !== -1) {
          openLuxuryFullscreen(targetIdx);
        }
      });
    });
  }

  function openLuxuryFullscreen(idx) {
    if (idx < 0 || idx >= state.filteredItems.length) return;
    state.fullscreenIndex = idx;
    state.fullscreenActive = true;
    const item = state.filteredItems[idx];

    // Close modal if open
    if (modal.open) {
      modal.close();
    }

    const wing = CURATED_WINGS.find(w => item.categories && item.categories.includes(w.id)) || CURATED_WINGS[0];

    // Set Data Category for Bespoke CSS Animation Trigger
    fsOverlay.setAttribute('data-category', wing.id);

    // Update HUD information
    if (fsWingBadge) fsWingBadge.textContent = wing.badge;
    if (fsAnimIndicator) fsAnimIndicator.textContent = `Animație: ${wing.animName}`;
    if (fsOpusTitle) fsOpusTitle.textContent = item.title;
    if (fsCriticText) fsCriticText.textContent = item.critic_note;

    // Highlight active category pill
    if (fsCategoryPills) {
      fsCategoryPills.querySelectorAll('.btn-fs-cat-switch').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-cat') === wing.id);
      });
    }

    // Load High-Res WebP Image
    fsImage.src = `data/web-images/${item.image_file}`;
    fsImage.alt = item.alt_text;

    // Re-trigger entrance animation
    fsArtworkFrame.style.animation = 'none';
    void fsArtworkFrame.offsetWidth; // Force reflow
    fsArtworkFrame.style.animation = '';

    // Show Overlay with Active Class for smooth opacity fade-in
    fsOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      fsOverlay.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
    document.body.classList.add('fullscreen-open');

    // Setup 3D Gyro Mouse Interaction for Assemblages and Monumental
    setupGyroTilt(wing.id);
  }

  function closeLuxuryFullscreen() {
    state.fullscreenActive = false;
    fsOverlay.classList.remove('active');
    setTimeout(() => {
      if (!state.fullscreenActive) {
        fsOverlay.style.display = 'none';
      }
    }, 400);

    document.body.style.overflow = '';
    document.body.classList.remove('fullscreen-open');
    removeGyroTilt();
  }

  function nextFsItem() {
    const nextIdx = (state.fullscreenIndex + 1) % state.filteredItems.length;
    openLuxuryFullscreen(nextIdx);
  }

  function prevFsItem() {
    const prevIdx = (state.fullscreenIndex - 1 + state.filteredItems.length) % state.filteredItems.length;
    openLuxuryFullscreen(prevIdx);
  }

  // 3D Parallax & Gyro Tilt Handler
  let gyroHandler = null;

  function setupGyroTilt(catId) {
    removeGyroTilt();

    if (catId === 'cybernetic-assemblages' || catId === 'monumental-perspectives') {
      gyroHandler = function (e) {
        const rect = fsStage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (catId === 'cybernetic-assemblages') {
          const rotY = x * 18; // degrees
          const rotX = -y * 14;
          fsArtworkFrame.style.transform = `perspective(1100px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(10px)`;
        } else {
          // Monumental: dynamic perspective vanishing point shift
          const shiftX = x * 25;
          const shiftY = y * 25;
          fsArtworkFrame.style.transform = `perspective(1200px) translate3d(${shiftX}px, ${shiftY}px, 0px)`;
        }
      };

      fsStage.addEventListener('mousemove', gyroHandler);
    } else {
      fsArtworkFrame.style.transform = '';
    }
  }

  function removeGyroTilt() {
    if (gyroHandler && fsStage) {
      fsStage.removeEventListener('mousemove', gyroHandler);
      gyroHandler = null;
    }
    if (fsArtworkFrame) {
      fsArtworkFrame.style.transform = '';
    }
  }

  // Setup Event Listeners
  function setupEvents() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Ambience synthesizer
    if (ambienceToggle) {
      ambienceToggle.addEventListener('click', toggleAmbience);
    }

    // Search
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.searchQuery) {
        searchClear.classList.add('visible');
      } else {
        searchClear.classList.remove('visible');
      }
      filterItems();
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClear.classList.remove('visible');
      filterItems();
      searchInput.focus();
    });

    // Category pills
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        state.activeFilter = pill.getAttribute('data-filter');
        filterItems();
      });
    });

    // Quick filter buttons in the directions section
    document.querySelectorAll('.btn-quick-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        const targetPill = document.querySelector(`.cat-pill[data-filter="${cat}"]`);
        if (targetPill) targetPill.click();
        const galleryElem = document.getElementById('galerie');
        galleryElem.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // View modes
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.getAttribute('data-view');
        state.currentView = view;
        grid.className = `gallery-container view-${view}`;
        renderGallery();
      });
    });

    // Load more
    loadMoreBtn.addEventListener('click', () => {
      state.currentPage++;
      renderGallery();
    });

    // Modal controls
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    modalZoomBtn.addEventListener('click', toggleZoom);
    if (imageViewport) {
      imageViewport.addEventListener('click', toggleZoom);
    }
    modalNextBtn.addEventListener('click', nextModalItem);
    modalPrevBtn.addEventListener('click', prevModalItem);

    if (modalFsTriggerBtn) {
      modalFsTriggerBtn.addEventListener('click', () => {
        openLuxuryFullscreen(state.modalIndex);
      });
    }

    // Modal dialog native event listener (PREVENTS SCROLL-LOCK WHEN CLOSING)
    modal.addEventListener('close', () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      resetZoom();
    });

    modal.addEventListener('cancel', () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
      resetZoom();
    });

    // Click outside dialog to close
    modal.addEventListener('click', (e) => {
      const dialog = modal.querySelector('.modal-dialog');
      if (dialog && !dialog.contains(e.target)) {
        closeModal();
      }
    });

    // Fullscreen Overlay controls
    if (fsCloseBtn) fsCloseBtn.addEventListener('click', closeLuxuryFullscreen);
    if (fsNextBtn) fsNextBtn.addEventListener('click', nextFsItem);
    if (fsPrevBtn) fsPrevBtn.addEventListener('click', prevFsItem);

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Fullscreen active shortcuts
      if (state.fullscreenActive) {
        if (e.key === 'Escape') closeLuxuryFullscreen();
        if (e.key === 'ArrowRight') nextFsItem();
        if (e.key === 'ArrowLeft') prevFsItem();
        if (e.key === 'f' || e.key === 'F') closeLuxuryFullscreen();
        return;
      }

      // Modal open shortcuts
      if (modal.open) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') nextModalItem();
        if (e.key === 'ArrowLeft') prevModalItem();
        if (e.key === 'z' || e.key === 'Z') toggleZoom();
        if (e.key === 'f' || e.key === 'F') openLuxuryFullscreen(state.modalIndex);
        return;
      }

      if (e.target.tagName === 'INPUT') return;

      if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      } else if (e.key === 'f' || e.key === 'F') {
        openLuxuryFullscreen(0);
      } else if (e.key === '1') {
        document.querySelector('.btn-view[data-view="editorial"]').click();
      } else if (e.key === '2') {
        document.querySelector('.btn-view[data-view="atelier"]').click();
      } else if (e.key === '3') {
        document.querySelector('.btn-view[data-view="ledger"]').click();
      } else if (e.key === '4') {
        const wingsBtn = document.querySelector('.btn-view[data-view="wings"]');
        if (wingsBtn) wingsBtn.click();
      }
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
