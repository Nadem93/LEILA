/* ============================================================
   admin-refresh.js — Refonte 2026
   - Recherche globale par nom de section
   - Rendu du dashboard "À traiter" + raccourcis + activité
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. Sections indexées pour la recherche ───────── */
  const SECTIONS = [
    { page: 'dashboard',    label: 'Accueil',              group: 'Accueil',   ico: '🏠',  keywords: 'tableau bord accueil home' },
    { page: 'articles',     label: 'Actualités',           group: 'Publier',   ico: '📰',  keywords: 'article publier news actualité blog' },
    { page: 'events',       label: 'Agenda',               group: 'Publier',   ico: '📅',  keywords: 'événement event agenda calendrier date' },
    { page: 'photos',       label: 'Photos',               group: 'Publier',   ico: '🖼️',  keywords: 'image galerie photo album' },
    { page: 'media',        label: 'Vidéos',               group: 'Publier',   ico: '🎞️',  keywords: 'vidéo média film youtube embed' },
    { page: 'testimonials', label: 'Témoignages',          group: 'Publier',   ico: '💬',  keywords: 'avis témoignage citation' },
    { page: 'documents',    label: 'Documents',            group: 'Publier',   ico: '📁',  keywords: 'fichier pdf document télécharger' },
    { page: 'inbox',        label: 'Boîte de réception',   group: 'Demandes',  ico: '📨',  keywords: 'message contact inbox réception courrier' },
    { page: 'admissions',   label: 'Admissions',           group: 'Demandes',  ico: '📋',  keywords: 'admission demande résident inscription' },
    { page: 'applications', label: 'Candidatures stage',   group: 'Demandes',  ico: '🎓',  keywords: 'stage candidature étudiant cv' },
    { page: 'pagecontent',  label: 'Textes des pages',     group: 'Le site',   ico: '✏️',  keywords: 'texte contenu page édition' },
    { page: 'assopage',     label: "Page d'accueil",       group: 'Le site',   ico: '🏠',  keywords: 'accueil page asso home landing' },
    { page: 'pages',        label: 'Pages personnalisées', group: 'Le site',   ico: '📄',  keywords: 'page personnalisée secondaire' },
    { page: 'team',         label: 'Équipe',               group: 'Le site',   ico: '👥',  keywords: 'équipe staff membre' },
    { page: 'partners',     label: 'Partenaires',          group: 'Le site',   ico: '🤝',  keywords: 'partenaire logo' },
    { page: 'contact',      label: 'Contact & FAQ',        group: 'Le site',   ico: '📞',  keywords: 'contact faq horaire adresse coordonnées' },
    { page: 'branding',     label: 'Apparence du site',    group: 'Réglages',  ico: '🎨',  keywords: 'couleur logo marque identité branding' },
    { page: 'settings',     label: 'Préférences',          group: 'Réglages',  ico: '⚙️',  keywords: 'paramètre réglage settings' },
    { page: 'users',        label: 'Utilisateurs',         group: 'Réglages',  ico: '👤',  keywords: 'utilisateur user compte accès' },
    { page: 'versions',     label: 'Historique',           group: 'Réglages',  ico: '🕒',  keywords: 'historique version sauvegarde' }
  ];

  function normalize(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* ── 2. Recherche globale ─────────────────────────── */
  function initSearch() {
    const input   = document.getElementById('refresh-search-input');
    const results = document.getElementById('refresh-search-results');
    if (!input || !results) return;

    let focusedIdx = -1;
    let lastList = [];

    function render(list) {
      lastList = list;
      focusedIdx = -1;
      if (!list.length) {
        results.innerHTML = '<div class="rsr-empty">Aucun résultat</div>';
      } else {
        results.innerHTML = list.map((s, i) => `
          <div class="refresh-search-result" data-page="${s.page}" data-idx="${i}">
            <span class="rsr-ico">${s.ico}</span>
            <span>${s.label}</span>
            <span class="rsr-group">${s.group}</span>
          </div>
        `).join('');
      }
      results.classList.add('open');
    }

    input.addEventListener('focus', () => {
      const q = input.value.trim();
      render(q ? filter(q) : SECTIONS.slice(0, 8));
    });

    input.addEventListener('input', () => {
      const q = input.value.trim();
      render(q ? filter(q) : SECTIONS.slice(0, 8));
    });

    function filter(q) {
      const nq = normalize(q);
      return SECTIONS.filter(s =>
        normalize(s.label).includes(nq) ||
        normalize(s.keywords).includes(nq) ||
        normalize(s.group).includes(nq)
      ).slice(0, 10);
    }

    function pick(page) {
      if (typeof window.navigate === 'function') window.navigate(page);
      else document.querySelector(`.nav-item[data-page="${page}"]`)?.click();
      input.value = '';
      results.classList.remove('open');
      input.blur();
    }

    results.addEventListener('mousedown', e => {
      const item = e.target.closest('.refresh-search-result');
      if (item) { e.preventDefault(); pick(item.dataset.page); }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIdx = Math.min(focusedIdx + 1, lastList.length - 1);
        updateFocus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIdx = Math.max(focusedIdx - 1, 0);
        updateFocus();
      } else if (e.key === 'Enter' && focusedIdx >= 0) {
        e.preventDefault();
        pick(lastList[focusedIdx].page);
      } else if (e.key === 'Escape') {
        input.blur();
        results.classList.remove('open');
      }
    });

    function updateFocus() {
      results.querySelectorAll('.refresh-search-result').forEach((el, i) => {
        el.classList.toggle('focused', i === focusedIdx);
      });
    }

    document.addEventListener('click', e => {
      if (!e.target.closest('.refresh-search')) results.classList.remove('open');
    });

    // Cmd/Ctrl + K
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ── 3. Dashboard "À traiter" + raccourcis ────────── */
  function relativeTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return Math.floor(diff/60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff/3600) + ' h';
    if (diff < 604800) return 'il y a ' + Math.floor(diff/86400) + ' j';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function getCounts() {
    const db = window.db || {};
    const get = (k) => {
      try {
        const v = db[k] || JSON.parse(localStorage.getItem(k) || '[]');
        return Array.isArray(v) ? v : (v.items || []);
      } catch (e) { return []; }
    };
    const msgs = get('contactMessages') || get('messages') || [];
    const adm  = get('admissionRequests') || get('admissions') || [];
    const apps = get('stageApplications') || get('applications') || [];
    const unread = (list) => list.filter(x => !x.read && !x.processed && (x.status === 'new' || !x.status)).length || list.length;
    return {
      messages: unread(msgs),
      admissions: unread(adm),
      applications: unread(apps)
    };
  }

  function renderAttention() {
    const target = document.getElementById('dash-attention');
    if (!target) return;
    const c = getCounts();
    const total = c.messages + c.admissions + c.applications;
    const calm = total === 0;

    target.className = 'dash-attention' + (calm ? ' calm' : '');
    target.innerHTML = `
      <div class="dash-attention-icon">${calm ? '✓' : '!'}</div>
      <div class="dash-attention-content">
        <h2>${calm ? 'Tout est à jour' : 'À traiter aujourd\'hui'}</h2>
        <p>${calm
          ? 'Aucune nouvelle demande en attente. Profite-en pour publier ou mettre à jour le contenu du site.'
          : 'Voici les nouvelles demandes reçues depuis ta dernière visite.'}</p>
        <div class="dash-attention-actions">
          <button class="dash-attention-chip ${c.messages === 0 ? 'zero' : ''}" data-nav="inbox">
            <span class="chip-num">${c.messages}</span> Message${c.messages > 1 ? 's' : ''}
          </button>
          <button class="dash-attention-chip ${c.admissions === 0 ? 'zero' : ''}" data-nav="admissions">
            <span class="chip-num">${c.admissions}</span> Admission${c.admissions > 1 ? 's' : ''}
          </button>
          <button class="dash-attention-chip ${c.applications === 0 ? 'zero' : ''}" data-nav="applications">
            <span class="chip-num">${c.applications}</span> Candidature${c.applications > 1 ? 's' : ''} stage
          </button>
        </div>
      </div>
    `;
    target.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.navigate === 'function') window.navigate(btn.dataset.nav);
        else document.querySelector(`.nav-item[data-page="${btn.dataset.nav}"]`)?.click();
      });
    });
  }

  function renderActivity() {
    const target = document.getElementById('dash-activity');
    if (!target) return;
    const get = (k) => {
      try {
        const v = (window.db && window.db[k]) || JSON.parse(localStorage.getItem(k) || '[]');
        return Array.isArray(v) ? v : (v.items || []);
      } catch (e) { return []; }
    };

    const items = [];
    (get('articles') || []).slice(-3).forEach(a => items.push({
      type: 'blue', ico: '📰',
      title: a.title || 'Article',
      sub: 'Article publié',
      time: a.publishedAt || a.createdAt || a.date
    }));
    (get('admissionRequests') || get('admissions') || []).slice(-2).forEach(a => items.push({
      type: 'amber', ico: '📋',
      title: (a.firstName || '') + ' ' + (a.lastName || a.name || 'Demande'),
      sub: 'Demande d\'admission',
      time: a.createdAt || a.date
    }));
    (get('contactMessages') || []).slice(-2).forEach(m => items.push({
      type: 'green', ico: '✉️',
      title: m.name || m.from || 'Message',
      sub: (m.subject || m.message || '').slice(0, 60),
      time: m.createdAt || m.date
    }));

    items.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    const slice = items.slice(0, 5);

    if (!slice.length) {
      target.innerHTML = '<div class="empty-state"><strong>Pas d\'activité récente</strong>Les nouveaux contenus apparaîtront ici.</div>';
      return;
    }

    target.innerHTML = slice.map(it => `
      <div class="dash-feed-item">
        <div class="dash-feed-icon ${it.type}">${it.ico}</div>
        <div class="dash-feed-text">
          <strong>${escape(it.title)}</strong>
          <span>${escape(it.sub)}</span>
        </div>
        <div class="dash-feed-time">${relativeTime(it.time)}</div>
      </div>
    `).join('');
  }

  function escape(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function renderShortcuts() {
    const target = document.getElementById('dash-shortcuts');
    if (!target) return;
    const tiles = [
      { ico: '📰', title: 'Publier un article', sub: 'Annoncer une actualité au site',  action: () => { window.navigate('articles'); setTimeout(() => document.getElementById('btn-new-article')?.click(), 200); } },
      { ico: '📅', title: 'Ajouter un événement', sub: "Compléter l'agenda",            action: () => { window.navigate('events'); } },
      { ico: '🖼️', title: 'Ajouter des photos',   sub: 'Enrichir la galerie',           action: () => { window.navigate('photos'); } },
      { ico: '📨', title: 'Voir les messages',   sub: 'Répondre aux demandes reçues',   action: () => { window.navigate('inbox'); } }
    ];
    target.innerHTML = tiles.map((t, i) => `
      <button class="dash-shortcut" data-idx="${i}">
        <div class="ds-icon">${t.ico}</div>
        <div>
          <div class="ds-title">${t.title}</div>
          <div class="ds-sub">${t.sub}</div>
        </div>
      </button>
    `).join('');
    target.querySelectorAll('.dash-shortcut').forEach((b, i) => {
      b.addEventListener('click', tiles[i].action);
    });
  }

  function refreshDashboard() {
    renderAttention();
    renderShortcuts();
    renderActivity();
    // Greeting
    const g = document.getElementById('dash-greeting');
    if (g) {
      const h = new Date().getHours();
      let greet = 'Bonjour';
      if (h >= 18) greet = 'Bonsoir';
      else if (h >= 12) greet = 'Bon après-midi';
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      g.textContent = greet + ' — nous sommes le ' + today + '.';
    }
  }

  /* ── 4. Initialisation ────────────────────────────── */
  function waitForApp(cb) {
    const app = document.getElementById('app');
    if (app && app.style.display !== 'none') return cb();
    setTimeout(() => waitForApp(cb), 250);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    waitForApp(() => {
      refreshDashboard();
      // Re-render when dashboard becomes active
      const dash = document.getElementById('page-dashboard');
      if (dash) {
        const obs = new MutationObserver(() => {
          if (dash.classList.contains('active')) refreshDashboard();
        });
        obs.observe(dash, { attributes: true, attributeFilter: ['class'] });
      }
      // Refresh every 30s in background
      setInterval(refreshDashboard, 30000);
    });
  });

})();
