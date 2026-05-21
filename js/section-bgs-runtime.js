/* ============================================================
   section-bgs-runtime.js
   Lit les images de fond stockées en localStorage et les applique
   aux sections de la page courante.
   À inclure sur TOUTES les pages publiques du site.
   ============================================================ */
(function () {
  'use strict';

  const STORE_KEY = 'leila_section_bgs';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function getPageKey() {
    // Normalise la page courante
    let p = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!p || p === '/' || p === '') p = 'index.html';
    return p;
  }

  function applyBackgrounds() {
    const all = load();
    const page = getPageKey();
    const cfg = all[page];
    if (!cfg) return;

    // Cible : toutes les sections de premier niveau dans main ou body
    const sections = document.querySelectorAll(
      'main > section, body > main > section, body > section'
    );

    sections.forEach((sec, idx) => {
      const item = cfg[String(idx)];
      if (!item || !item.url) return;

      const url = item.url;
      const opacity = (typeof item.opacity === 'number') ? item.opacity : 0.55;
      const position = item.position || 'center';

      // Calque blanc semi-transparent + image de fond
      const overlayAlpha = Math.max(0, Math.min(1, 1 - opacity));
      const overlayColor = item.overlay === 'dark'
        ? `rgba(15,30,45,${1 - opacity})`
        : `rgba(255,255,255,${overlayAlpha})`;

      sec.style.backgroundImage =
        `linear-gradient(${overlayColor}, ${overlayColor}), url("${url}")`;
      sec.style.backgroundSize = 'cover';
      sec.style.backgroundPosition = position;
      sec.style.backgroundRepeat = 'no-repeat';
      sec.style.backgroundAttachment = item.parallax ? 'fixed' : 'scroll';
      sec.setAttribute('data-section-bg-applied', String(idx));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBackgrounds);
  } else {
    applyBackgrounds();
  }

  // Re-applique si la config change (ex: aperçu live depuis l'admin)
  window.addEventListener('storage', e => {
    if (e.key === STORE_KEY) applyBackgrounds();
  });

  // Expose une fonction utilitaire
  window.LeilaSectionBgs = { apply: applyBackgrounds, load, getPageKey };
})();
