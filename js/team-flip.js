/* ============================================================
   team-flip.js
   Cartes équipe qui se retournent avec diaporama des photos.
   À inclure dans foyer-accueil.html / saj-accueil.html /
   savs-accueil.html / emp-accueil.html (et equipe.html).
   Détecte automatiquement le service via l'URL.
   ============================================================ */
(function () {
  'use strict';

  /* ── Détection du service via l'URL ── */
  function detectService() {
    var p = (window.location.pathname || '').toLowerCase();
    if (p.indexOf('foyer-accueil') !== -1) return 'foyer';
    if (p.indexOf('saj-accueil')   !== -1) return 'saj';
    if (p.indexOf('savs-accueil')  !== -1) return 'savs';
    if (p.indexOf('emp-accueil')   !== -1) return 'emp';
    return null; /* equipe.html → tous services */
  }

  /* ── Échappement HTML ── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── CSS injecté une seule fois ── */
  function injectStyles() {
    if (document.getElementById('tf-style')) return;
    var s = document.createElement('style');
    s.id = 'tf-style';
    s.textContent = `
      .team-card-flip {
        perspective: 1200px;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        min-height: 320px;
        cursor: pointer;
      }
      .team-card-flip:hover .face-front { transform: translateY(-5px); }
      .flip-inner {
        position: relative;
        width: 100%; height: 100%; min-height: 320px;
        transition: transform 0.7s cubic-bezier(.4, 0, .2, 1);
        transform-style: preserve-3d;
      }
      .team-card-flip.is-flipped .flip-inner { transform: rotateY(180deg); }
      .face {
        position: absolute; inset: 0; width: 100%; height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border-radius: var(--radius, 14px);
        background: #fff;
        border: 1px solid var(--border-soft, #edf3f7);
        box-shadow: 0 2px 8px rgba(18,45,65,.07);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .face-front {
        padding: 1.8rem 1.4rem; text-align: center;
        justify-content: center; align-items: center;
        transition: transform .25s, box-shadow .25s, border-color .25s;
      }
      .team-card-flip:hover .face-front {
        border-color: var(--primary, #256880);
        box-shadow: 0 12px 32px rgba(37,104,128,.18);
      }
      .face-front .team-avatar {
        width: 64px; height: 64px;
        background: linear-gradient(135deg, var(--primary, #256880), var(--primary-dark, #194e62));
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem; color: white;
        margin: 0 auto 1rem;
      }
      .face-front .team-count {
        display: inline-block;
        background: var(--accent, #d9924a); color: white;
        padding: .2rem .7rem; border-radius: 20px;
        font-size: .83rem; font-weight: 600;
        margin-bottom: .5rem;
      }
      .face-front .team-role {
        color: var(--primary, #256880); font-weight: 700;
        font-size: 1rem; margin-bottom: .3rem;
      }
      .face-front p {
        font-size: .87rem; color: var(--text-light, #4e5c69);
        line-height: 1.5;
      }
      .face-front .flip-hint {
        margin-top: auto; padding-top: .9rem;
        font-size: .73rem; font-weight: 700; color: #fff;
        background: var(--primary, #256880);
        padding: .3rem .8rem; border-radius: 18px;
        align-self: center;
        box-shadow: 0 2px 6px rgba(37,104,128,.25);
      }
      .face-back {
        transform: rotateY(180deg);
        background: linear-gradient(160deg, #f6f9fb 0%, #ecf3f7 100%);
        padding: 1.3rem 1.1rem 1.1rem; text-align: center;
      }
      .back-top {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: .6rem;
      }
      .back-close {
        width: 30px; height: 30px;
        border: none; border-radius: 50%;
        background: #fff; color: #4e5c69;
        cursor: pointer; font-size: .9rem;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 4px rgba(18,45,65,.1);
        transition: background .15s;
      }
      .back-close:hover { background: var(--primary-light, #e4f1f7); color: var(--primary, #256880); }
      .back-counter {
        font-size: .72rem; font-weight: 600;
        color: var(--primary, #256880); background: #fff;
        padding: .2rem .55rem; border-radius: 12px;
        box-shadow: 0 1px 3px rgba(18,45,65,.08);
      }
      .back-body {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: .5rem .3rem .4rem;
      }
      .back-photo {
        width: 110px; height: 110px; border-radius: 50%;
        object-fit: cover; border: 4px solid #fff;
        box-shadow: 0 4px 14px rgba(18,45,65,.18);
        margin-bottom: .7rem;
      }
      .back-photo-placeholder {
        width: 110px; height: 110px; border-radius: 50%;
        background: linear-gradient(135deg, var(--primary, #256880), var(--primary-dark, #194e62));
        display: flex; align-items: center; justify-content: center;
        font-size: 2.5rem; color: white;
        margin-bottom: .7rem; border: 4px solid #fff;
        box-shadow: 0 4px 14px rgba(18,45,65,.18);
      }
      .back-name {
        font-weight: 700; font-size: .98rem;
        color: #1a2530; margin-bottom: .15rem; line-height: 1.25;
      }
      .back-title {
        font-size: .82rem; color: #4e5c69; line-height: 1.35;
      }
      .back-empty { text-align: center; padding: 1rem .5rem; }
      .back-empty .be-icon { font-size: 2.6rem; margin-bottom: .5rem; }
      .back-empty .be-title {
        font-weight: 700; color: var(--primary, #256880);
        font-size: 1rem; margin-bottom: .3rem;
      }
      .back-empty .be-text {
        font-size: .82rem; color: #8898a6; line-height: 1.4;
      }
      .back-nav {
        display: flex; justify-content: space-between;
        margin-top: .4rem; gap: .6rem;
      }
      .nav-arrow {
        width: 38px; height: 38px;
        border: none; border-radius: 50%;
        background: var(--primary, #256880); color: #fff;
        cursor: pointer; font-size: 1rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(37,104,128,.28);
        transition: transform .15s, background .15s;
      }
      .nav-arrow:hover { background: var(--primary-dark, #194e62); transform: scale(1.08); }
      .nav-arrow:active { transform: scale(.96); }
      .team-card-flip.is-flipped:hover .face-front { transform: none; }
    `;
    document.head.appendChild(s);
  }

  /* ── État (index courant des diaporamas) ── */
  window.flipState = window.flipState || {};

  /* ── Actions globales (utilisées via onclick=) ── */
  window.flipCard = function (teamId, event) {
    if (event) event.stopPropagation();
    var card = document.querySelector('.team-card-flip[data-team-id="' + teamId + '"]');
    if (!card) return;
    card.classList.add('is-flipped');
    window.flipState[teamId] = 0;
    renderBack(teamId);
  };
  window.flipBack = function (teamId, event) {
    if (event) event.stopPropagation();
    var card = document.querySelector('.team-card-flip[data-team-id="' + teamId + '"]');
    if (card) card.classList.remove('is-flipped');
  };
  window.flipNext = function (teamId, event) {
    if (event) event.stopPropagation();
    var item = FoyerDB.getTeamItem(teamId);
    if (!item) return;
    var members = Array.isArray(item.members) ? item.members : [];
    if (!members.length) return;
    var idx = window.flipState[teamId] || 0;
    window.flipState[teamId] = (idx + 1) % members.length;
    renderBack(teamId);
  };
  window.flipPrev = function (teamId, event) {
    if (event) event.stopPropagation();
    var item = FoyerDB.getTeamItem(teamId);
    if (!item) return;
    var members = Array.isArray(item.members) ? item.members : [];
    if (!members.length) return;
    var idx = window.flipState[teamId] || 0;
    window.flipState[teamId] = (idx - 1 + members.length) % members.length;
    renderBack(teamId);
  };

  /* ── Rendu du verso ── */
  function renderBack(teamId) {
    if (typeof FoyerDB === 'undefined') return;
    var item = FoyerDB.getTeamItem(teamId);
    if (!item) return;
    var members = Array.isArray(item.members) ? item.members : [];
    var card = document.querySelector('.team-card-flip[data-team-id="' + teamId + '"]');
    if (!card) return;
    var back = card.querySelector('.face-back');
    if (!back) return;

    var html = '<div class="back-top">' +
      '<button class="back-close" onclick="window.flipBack(\'' + teamId + '\', event)" aria-label="Retour">↩</button>';
    if (members.length > 0) {
      var idx = window.flipState[teamId] || 0;
      html += '<div class="back-counter">' + (idx + 1) + ' / ' + members.length + '</div>';
    } else {
      html += '<div></div>';
    }
    html += '</div>';

    if (members.length === 0) {
      html += '<div class="back-body">' +
        '<div class="back-empty">' +
          '<div class="be-icon">📷</div>' +
          '<div class="be-title">Photos à venir</div>' +
          '<div class="be-text">Les photos de cette équipe<br>seront bientôt ajoutées.</div>' +
        '</div></div>';
    } else {
      var i = window.flipState[teamId] || 0;
      var m = members[i];
      var photo = m.photoData
        ? '<img src="' + m.photoData + '" alt="' + esc(m.name) + '" class="back-photo">'
        : '<div class="back-photo-placeholder">' + esc(item.icon || '👥') + '</div>';
      html += '<div class="back-body">' + photo +
        '<div class="back-name">' + esc(m.name || '') + '</div>' +
        '<div class="back-title">' + esc(m.title || item.role || '') + '</div>' +
      '</div>';

      if (members.length > 1) {
        html += '<div class="back-nav">' +
          '<button class="nav-arrow" onclick="window.flipPrev(\'' + teamId + '\', event)" aria-label="Précédent">◀</button>' +
          '<button class="nav-arrow" onclick="window.flipNext(\'' + teamId + '\', event)" aria-label="Suivant">▶</button>' +
        '</div>';
      }
    }
    back.innerHTML = html;
  }

  /* ── Rendu de toutes les cartes (recto vide pour le verso) ── */
  function renderFlipCards() {
    if (typeof FoyerDB === 'undefined') return;
    var grid = document.getElementById('team-list');
    if (!grid) return;

    var svc = detectService();
    var opts = { published: true };
    if (svc) opts.service = svc;

    var items = FoyerDB.getTeam(opts);
    if (!items.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);">Composition de l\'équipe en cours de mise à jour.</p>';
      return;
    }

    grid.innerHTML = items.map(function (t) {
      var nb = Array.isArray(t.members) ? t.members.length : 0;
      var hint = nb > 0
        ? '👆 Voir les ' + nb + ' photo' + (nb > 1 ? 's' : '')
        : '👆 Cliquer pour voir';
      return '<article class="team-card-flip" data-team-id="' + esc(t.id) + '"' +
        ' onclick="window.flipCard(\'' + esc(t.id) + '\', event)">' +
        '<div class="flip-inner">' +
          '<div class="face face-front">' +
            '<div class="team-avatar">' + esc(t.icon || '👥') + '</div>' +
            (t.count ? '<span class="team-count">' + esc(t.count) + '</span>' : '') +
            '<div class="team-role">' + esc(t.role || '') + '</div>' +
            (t.description ? '<p>' + esc(t.description) + '</p>' : '') +
            '<span class="flip-hint">' + hint + '</span>' +
          '</div>' +
          '<div class="face face-back"></div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ── Hijacker l'éventuel renderTeam existant ──
     Si la page existante a déjà rendu des .team-card,
     on les remplace par notre version flip. */
  var rendering = false;
  function setupAutoReplace() {
    var grid = document.getElementById('team-list');
    if (!grid) {
      setTimeout(setupAutoReplace, 200);
      return;
    }
    var obs = new MutationObserver(function () {
      if (rendering) return;
      /* Déjà notre version ? on ne touche pas */
      if (grid.querySelector('.team-card-flip')) return;
      /* Sinon on remplace */
      rendering = true;
      renderFlipCards();
      setTimeout(function () { rendering = false; }, 100);
    });
    obs.observe(grid, { childList: true });

    /* Premier rendu */
    rendering = true;
    renderFlipCards();
    setTimeout(function () { rendering = false; }, 100);
  }

  /* ── Init ── */
  function init() {
    injectStyles();
    setupAutoReplace();

    /* Re-render sur évènements externes */
    window.addEventListener('storage', function (e) {
      if (typeof FoyerDB !== 'undefined' && FoyerDB.KEYS && e.key === FoyerDB.KEYS.team) {
        rendering = true;
        renderFlipCards();
        setTimeout(function () { rendering = false; }, 100);
      }
    });
    window.addEventListener('focus', function () {
      rendering = true;
      renderFlipCards();
      setTimeout(function () { rendering = false; }, 100);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        rendering = true;
        renderFlipCards();
        setTimeout(function () { rendering = false; }, 100);
      }
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
