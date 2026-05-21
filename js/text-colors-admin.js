/* ============================================================
   text-colors-admin.js
   Interface admin pour personnaliser les couleurs de texte
   de toutes les pages du site.
   ============================================================ */
(function () {
  'use strict';

  const STORE_KEY = 'leila_text_colors';

  const DEFAULTS = {
    body:      '#1c1f24',
    heading:   '#1c1f24',
    link:      '#2d6960',
    linkHover: '#245750',
    accent:    '#c47a3d'
  };

  const PRESETS = [
    { name: 'Par défaut (sombre)',  body: '#1c1f24', heading: '#1c1f24', link: '#2d6960', linkHover: '#245750', accent: '#c47a3d' },
    { name: 'Bleu classique',       body: '#1a2530', heading: '#194e62', link: '#256880', linkHover: '#1d4f64', accent: '#d9924a' },
    { name: 'Sauge & terracotta',   body: '#2c3036', heading: '#1c1f24', link: '#2d6960', linkHover: '#245750', accent: '#c47a3d' },
    { name: 'Charbon',              body: '#2a2a2a', heading: '#000000', link: '#444444', linkHover: '#000000', accent: '#666666' },
    { name: 'Marine doux',          body: '#2a3a48', heading: '#0f2942', link: '#3a6b8a', linkHover: '#1d4f64', accent: '#b87030' }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY }));
    } catch (e) {}
  }

  function update(patch) {
    const cur = load();
    save(Object.assign({}, cur, patch));
  }

  function applyPreset(preset) {
    save({
      body: preset.body, heading: preset.heading,
      link: preset.link, linkHover: preset.linkHover, accent: preset.accent
    });
    renderForm();
  }

  function reset() {
    if (!confirm('Réinitialiser toutes les couleurs aux valeurs par défaut ?')) return;
    localStorage.removeItem(STORE_KEY);
    try { window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY })); } catch (e) {}
    renderForm();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function renderForm() {
    const wrap = document.getElementById('tc-form-wrap');
    if (!wrap) return;
    const cur = load();
    const val = (k) => cur[k] || DEFAULTS[k];

    wrap.innerHTML = `
      <div class="tc-grid">
        <div class="tc-form">
          <div class="tc-section-title">Couleurs principales</div>

          <div class="tc-field">
            <label>
              <span class="tc-label-head">
                <strong>Texte courant</strong>
                <small>Paragraphes, listes, contenu général</small>
              </span>
              <div class="tc-input">
                <input type="color" data-key="body" value="${val('body')}">
                <input type="text" class="tc-hex" data-key="body" value="${val('body')}">
              </div>
            </label>
          </div>

          <div class="tc-field">
            <label>
              <span class="tc-label-head">
                <strong>Titres</strong>
                <small>H1, H2, H3, H4 — titres et sous-titres</small>
              </span>
              <div class="tc-input">
                <input type="color" data-key="heading" value="${val('heading')}">
                <input type="text" class="tc-hex" data-key="heading" value="${val('heading')}">
              </div>
            </label>
          </div>

          <div class="tc-field">
            <label>
              <span class="tc-label-head">
                <strong>Liens</strong>
                <small>Hyperliens dans le contenu</small>
              </span>
              <div class="tc-input">
                <input type="color" data-key="link" value="${val('link')}">
                <input type="text" class="tc-hex" data-key="link" value="${val('link')}">
              </div>
            </label>
          </div>

          <div class="tc-field">
            <label>
              <span class="tc-label-head">
                <strong>Liens (survol)</strong>
                <small>Couleur au passage de la souris</small>
              </span>
              <div class="tc-input">
                <input type="color" data-key="linkHover" value="${val('linkHover')}">
                <input type="text" class="tc-hex" data-key="linkHover" value="${val('linkHover')}">
              </div>
            </label>
          </div>

          <div class="tc-field">
            <label>
              <span class="tc-label-head">
                <strong>Texte accentué</strong>
                <small>Mots colorés dans les titres, badges</small>
              </span>
              <div class="tc-input">
                <input type="color" data-key="accent" value="${val('accent')}">
                <input type="text" class="tc-hex" data-key="accent" value="${val('accent')}">
              </div>
            </label>
          </div>

          <div class="tc-actions">
            <button class="btn btn-secondary" id="tc-reset">↺ Réinitialiser</button>
          </div>
        </div>

        <div class="tc-preview-wrap">
          <div class="tc-section-title">Aperçu</div>
          <div class="tc-preview" id="tc-preview">
            <p class="tc-tag" style="color: ${val('accent')};">Depuis 1963 · 60 ans d'engagement</p>
            <h1 style="color: ${val('heading')};">Association <em style="color: ${val('accent')};">LEILA</em> — accompagner avec dignité.</h1>
            <p style="color: ${val('body')};">
              Notre association accompagne les personnes en situation de handicap mental dans leur parcours de vie.
              Nous proposons un <a href="#" style="color: ${val('link')};">accompagnement personnalisé</a>
              au sein de nos différents services.
            </p>
            <h2 style="color: ${val('heading')};">Nos valeurs</h2>
            <p style="color: ${val('body')};">
              Respect, écoute, bienveillance — ces <a href="#" style="color: ${val('link')};">trois piliers</a>
              guident notre engagement quotidien.
            </p>
          </div>

          <div class="tc-section-title" style="margin-top: 1.5rem;">Préréglages</div>
          <div class="tc-presets">
            ${PRESETS.map((p, i) => `
              <button class="tc-preset" data-preset="${i}">
                <span class="tc-preset-swatches">
                  <span style="background:${p.body};"></span>
                  <span style="background:${p.heading};"></span>
                  <span style="background:${p.link};"></span>
                  <span style="background:${p.accent};"></span>
                </span>
                <span class="tc-preset-name">${escapeHtml(p.name)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const wrap = document.getElementById('tc-form-wrap');
    if (!wrap) return;

    // Color pickers + hex inputs sync
    wrap.querySelectorAll('input[type="color"]').forEach(el => {
      el.addEventListener('input', () => {
        const key = el.dataset.key;
        const hex = el.value;
        update({ [key]: hex });
        const hexInput = wrap.querySelector(`input.tc-hex[data-key="${key}"]`);
        if (hexInput) hexInput.value = hex;
        updatePreview();
      });
    });

    wrap.querySelectorAll('input.tc-hex').forEach(el => {
      el.addEventListener('input', () => {
        const key = el.dataset.key;
        const hex = el.value.trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
        update({ [key]: hex });
        const colorInput = wrap.querySelector(`input[type="color"][data-key="${key}"]`);
        if (colorInput) colorInput.value = hex;
        updatePreview();
      });
    });

    // Presets
    wrap.querySelectorAll('.tc-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = PRESETS[parseInt(btn.dataset.preset, 10)];
        if (preset) applyPreset(preset);
      });
    });

    // Reset
    wrap.querySelector('#tc-reset')?.addEventListener('click', reset);
  }

  function updatePreview() {
    const preview = document.getElementById('tc-preview');
    if (!preview) return;
    const cur = load();
    const val = (k) => cur[k] || DEFAULTS[k];

    preview.querySelectorAll('p.tc-tag, h1 em').forEach(el => el.style.color = val('accent'));
    preview.querySelectorAll('h1, h2').forEach(el => {
      // restore color but skip the em.accent inside
      const ems = el.querySelectorAll('em');
      el.style.color = val('heading');
      ems.forEach(em => em.style.color = val('accent'));
    });
    preview.querySelectorAll('p:not(.tc-tag)').forEach(el => el.style.color = val('body'));
    preview.querySelectorAll('a').forEach(el => el.style.color = val('link'));
  }

  function init() {
    const page = document.getElementById('page-text-colors');
    if (!page) return;
    const obs = new MutationObserver(() => {
      if (page.classList.contains('active')) renderForm();
    });
    obs.observe(page, { attributes: true, attributeFilter: ['class'] });
    if (page.classList.contains('active')) renderForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
