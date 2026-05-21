/* ============================================================
   section-bgs-admin.js
   Interface admin pour gérer les images de fond des sections
   du site public. Stockage : localStorage["leila_section_bgs"].
   ============================================================ */
(function () {
  'use strict';

  const STORE_KEY = 'leila_section_bgs';

  // Pages publiques connues du site
  const PAGES = [
    { file: 'index.html',          label: "Accueil association",       icon: '🏛' },
    { file: 'foyer-accueil.html',  label: "Foyer Les Trois Rivières",  icon: '🏡' },
    { file: 'saj-accueil.html',    label: "SAJ Les Trois Rivières",    icon: '🎨' },
    { file: 'savs-accueil.html',   label: "SAVS Les Trois Rivières",   icon: '🤝' },
    { file: 'emp-accueil.html',    label: "EMP Henri Wallon",          icon: '🎒' },
    { file: 'presentation.html',   label: "Présentation",              icon: '📖' },
    { file: 'accompagnement.html', label: "Accompagnement",            icon: '💚' },
    { file: 'activites.html',      label: "Activités",                 icon: '🎭' },
    { file: 'vie-sociale.html',    label: "Vie sociale",               icon: '🤗' },
    { file: 'equipe.html',         label: "Équipe",                    icon: '👥' },
    { file: 'actualites.html',     label: "Actualités",                icon: '📰' },
    { file: 'agenda.html',         label: "Agenda",                    icon: '📅' },
    { file: 'documents.html',      label: "Documents",                 icon: '📁' },
    { file: 'partenaires.html',    label: "Partenaires",               icon: '🤝' },
    { file: 'candidater.html',     label: "Candidater (stage)",        icon: '🎓' },
    { file: 'admission.html',      label: "Admission",                 icon: '📋' },
    { file: 'contact.html',        label: "Contact",                   icon: '📞' },
    { file: 'accessibilite.html',  label: "Accessibilité",             icon: '♿' },
    { file: 'mentions-legales.html', label: "Mentions légales",        icon: '⚖️' }
  ];

  /* ── Storage ─────────────────────────────────────── */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    // Trigger storage event manually for same-window listeners
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY }));
    } catch (e) {}
  }

  /* ── Cache du HTML des pages publiques ────────────── */
  const pageCache = {};
  async function fetchPage(file) {
    if (pageCache[file]) return pageCache[file];
    try {
      const r = await fetch(file, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const sections = Array.from(doc.querySelectorAll(
        'main > section, body > main > section, body > section'
      ));
      const parsed = sections.map((sec, i) => {
        // Titre de la section : H1 > H2 > H3 > commentaire HTML précédent > fallback
        const h = sec.querySelector('h1, h2, h3');
        let title = h ? h.textContent.trim() : '';

        // Fallback : nom de la classe ou ID
        if (!title) {
          if (sec.classList.contains('hero')) title = 'En-tête principal (hero)';
          else if (sec.classList.contains('page-header')) title = 'En-tête de page';
          else if (sec.classList.contains('cta-section')) title = "Appel à l'action";
          else if (sec.id) title = sec.id;
          else title = 'Section ' + (i + 1);
        }

        // Tronquer si trop long
        if (title.length > 70) title = title.slice(0, 70) + '…';

        // Type
        let type = '';
        if (sec.classList.contains('hero')) type = 'hero';
        else if (sec.classList.contains('page-header')) type = 'header';
        else if (sec.classList.contains('cta-section')) type = 'cta';
        else if (sec.classList.contains('section-alt')) type = 'alt';
        else type = 'section';

        return { idx: i, title, type, id: sec.id || '' };
      });
      pageCache[file] = parsed;
      return parsed;
    } catch (e) {
      console.warn('[section-bgs] fetch failed for', file, e);
      return null;
    }
  }

  /* ── Render UI ────────────────────────────────────── */
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  async function renderSectionsList(file) {
    const wrap = document.getElementById('sbg-sections-list');
    if (!wrap) return;
    wrap.innerHTML = '<div class="sbg-loading">Chargement des sections…</div>';

    const sections = await fetchPage(file);
    if (!sections) {
      wrap.innerHTML = '<div class="empty-state"><strong>Impossible de charger cette page</strong>Vérifie que le fichier existe.</div>';
      return;
    }
    if (!sections.length) {
      wrap.innerHTML = '<div class="empty-state"><strong>Aucune section détectée</strong>Cette page n\'a pas de balises &lt;section&gt; modifiables.</div>';
      return;
    }

    const all = load();
    const pageBgs = all[file] || {};

    const typeIcons = {
      hero: '🌅', header: '📌', cta: '📣', alt: '🎨', section: '📄'
    };
    const typeLabels = {
      hero: 'En-tête principal', header: 'Bandeau', cta: 'Appel à action',
      alt: 'Section alternée', section: 'Section'
    };

    wrap.innerHTML = `
      <div class="sbg-list">
        ${sections.map(s => {
          const cfg = pageBgs[String(s.idx)] || {};
          const hasImg = !!cfg.url;
          return `
            <div class="sbg-row ${hasImg ? 'has-img' : ''}" data-idx="${s.idx}">
              <div class="sbg-preview"
                   style="${hasImg ? `background-image: linear-gradient(rgba(255,255,255,${1 - (cfg.opacity ?? 0.55)}), rgba(255,255,255,${1 - (cfg.opacity ?? 0.55)})), url('${escapeHtml(cfg.url)}');` : ''}">
                ${!hasImg ? '<span class="sbg-preview-empty">Aucune image</span>' : ''}
                <div class="sbg-preview-type">${typeIcons[s.type]} ${typeLabels[s.type]}</div>
              </div>
              <div class="sbg-info">
                <div class="sbg-title">${escapeHtml(s.title)}</div>
                <div class="sbg-meta">Section ${s.idx + 1}${s.id ? ' · #' + escapeHtml(s.id) : ''}</div>

                ${hasImg ? `
                  <div class="sbg-controls">
                    <label>
                      Assombrissement
                      <input type="range" min="0" max="100" value="${Math.round((cfg.opacity ?? 0.55) * 100)}" data-ctrl="opacity">
                      <span class="sbg-val">${Math.round((cfg.opacity ?? 0.55) * 100)}%</span>
                    </label>
                    <label>
                      Position
                      <select data-ctrl="position">
                        <option value="center" ${(cfg.position || 'center') === 'center' ? 'selected' : ''}>Centre</option>
                        <option value="top" ${cfg.position === 'top' ? 'selected' : ''}>Haut</option>
                        <option value="bottom" ${cfg.position === 'bottom' ? 'selected' : ''}>Bas</option>
                      </select>
                    </label>
                    <label>
                      Teinte du voile
                      <select data-ctrl="overlay">
                        <option value="light" ${(cfg.overlay || 'light') === 'light' ? 'selected' : ''}>Claire (blanc)</option>
                        <option value="dark" ${cfg.overlay === 'dark' ? 'selected' : ''}>Sombre (noir)</option>
                      </select>
                    </label>
                  </div>
                ` : ''}

                <div class="sbg-actions">
                  <button class="btn btn-primary btn-sm" data-action="pick">
                    📁 Médiathèque
                  </button>
                  <button class="btn btn-secondary btn-sm" data-action="upload">
                    📤 Téléverser
                  </button>
                  ${hasImg ? `
                    <button class="btn btn-danger btn-sm" data-action="remove">🗑 Retirer</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind events
    wrap.querySelectorAll('.sbg-row').forEach(row => {
      const idx = row.dataset.idx;
      row.querySelector('[data-action="pick"]')?.addEventListener('click', () => {
        if (typeof window.openMediaPicker !== 'function') {
          alert('La médiathèque n\'est pas disponible.');
          return;
        }
        window.openMediaPicker(url => {
          updateConfig(file, idx, { url });
          renderSectionsList(file);
        });
      });
      row.querySelector('[data-action="upload"]')?.addEventListener('click', () => {
        // Téléversement direct sans passer par la médiathèque
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = async () => {
          if (!inp.files.length) return;
          const f = inp.files[0];
          if (f.size > 5 * 1024 * 1024) {
            alert('Image trop volumineuse (max 5 Mo).');
            return;
          }
          const reader = new FileReader();
          reader.onload = async (e) => {
            const dataUrl = e.target.result;
            // Tenter d'enregistrer aussi dans la médiathèque pour réutilisation future
            try {
              if (window.FoyerDB && typeof window.FoyerDB.saveMediaItem === 'function') {
                window.FoyerDB.saveMediaItem({
                  id: 'sbg-' + Date.now(),
                  name: f.name,
                  url: dataUrl,
                  size: f.size,
                  type: f.type,
                  createdAt: new Date().toISOString()
                });
              }
            } catch (err) { /* silencieux */ }
            updateConfig(file, idx, { url: dataUrl });
            renderSectionsList(file);
          };
          reader.readAsDataURL(f);
        };
        inp.click();
      });
      row.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
        if (!confirm('Retirer l\'image de fond de cette section ?')) return;
        removeConfig(file, idx);
        renderSectionsList(file);
      });

      row.querySelectorAll('[data-ctrl]').forEach(ctrl => {
        ctrl.addEventListener('change', () => {
          const ctrlName = ctrl.dataset.ctrl;
          let value = ctrl.value;
          if (ctrlName === 'opacity') value = parseInt(value, 10) / 100;
          updateConfig(file, idx, { [ctrlName]: value });
        });
        if (ctrl.type === 'range') {
          ctrl.addEventListener('input', () => {
            const valEl = ctrl.parentNode.querySelector('.sbg-val');
            if (valEl) valEl.textContent = ctrl.value + '%';
            const opacity = parseInt(ctrl.value, 10) / 100;
            updateConfig(file, idx, { opacity });
            // Update preview in-place
            const cfg = (load()[file] || {})[idx] || {};
            const preview = row.querySelector('.sbg-preview');
            if (preview && cfg.url) {
              preview.style.backgroundImage =
                `linear-gradient(rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity})), url('${cfg.url}')`;
            }
          });
        }
      });
    });
  }

  function updateConfig(file, idx, patch) {
    const all = load();
    if (!all[file]) all[file] = {};
    all[file][idx] = Object.assign({}, all[file][idx] || {}, patch);
    save(all);
  }
  function removeConfig(file, idx) {
    const all = load();
    if (all[file]) {
      delete all[file][idx];
      if (Object.keys(all[file]).length === 0) delete all[file];
    }
    save(all);
  }

  /* ── Init page ────────────────────────────────────── */
  function renderPagePicker() {
    const sel = document.getElementById('sbg-page-select');
    if (!sel) return;
    if (sel.dataset.populated) return;
    sel.innerHTML = PAGES.map(p =>
      `<option value="${p.file}">${p.icon}  ${p.label}</option>`
    ).join('');
    sel.dataset.populated = '1';
    const viewLink = document.getElementById('sbg-view-page');
    function syncView() {
      if (viewLink) viewLink.setAttribute('href', sel.value);
    }
    syncView();
    sel.addEventListener('change', () => {
      syncView();
      renderSectionsList(sel.value);
    });
    renderSectionsList(sel.value);
  }

  // Observe quand la page admin "section-bgs" devient active
  function init() {
    const page = document.getElementById('page-section-bgs');
    if (!page) return;

    const obs = new MutationObserver(() => {
      if (page.classList.contains('active')) renderPagePicker();
    });
    obs.observe(page, { attributes: true, attributeFilter: ['class'] });

    if (page.classList.contains('active')) renderPagePicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
