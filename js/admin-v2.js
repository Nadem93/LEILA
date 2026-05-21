/* ============================================================
   admin-v2.js — Enrichissements visuels du tableau de bord
   - Mini-charts (sparklines) sur les cartes stats
   - Quick actions sur le dashboard
   - Bouton "Publier" pour sync online
   ============================================================ */

(function () {
  'use strict';

  if (typeof FoyerDB === 'undefined') return;

  /* ── Helpers SVG sparkline ─────────────────────────── */
  function sparkline(values, color = 'blue') {
    const w = 200, h = 32, pad = 2;
    if (!values || !values.length) values = [0];
    const max = Math.max(...values, 1);
    const step = (w - pad * 2) / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y];
    });
    const linePath = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    const fillPath = `${linePath} L${points[points.length - 1][0]},${h} L${points[0][0]},${h} Z`;
    return `<svg class="av2-spark spark-${color}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <path class="av2-spark-fill" d="${fillPath}"/>
      <path class="av2-spark-line" d="${linePath}"/>
    </svg>`;
  }

  function trendBadge(values) {
    if (!values || values.length < 2) return '';
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    if (last === 0 && prev === 0) return ''; // pas de bruit visuel si aucune donnée
    if (last === prev) return `<span class="av2-trend flat">→ 0%</span>`;
    if (prev === 0) return `<span class="av2-trend up">↑ nouveau</span>`;
    const pct = Math.round(((last - prev) / prev) * 100);
    if (pct > 0) return `<span class="av2-trend up">↑ ${pct}%</span>`;
    return `<span class="av2-trend down">↓ ${Math.abs(pct)}%</span>`;
  }

  /* ── Génère un tableau de comptes sur N mois ───────── */
  function countByMonth(items, dateField, monthsBack = 6) {
    const now = new Date();
    const buckets = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      buckets.push({ key, count: 0 });
    }
    items.forEach(it => {
      const raw = it[dateField] || it.date || it.createdAt || it.receivedAt;
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d)) return;
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const b = buckets.find(x => x.key === key);
      if (b) b.count++;
    });
    return buckets.map(b => b.count);
  }

  /* ── Enrichit le dashboard avec stats + mini-charts ── */
  function enhanceDashboard() {
    const grid = document.getElementById('dash-stats');
    if (!grid) return;

    const articles    = FoyerDB.getArticles({ published: true });
    const testimonials= FoyerDB.getTestimonials({ published: true });
    const admissions  = FoyerDB.getAdmissions();
    const messages    = (FoyerDB.getMessages ? FoyerDB.getMessages() : []);
    const applications= (FoyerDB.getApplications ? FoyerDB.getApplications() : []);
    const events      = (FoyerDB.getEvents ? FoyerDB.getEvents() : []);

    const artSpark = countByMonth(articles, 'date');
    const admSpark = countByMonth(admissions, 'receivedAt');
    const msgSpark = countByMonth(messages, 'receivedAt');
    const appSpark = countByMonth(applications, 'receivedAt');

    const cards = [
      {
        icon: '📰', label: 'Articles publiés', val: articles.length,
        spark: sparkline(artSpark, 'blue'), trend: trendBadge(artSpark)
      },
      {
        icon: '💬', label: 'Témoignages actifs', val: testimonials.length,
        spark: '', trend: ''
      },
      {
        icon: '📋', label: 'Demandes d\'admission', val: admissions.length,
        spark: sparkline(admSpark, 'amber'), trend: trendBadge(admSpark)
      },
      {
        icon: '📨', label: 'Messages reçus', val: messages.length,
        spark: sparkline(msgSpark, 'green'), trend: trendBadge(msgSpark)
      },
      {
        icon: '🎓', label: 'Candidatures stage', val: applications.length,
        spark: sparkline(appSpark, 'purple'), trend: trendBadge(appSpark)
      },
      {
        icon: '📅', label: 'Événements à venir',
        val: events.filter(e => {
          const d = new Date(e.date || e.startDate || 0);
          return d > new Date();
        }).length,
        spark: '', trend: ''
      }
    ];

    grid.innerHTML = cards.map(c => `
      <div class="stat-card">
        <div class="stat-icon">${c.icon}</div>
        <div class="stat-val">${c.val}${c.trend}</div>
        <div class="stat-lbl">${c.label}</div>
        ${c.spark}
      </div>
    `).join('');
  }

  /* ── Quick actions au-dessus des graphs ─────────────── */
  function injectQuickActions() {
    const dash = document.getElementById('page-dashboard');
    if (!dash || dash.querySelector('.av2-quick-actions')) return;

    const stats = dash.querySelector('.stats-grid');
    if (!stats) return;

    const qa = document.createElement('div');
    qa.className = 'av2-quick-actions';
    qa.innerHTML = `
      <button class="av2-quick-action" data-nav="articles">
        <span class="av2-qa-icon">➕</span>
        <span>Créer un article</span>
      </button>
      <button class="av2-quick-action" data-nav="testimonials">
        <span class="av2-qa-icon">💬</span>
        <span>Ajouter un témoignage</span>
      </button>
      <button class="av2-quick-action" data-nav="inbox">
        <span class="av2-qa-icon">📨</span>
        <span>Voir la boîte de réception</span>
      </button>
      <button class="av2-quick-action" data-nav="photos">
        <span class="av2-qa-icon">🖼️</span>
        <span>Ajouter des photos</span>
      </button>
    `;
    stats.parentNode.insertBefore(qa, stats);

    qa.addEventListener('click', e => {
      const btn = e.target.closest('.av2-quick-action');
      if (!btn) return;
      if (typeof window.navigate === 'function') window.navigate(btn.dataset.nav);
      else document.querySelector(`.nav-item[data-page="${btn.dataset.nav}"]`)?.click();
    });
  }

  /* ── Publish bar : indique état + bouton Publier ────── */
  let unsavedChanges = false;
  let pubBar = null;

  function buildPublishBar() {
    if (document.querySelector('.av2-publish-bar')) return;
    pubBar = document.createElement('div');
    pubBar.className = 'av2-publish-bar';
    pubBar.innerHTML = `
      <span class="av2-pub-status" aria-hidden="true"></span>
      <div class="av2-pub-text">
        <strong id="av2-pub-title">Données à jour</strong>
        <span id="av2-pub-sub">Toutes les modifications sont enregistrées localement.</span>
      </div>
      <button class="btn btn-primary btn-sm" id="av2-pub-btn" title="Exporter un instantané prêt à déployer">
        Publier
      </button>
    `;
    document.body.appendChild(pubBar);

    document.getElementById('av2-pub-btn').addEventListener('click', publishSnapshot);
  }

  function setPublishState(unsaved) {
    unsavedChanges = unsaved;
    if (!pubBar) return;
    const dot = pubBar.querySelector('.av2-pub-status');
    const title = document.getElementById('av2-pub-title');
    const sub = document.getElementById('av2-pub-sub');
    if (unsaved) {
      dot.style.background = 'var(--av2-amber)';
      dot.style.boxShadow = '0 0 0 4px rgba(217,146,74,.18)';
      title.textContent = 'Modifications en attente';
      sub.textContent = 'Cliquez sur Publier pour générer le fichier à déployer.';
    } else {
      dot.style.background = 'var(--av2-green)';
      dot.style.boxShadow = '0 0 0 4px rgba(47,138,82,.18)';
      title.textContent = 'Données à jour';
      sub.textContent = 'Toutes les modifications sont enregistrées.';
    }
  }

  /* ── Publish = télécharger un snapshot data.json ──── */
  function publishSnapshot() {
    if (!FoyerDB.exportAll) {
      alert('Fonction d\'export non disponible.');
      return;
    }
    const snapshot = FoyerDB.exportAll();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leila-data-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);

    // Affiche un mini panneau d'instructions
    showPublishHelp();
    setPublishState(false);
  }

  function showPublishHelp() {
    const existing = document.getElementById('av2-pub-help');
    if (existing) existing.remove();
    const help = document.createElement('div');
    help.id = 'av2-pub-help';
    help.style.cssText = `
      position: fixed; bottom: 100px; right: 24px; z-index: 60;
      background: white; border: 1px solid var(--av2-border, #ebebe9);
      border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,.1);
      padding: 1.2rem 1.4rem; max-width: 380px; font-size: .88rem;
      line-height: 1.55; color: var(--av2-text, #1f2329);
      animation: av2-slideIn .3s ease;
    `;
    help.innerHTML = `
      <button style="position:absolute;top:.5rem;right:.5rem;background:none;border:none;font-size:1.1rem;color:#8b94a0;cursor:pointer;" onclick="this.parentNode.remove()">✕</button>
      <strong style="display:block;font-size:.95rem;margin-bottom:.5rem;color:#1f2329;">📦 Fichier généré : leila-data-${new Date().toISOString().slice(0,10)}.json</strong>
      <p style="color:#58616a;margin:0 0 .8rem;">Le fichier a été téléchargé. Pour le mettre en ligne :</p>
      <ol style="margin:0;padding-left:1.2rem;color:#58616a;">
        <li>Uploadez-le sur votre hébergement (à côté de <code>index.html</code>)</li>
        <li>Le site le chargera automatiquement à la prochaine visite</li>
        <li>Toutes les modifications seront visibles pour les visiteurs</li>
      </ol>
      <p style="color:#8b94a0;font-size:.78rem;margin-top:.8rem;margin-bottom:0;">Note : pour une sync automatique en temps réel, un backend serait nécessaire.</p>
    `;
    document.body.appendChild(help);
    setTimeout(() => { help.style.transition = 'opacity .4s'; help.style.opacity = '0'; setTimeout(() => help.remove(), 400); }, 12000);
  }

  /* ── Détecte les changements (intercepte localStorage) ─ */
  function watchChanges() {
    const origSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, val) {
      origSet.apply(this, arguments);
      if (key && key.startsWith('3r-') && key !== '3r-versions') {
        setPublishState(true);
      }
    };
  }

  /* ── Animation injection ────────────────────────────── */
  function injectAnimation() {
    if (document.getElementById('av2-keyframes')) return;
    const s = document.createElement('style');
    s.id = 'av2-keyframes';
    s.textContent = `@keyframes av2-slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }`;
    document.head.appendChild(s);
  }

  /* ── Init après chargement du DOM ───────────────────── */
  function init() {
    injectAnimation();
    buildPublishBar();
    watchChanges();

    // Hook into the existing render function
    enhanceDashboard();
    injectQuickActions();

    // Re-render dashboard whenever it becomes active
    const dash = document.getElementById('page-dashboard');
    if (dash) {
      const obs = new MutationObserver(() => {
        if (dash.classList.contains('active')) {
          setTimeout(() => { enhanceDashboard(); injectQuickActions(); }, 50);
        }
      });
      obs.observe(dash, { attributes: true, attributeFilter: ['class'] });
    }

    // Cross-tab sync
    window.addEventListener('storage', e => {
      if (!e.key || !e.key.startsWith('3r-')) return;
      enhanceDashboard();
    });
  }

  // Wait for app to be visible (after login)
  function waitForApp() {
    const app = document.getElementById('app');
    if (!app) { setTimeout(waitForApp, 200); return; }
    const check = () => {
      if (app.style.display !== 'none' && getComputedStyle(app).display !== 'none') {
        init();
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }
})();
