// admin.js — Controller Interfață de Administrare Securizată 757

(function() {
  'use strict';

  // State
  const state = {
    user: null,
    artworks: [],
    categories: [],
    siteContent: {},
    filteredArtworks: [],
    activeTab: 'catalog',
    currentEditingArt: null
  };

  // DOM Elements
  const loginScreen = document.getElementById('login-screen');
  const adminApp = document.getElementById('admin-app');
  const loginForm = document.getElementById('login-form');
  const authAlert = document.getElementById('auth-alert');
  const btnLogin = document.getElementById('btn-login');
  const passwordInput = document.getElementById('password');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const currentUserBadge = document.getElementById('current-user-badge');
  const btnLogout = document.getElementById('btn-logout');
  const btnRebuildAll = document.getElementById('btn-rebuild-all');
  const toastContainer = document.getElementById('toast-container');

  // Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Catalog Table
  const artTableBody = document.getElementById('art-table-body');
  const catalogSearch = document.getElementById('catalog-search');
  const catalogFilterCat = document.getElementById('catalog-filter-cat');
  const badgeTotalArt = document.getElementById('badge-total-art');

  // Edit Artwork Modal
  const editArtworkModal = document.getElementById('edit-artwork-modal');
  const artworkEditForm = document.getElementById('artwork-edit-form');
  const btnCloseArtModal = document.getElementById('btn-close-art-modal');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const modalArtId = document.getElementById('modal-art-id');
  const modalArtHeading = document.getElementById('modal-art-heading');
  const modalArtPreview = document.getElementById('modal-art-preview');
  const modalArtSource = document.getElementById('modal-art-source');
  const modalArtPost = document.getElementById('modal-art-post');
  const modalArtStatus = document.getElementById('modal-art-status');
  const modalArtOps = document.getElementById('modal-art-ops');
  const modalArtFullLink = document.getElementById('modal-art-full-link');
  const modalArtSidebarLink = document.getElementById('modal-art-sidebar-link');

  // Forms
  const formGeneral = document.getElementById('form-general');
  const formArtist = document.getElementById('form-artist');
  const formTaxonomy = document.getElementById('form-taxonomy');
  const formIntegrity = document.getElementById('form-integrity');
  const taxonomyCardsContainer = document.getElementById('taxonomy-cards-container');

  // Initialize
  function init() {
    setupAuthEvents();
    setupTabNavigation();
    setupCatalogEvents();
    setupFormEvents();
    checkSession();
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : '⚠';
    toast.innerHTML = `<strong>${icon}</strong> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // 1. Authentication
  function setupAuthEvents() {
    togglePwdBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePwdBtn.textContent = '🔒';
      } else {
        passwordInput.type = 'password';
        togglePwdBtn.textContent = '👁️';
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authAlert.style.display = 'none';
      const user = document.getElementById('username').value.trim();
      const pass = passwordInput.value;

      btnLogin.disabled = true;
      btnLogin.querySelector('.btn-text').style.display = 'none';
      btnLogin.querySelector('.spinner').style.display = 'inline-block';

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStringifySafe({ username: user, password: pass })
        });
        const data = await res.json();

        if (res.ok && data.ok) {
          state.user = data.user;
          showAdminPanel();
          showToast('Autentificare confirmată. Bine ați venit în panoul de control 757!');
        } else {
          authAlert.textContent = data.error || 'Autentificare eșuată.';
          authAlert.style.display = 'block';
        }
      } catch (err) {
        authAlert.textContent = 'Eroare de comunicare cu serverul local.';
        authAlert.style.display = 'block';
      } finally {
        btnLogin.disabled = false;
        btnLogin.querySelector('.btn-text').style.display = 'inline';
        btnLogin.querySelector('.spinner').style.display = 'none';
      }
    });

    btnLogout.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (err) {}
      state.user = null;
      adminApp.style.display = 'none';
      loginScreen.style.display = 'flex';
      passwordInput.value = '';
      showToast('Ați fost deconectat cu succes.');
    });

    btnRebuildAll.addEventListener('click', async () => {
      if (!confirm('Reconstruiți întregul site public din baza de date curentă?')) return;
      btnRebuildAll.disabled = true;
      try {
        const res = await fetch('/api/rebuild', { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          showToast(data.message || 'Galeria publică a fost reconstruită!');
        } else {
          showToast(data.error || 'Eroare la reconstrucție.', 'error');
        }
      } catch (e) {
        showToast('Eroare de conexiune.', 'error');
      } finally {
        btnRebuildAll.disabled = false;
      }
    });
  }

  async function checkSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.authenticated) {
        state.user = data.user;
        showAdminPanel();
      } else {
        loginScreen.style.display = 'flex';
        adminApp.style.display = 'none';
      }
    } catch (err) {
      loginScreen.style.display = 'flex';
      adminApp.style.display = 'none';
    }
  }

  async function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminApp.style.display = 'flex';
    currentUserBadge.textContent = state.user || 'mugur';
    await loadAllData();
  }

  // 2. Load Data Bundle
  async function loadAllData() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) {
        if (res.status === 401) {
          checkSession();
          return;
        }
        throw new Error('Eroare la preluarea datelor.');
      }
      const data = await res.json();
      state.artworks = data.artworks || [];
      state.categories = data.categories || [];
      state.siteContent = data.site_content || {};

      badgeTotalArt.textContent = state.artworks.length;
      
      // Populate Catalog
      filterAndRenderCatalog();

      // Populate General Form
      populateGeneralForm();

      // Populate Artist Form
      populateArtistForm();

      // Populate Taxonomy Form
      populateTaxonomyForm();

      // Populate Integrity Form
      populateIntegrityForm();

    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // 3. Tab Navigation
  function setupTabNavigation() {
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        state.activeTab = targetTab;

        navTabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(`tab-${targetTab}`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Top save buttons linking to forms
    document.querySelectorAll('.btn-save-pane').forEach(btn => {
      btn.addEventListener('click', () => {
        const formId = btn.getAttribute('data-form');
        const form = document.getElementById(formId);
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      });
    });
  }

  // 4. Catalog Management
  function setupCatalogEvents() {
    catalogSearch.addEventListener('input', () => filterAndRenderCatalog());
    catalogFilterCat.addEventListener('change', () => filterAndRenderCatalog());

    // Modal Close
    btnCloseArtModal.addEventListener('click', () => editArtworkModal.close());
    btnCancelEdit.addEventListener('click', () => editArtworkModal.close());

    // Artwork Save
    artworkEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-artwork');
      saveBtn.disabled = true;
      saveBtn.querySelector('.btn-text').style.display = 'none';
      saveBtn.querySelector('.spinner').style.display = 'inline-block';

      const artId = document.getElementById('edit-id').value;
      const title = document.getElementById('edit-title').value.trim();
      const catId = document.getElementById('edit-category').value;
      const curatorialNote = document.getElementById('edit-curatorial').value.trim();
      const criticNote = document.getElementById('edit-critic').value.trim();
      const mediumHypothesis = document.getElementById('edit-medium').value.trim();
      const visualTags = document.getElementById('edit-tags').value;

      const catObj = state.categories.find(c => c.id === catId);
      const catName = catObj ? catObj.name_ro : catId;

      try {
        const res = await fetch('/api/artwork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStringifySafe({
            id: artId,
            title: title,
            category_name: catName,
            categories: [catId],
            curatorial_note: curatorialNote,
            critic_note: criticNote,
            medium_hypothesis: mediumHypothesis,
            visual_tags: visualTags
          })
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          // Update local state
          const idx = state.artworks.findIndex(a => a.id === artId);
          if (idx !== -1 && data.item) {
            state.artworks[idx] = data.item;
          }
          filterAndRenderCatalog();
          editArtworkModal.close();
          showToast(`Opera ${artId} a fost actualizată și publicată în galerie!`);
        } else {
          showToast(data.error || 'Eroare la salvare.', 'error');
        }
      } catch (err) {
        showToast('Eroare la comunicarea cu serverul.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.querySelector('.btn-text').style.display = 'inline';
        saveBtn.querySelector('.spinner').style.display = 'none';
      }
    });
  }

  function filterAndRenderCatalog() {
    const q = catalogSearch.value.trim().toLowerCase();
    const cat = catalogFilterCat.value;

    state.filteredArtworks = state.artworks.filter(a => {
      const matchCat = (cat === 'all') || (a.categories && a.categories.includes(cat));
      if (!matchCat) return false;
      if (!q) return true;

      const inId = a.id.toLowerCase().includes(q);
      const inTitle = a.title && a.title.toLowerCase().includes(q);
      const inCat = a.category_name && a.category_name.toLowerCase().includes(q);
      const inCurator = a.curatorial_note && a.curatorial_note.toLowerCase().includes(q);
      const inCritic = a.critic_note && a.critic_note.toLowerCase().includes(q);
      const inMedium = a.medium_hypothesis && a.medium_hypothesis.toLowerCase().includes(q);
      const inTags = a.visual_tags && a.visual_tags.some(t => t.toLowerCase().includes(q));

      return inId || inTitle || inCat || inCurator || inCritic || inMedium || inTags;
    });

    renderArtTable(state.filteredArtworks);
  }

  function renderArtTable(items) {
    if (items.length === 0) {
      artTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            Nicio operă nu corespunde căutării sau filtrelor selectate.
          </td>
        </tr>
      `;
      return;
    }

    artTableBody.innerHTML = items.map(item => {
      const thumb = `data/web-images/${item.thumbnail_file}`;
      return `
        <tr data-id="${item.id}">
          <td>
            <img src="${thumb}" alt="${item.title}" class="table-thumb" loading="lazy">
          </td>
          <td>
            <span class="table-id">${item.id}</span>
          </td>
          <td>
            <span class="table-title">${escapeHtml(item.title)}</span>
          </td>
          <td>
            <span class="table-cat-badge">${escapeHtml(item.category_name || '')}</span>
          </td>
          <td>
            <p class="table-snippet"><strong>Curatorial:</strong> ${escapeHtml(item.curatorial_note || '')}</p>
            <p class="table-snippet" style="margin-top: 0.3rem;"><strong>Critic:</strong> ${escapeHtml(item.critic_note || '')}</p>
          </td>
          <td>
            <span class="table-medium">${escapeHtml(item.medium_hypothesis || '')}</span>
          </td>
          <td>
            <button type="button" class="btn-table-edit" data-edit-id="${item.id}">Editează</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click events
    artTableBody.querySelectorAll('.btn-table-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        openEditModal(id);
      });
    });
  }

  function openEditModal(artId) {
    const item = state.artworks.find(a => a.id === artId);
    if (!item) return;

    state.currentEditingArt = item;

    modalArtId.textContent = item.id;
    modalArtHeading.textContent = `Editare Operă — ${item.id}`;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-title').value = item.title || '';
    
    // Category select
    const catSelect = document.getElementById('edit-category');
    const curCat = item.categories && item.categories[0] ? item.categories[0] : 'biomechanical-osteology';
    catSelect.value = curCat;

    document.getElementById('edit-curatorial').value = item.curatorial_note || '';
    document.getElementById('edit-critic').value = item.critic_note || '';
    document.getElementById('edit-medium').value = item.medium_hypothesis || '';
    document.getElementById('edit-tags').value = (item.visual_tags || []).join(', ');

    // Left preview column
    modalArtPreview.src = `data/web-images/${item.thumbnail_file}`;
    modalArtSource.textContent = item.source_file || 'N/A';
    modalArtPost.textContent = `${item.source_post_id} (${item.carousel_position}/${item.carousel_total || 1})`;
    modalArtStatus.textContent = item.cleaning_status === 'retouched' ? 'Restaurat Prudent (Master)' : 'Curățat (Master)';
    
    const ops = item.cleaning_operations || [];
    modalArtOps.textContent = ops.length ? ops.join('; ') : 'Curățare automată standard';

    modalArtFullLink.href = `data/web-images/${item.image_file}`;
    modalArtSidebarLink.href = `data/sidebar-crops/${item.sidebar_file}`;

    editArtworkModal.showModal();
  }

  // 5. General și Hero Form
  function populateGeneralForm() {
    const sc = state.siteContent || {};
    const gen = sc.general || {};
    const hero = sc.hero || {};

    setInputValue(formGeneral, 'site_title', gen.site_title);
    setInputValue(formGeneral, 'site_description', gen.site_description);
    setInputValue(formGeneral, 'announcement_text', gen.announcement_text);
    setInputValue(formGeneral, 'primary_domain', gen.primary_domain);
    setInputValue(formGeneral, 'secondary_domain', gen.secondary_domain);

    setInputValue(formGeneral, 'hero_badge', hero.badge);
    setInputValue(formGeneral, 'hero_title', hero.title);
    setInputValue(formGeneral, 'hero_lead', hero.lead);
    setInputValue(formGeneral, 'stat_digitized', hero.stat_digitized);
    setInputValue(formGeneral, 'stat_categories', hero.stat_categories);
    setInputValue(formGeneral, 'stat_posts', hero.stat_posts);
    setInputValue(formGeneral, 'stat_cleaned', hero.stat_cleaned);
  }

  // 6. Artist Form
  function populateArtistForm() {
    const sc = state.siteContent || {};
    const art = sc.artist || {};

    setInputValue(formArtist, 'artist_name', art.name);
    setInputValue(formArtist, 'artist_ig', art.instagram);
    setInputValue(formArtist, 'artist_arch_ig', art.archive_instagram);
    setInputValue(formArtist, 'artist_sig', art.signature);
    setInputValue(formArtist, 'artist_p1', art.paragraph_1);
    setInputValue(formArtist, 'artist_p2', art.paragraph_2);
  }

  // 7. Taxonomy Form
  function populateTaxonomyForm() {
    const cats = state.categories || [];
    const romanMap = ['I', 'II', 'III', 'IV', 'V'];

    taxonomyCardsContainer.innerHTML = cats.map((cat, idx) => {
      const roman = romanMap[idx] || (idx + 1);
      return `
        <div class="taxonomy-card" data-cat-id="${cat.id}">
          <div class="taxonomy-card-head">
            <span class="tax-roman">${roman}</span>
            <span class="tax-id-badge">ID: ${cat.id}</span>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Denumire Categorie (Română)</label>
              <input type="text" class="tax-name-ro" value="${escapeHtml(cat.name_ro || '')}" required>
            </div>
            <div class="form-group">
              <label>Denumire Internațională (Engleză)</label>
              <input type="text" class="tax-name-en" value="${escapeHtml(cat.name_en || '')}" required>
            </div>
          </div>

          <div class="form-group">
            <label>Descriere Curatorială și Teză Critică</label>
            <textarea class="tax-desc" rows="3" required>${escapeHtml(cat.description || '')}</textarea>
          </div>
        </div>
      `;
    }).join('');
  }

  // 8. Integrity Form
  function populateIntegrityForm() {
    const sc = state.siteContent || {};
    const integ = sc.integrity || {};
    const foot = sc.footer || {};

    setInputValue(formIntegrity, 'box1_title', integ.box1_title);
    setInputValue(formIntegrity, 'box1_text', integ.box1_text);
    setInputValue(formIntegrity, 'box2_title', integ.box2_title);
    setInputValue(formIntegrity, 'box2_text', integ.box2_text);
    setInputValue(formIntegrity, 'box3_title', integ.box3_title);
    setInputValue(formIntegrity, 'box3_text', integ.box3_text);

    setInputValue(formIntegrity, 'copyright', foot.copyright);
    setInputValue(formIntegrity, 'tech_note', foot.tech_note);
  }

  // 9. Forms Submit Events
  function setupFormEvents() {
    // Form General
    formGeneral.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sc = state.siteContent;
      sc.general = sc.general || {};
      sc.hero = sc.hero || {};

      sc.general.site_title = getInputValue(formGeneral, 'site_title');
      sc.general.site_description = getInputValue(formGeneral, 'site_description');
      sc.general.announcement_text = getInputValue(formGeneral, 'announcement_text');
      sc.general.primary_domain = getInputValue(formGeneral, 'primary_domain');
      sc.general.secondary_domain = getInputValue(formGeneral, 'secondary_domain');

      sc.hero.badge = getInputValue(formGeneral, 'hero_badge');
      sc.hero.title = getInputValue(formGeneral, 'hero_title');
      sc.hero.lead = getInputValue(formGeneral, 'hero_lead');
      sc.hero.stat_digitized = getInputValue(formGeneral, 'stat_digitized');
      sc.hero.stat_categories = getInputValue(formGeneral, 'stat_categories');
      sc.hero.stat_posts = getInputValue(formGeneral, 'stat_posts');
      sc.hero.stat_cleaned = getInputValue(formGeneral, 'stat_cleaned');

      await saveSiteContent('Textele generale și secțiunea Hero au fost publicate!');
    });

    // Form Artist
    formArtist.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sc = state.siteContent;
      sc.artist = sc.artist || {};

      sc.artist.name = getInputValue(formArtist, 'artist_name');
      sc.artist.instagram = getInputValue(formArtist, 'artist_ig');
      sc.artist.archive_instagram = getInputValue(formArtist, 'artist_arch_ig');
      sc.artist.signature = getInputValue(formArtist, 'artist_sig');
      sc.artist.paragraph_1 = getInputValue(formArtist, 'artist_p1');
      sc.artist.paragraph_2 = getInputValue(formArtist, 'artist_p2');

      await saveSiteContent('Profilul artistului a fost salvat și publicat!');
    });

    // Form Taxonomy
    formTaxonomy.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cards = taxonomyCardsContainer.querySelectorAll('.taxonomy-card');
      const updatedCategories = [];

      cards.forEach(card => {
        const id = card.getAttribute('data-cat-id');
        const nameRo = card.querySelector('.tax-name-ro').value.trim();
        const nameEn = card.querySelector('.tax-name-en').value.trim();
        const desc = card.querySelector('.tax-desc').value.trim();

        updatedCategories.push({
          id: id,
          name_ro: nameRo,
          name_en: nameEn,
          description: desc
        });
      });

      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonStringifySafe({ categories: updatedCategories })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          state.categories = updatedCategories;
          showToast('Direcțiile critice au fost actualizate și publicate în galerie!');
        } else {
          showToast(data.error || 'Eroare la salvare.', 'error');
        }
      } catch (err) {
        showToast('Eroare de conexiune cu serverul.', 'error');
      }
    });

    // Form Integrity
    formIntegrity.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sc = state.siteContent;
      sc.integrity = sc.integrity || {};
      sc.footer = sc.footer || {};

      sc.integrity.box1_title = getInputValue(formIntegrity, 'box1_title');
      sc.integrity.box1_text = getInputValue(formIntegrity, 'box1_text');
      sc.integrity.box2_title = getInputValue(formIntegrity, 'box2_title');
      sc.integrity.box2_text = getInputValue(formIntegrity, 'box2_text');
      sc.integrity.box3_title = getInputValue(formIntegrity, 'box3_title');
      sc.integrity.box3_text = getInputValue(formIntegrity, 'box3_text');

      sc.footer.copyright = getInputValue(formIntegrity, 'copyright');
      sc.footer.tech_note = getInputValue(formIntegrity, 'tech_note');

      await saveSiteContent('Documentația de integritate și footer-ul au fost actualizate!');
    });
  }

  async function saveSiteContent(successMsg) {
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStringifySafe({ site_content: state.siteContent })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(successMsg);
      } else {
        showToast(data.error || 'Eroare la salvare.', 'error');
      }
    } catch (err) {
      showToast('Eroare de comunicare cu serverul.', 'error');
    }
  }

  // Helpers
  function setInputValue(form, name, val) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el && val !== undefined && val !== null) {
      el.value = val;
    }
  }

  function getInputValue(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function jsonStringifySafe(obj) {
    return JSON.stringify(obj);
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);
})();

