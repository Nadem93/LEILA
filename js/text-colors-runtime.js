/* ============================================================
   text-colors-runtime.js
   Applique les couleurs de texte personnalisées sur les pages
   publiques. À charger sur toutes les pages.
   ============================================================ */
(function () {
  'use strict';

  const STORE_KEY = 'leila_text_colors';
  const STYLE_ID = 'leila-text-colors-style';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function buildCss(c) {
    const rules = [];

    if (c.body) {
      rules.push(`body, p, li, td, th, label, span:not([class*="accent"]):not([class*="badge"]) {
        color: ${c.body} !important;
      }`);
    }
    if (c.heading) {
      rules.push(`h1, h2, h3, h4, h5, h6 {
        color: ${c.heading} !important;
      }`);
      // Heading inside hero sections sometimes use .accent — keep accent color separate
    }
    if (c.link) {
      rules.push(`a:not(.btn):not(.nav-item):not(.service-card):not([class*="card"]):not(.hero-actions a) {
        color: ${c.link} !important;
      }
      a:not(.btn):not(.nav-item):hover {
        color: ${c.linkHover || c.link} !important;
      }`);
    }
    if (c.accent) {
      rules.push(`.accent, .hero-tag, h1 .accent, h2 .accent, h3 .accent {
        color: ${c.accent} !important;
      }`);
    }

    return rules.join('\n');
  }

  function apply() {
    const c = load();
    let style = document.getElementById(STYLE_ID);
    const css = buildCss(c);

    if (!css) {
      if (style) style.remove();
      return;
    }

    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      // Inject as LAST element of <head> to maximize override priority
      document.head.appendChild(style);
    }
    style.textContent = css;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  // Re-applique sur changement (preview live)
  window.addEventListener('storage', e => {
    if (e.key === STORE_KEY) apply();
  });

  window.LeilaTextColors = { apply, load };
})();
