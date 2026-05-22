/* ============================================================
   admin-equipe.js
   Restructure la section Équipe dans admin.html :
   - Ajoute un bouton "📷 Membres" sur chaque ligne du tableau
   - Ouvre un panneau pour gérer les photos de chaque groupe
   - CRUD complet : ajout nom + photo, suppression
   ============================================================ */
(function () {
  'use strict';

  /* ── On attend que FoyerDB et le DOM soient prêts ── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    if (typeof FoyerDB === 'undefined') return;
    injectStyles();
    injectModalHTML();
    injectMembersPanel();
    watchTeamTable();
    initModal();
  });

  /* ═══════════════════════════════════════════════
     STYLES INJECTÉS
  ═══════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('aeq-style')) return;
    const s = document.createElement('style');
    s.id = 'aeq-style';
    s.textContent = `
      /* Bouton membres dans la table */
      .btn-membres {
        display: inline-flex; align-items: center; gap: .3rem;
        padding: .3rem .7rem; font-size: .78rem; font-weight: 600;
        background: #e4f1f7; color: #256880; border: none;
        border-radius: 6px; cursor: pointer; transition: background .15s;
        white-space: nowrap;
      }
      .btn-membres:hover { background: #cce4f0; }
      .btn-membres.active { background: #256880; color: #fff; }

      /* Panneau membres sous le tableau */
      #members-panel {
        display: none;
        background: #fff;
        border: 1px solid #dce7ee;
        border-radius: 12px;
        margin-top: 1.5rem;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(18,45,65,.08);
      }
      #members-panel.visible { display: block; }

      .mp-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1rem 1.3rem;
        border-bottom: 1px solid #edf3f7;
        background: #f6f9fb;
      }
      .mp-head h3 { font-size: 1rem; font-weight: 700; color: #1a2530; margin: 0; }
      .mp-head .mp-count { font-size: .8rem; color: #8898a6; margin-top: .1rem; }
      .mp-close-btn {
        background: none; border: 1px solid #dce7ee; border-radius: 8px;
        padding: .3rem .7rem; font-size: .82rem; color: #4e5c69; cursor: pointer;
      }
      .mp-close-btn:hover { background: #f0f4f8; }

      .mp-body { padding: 1.3rem; }

      /* Formulaire ajout */
      .mp-add-form {
        background: #f6f9fb; border: 1px solid #edf3f7;
        border-radius: 10px; padding: 1.1rem 1.2rem; margin-bottom: 1.3rem;
      }
      .mp-add-form h4 {
        font-size: .85rem; font-weight: 700; color: #1a2530; margin: 0 0 .8rem;
      }
      .mp-form-row {
        display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; margin-bottom: .7rem;
      }
      .mp-fg label {
        display: block; font-size: .76rem; font-weight: 600;
        color: #4e5c69; margin-bottom: .25rem;
      }
      .mp-fg input {
        width: 100%; padding: .48rem .75rem;
        border: 1px solid #dce7ee; border-radius: 7px;
        font-size: .87rem; font-family: inherit; outline: none;
        transition: border-color .15s;
      }
      .mp-fg input:focus { border-color: #256880; }

      /* Upload photo */
      .mp-upload {
        position: relative; border: 2px dashed #dce7ee; border-radius: 9px;
        padding: .8rem 1rem; text-align: center; cursor: pointer;
        background: #fff; transition: all .15s; margin-bottom: .8rem;
        display: flex; align-items: center; gap: .9rem;
      }
      .mp-upload:hover, .mp-upload.drag { border-color: #256880; background: #f0f8fb; }
      .mp-upload input[type=file] {
        position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%;
      }
      .mp-upload-preview {
        width: 52px; height: 52px; border-radius: 50%;
        object-fit: cover; flex-shrink: 0;
        border: 2px solid #fff; box-shadow: 0 1px 6px rgba(18,45,65,.12);
        display: none;
      }
      .mp-upload-placeholder {
        font-size: .8rem; color: #8898a6; text-align: left;
      }
      .mp-upload-placeholder .ui { font-size: 1.3rem; margin-bottom: .2rem; }
      .mp-add-actions { display: flex; justify-content: flex-end; }
      .mp-add-btn {
        padding: .5rem 1.1rem; background: #256880; color: #fff;
        border: none; border-radius: 8px; font-size: .85rem; font-weight: 600;
        cursor: pointer; font-family: inherit;
        transition: opacity .15s;
      }
      .mp-add-btn:hover { opacity: .88; }

      /* Liste des membres */
      .mp-members-title {
        font-size: .85rem; font-weight: 700; color: #1a2530; margin-bottom: .7rem;
      }
      .mp-members-list { display: flex; flex-direction: column; gap: .55rem; }
      .mp-member-row {
        display: flex; align-items: center; gap: .8rem;
        padding: .6rem .9rem; background: #f6f9fb;
        border-radius: 9px; border: 1px solid #edf3f7;
      }
      .mp-member-photo {
        width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
        flex-shrink: 0; border: 2px solid #fff;
        box-shadow: 0 1px 6px rgba(18,45,65,.1);
      }
      .mp-member-avatar {
        width: 44px; height: 44px; border-radius: 50%;
        background: linear-gradient(135deg, #256880, #194e62);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.2rem; flex-shrink: 0;
      }
      .mp-member-info { flex: 1; }
      .mp-member-info strong { display: block; font-size: .87rem; color: #1a2530; }
      .mp-member-info em { display: block; font-size: .76rem; color: #8898a6; font-style: normal; }
      .mp-member-del {
        width: 28px; height: 28px; flex-shrink: 0;
        background: #fde8e8; border: none; border-radius: 7px; cursor: pointer;
        color: #d14444; font-size: .85rem; display: flex;
        align-items: center; justify-content: center;
        transition: background .15s;
      }
      .mp-member-del:hover { background: #f5bfbf; }
      .mp-no-members {
        text-align: center; padding: 1.5rem;
        color: #aab5be; font-size: .86rem; font-style: italic;
      }

      /* Toast propre au module */
      #aeq-toast {
        position: fixed; bottom: 1.5rem; right: 1.5rem;
        background: #1a2530; color: #fff;
        padding: .6rem 1.1rem; border-radius: 9px;
        font-size: .84rem; font-weight: 500; font-family: inherit;
        transform: translateY(60px); opacity: 0;
        transition: all .25s ease; z-index: 9999; pointer-events: none;
      }
      #aeq-toast.show { transform: none; opacity: 1; }
      #aeq-toast.ok { background: #3a8a52; }
      #aeq-toast.err { background: #d14444; }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════
     PANNEAU MEMBRES (injecté sous le tableau équipe)
  ═══════════════════════════════════════════════ */
  function injectMembersPanel() {
    if (document.getElementById('members-panel')) return;
    const teamPage = document.getElementById('page-team');
    if (!teamPage) return;

    const panel = document.createElement('div');
    panel.id = 'members-panel';
    panel.innerHTML = `
      <div class="mp-head">
        <div>
          <h3 id="mp-group-title">Groupe</h3>
          <div class="mp-count" id="mp-group-count"></div>
        </div>
        <button class="mp-close-btn" id="mp-close">✕ Fermer</button>
      </div>
      <div class="mp-body">
        <!-- Formulaire ajout -->
        <div class="mp-add-form">
          <h4>➕ Ajouter un professionnel</h4>
          <div class="mp-form-row">
            <div class="mp-fg">
              <label>Prénom Nom *</label>
              <input type="text" id="mp-new-name" placeholder="Marie Dupont">
            </div>
            <div class="mp-fg">
              <label>Fonction (optionnel)</label>
              <input type="text" id="mp-new-title" placeholder="Éducatrice spécialisée">
            </div>
          </div>
          <label style="display:block;font-size:.76rem;font-weight:600;color:#4e5c69;margin-bottom:.3rem">
            Photo (JPG/PNG · max 2 Mo · optionnel)
          </label>
          <div class="mp-upload" id="mp-upload-area">
            <input type="file" id="mp-photo-input" accept="image/*">
            <img class="mp-upload-preview" id="mp-photo-preview" alt="">
            <div class="mp-upload-placeholder" id="mp-upload-ph">
              <div class="ui">📷</div>
              <div>Glisser-déposer ou cliquer pour choisir</div>
            </div>
          </div>
          <div class="mp-add-actions">
            <button class="mp-add-btn" id="mp-btn-add">Ajouter</button>
          </div>
        </div>

        <!-- Liste -->
        <div class="mp-members-title">Professionnels enregistrés</div>
        <div class="mp-members-list" id="mp-members-list"></div>
      </div>
    `;
    teamPage.appendChild(panel);
    initPanel();
  }

  /* ═══════════════════════════════════════════════
     MODAL VIDE (placeholder pour compatibilité)
  ═══════════════════════════════════════════════ */
  function injectModalHTML() {
    if (document.getElementById('aeq-toast')) return;
    const t = document.createElement('div');
    t.id = 'aeq-toast';
    document.body.appendChild(t);
  }

  /* ═══════════════════════════════════════════════
     OBSERVER : Détecte quand le tableau équipe est rempli
  ═══════════════════════════════════════════════ */
  function watchTeamTable() {
    const tbody = document.getElementById('team-tbody');
    if (!tbody) {
      /* Si tbody n'existe pas encore, on attend */
      setTimeout(watchTeamTable, 300);
      return;
    }

    const obs = new MutationObserver(() => {
      addMembresButtons();
    });
    obs.observe(tbody, { childList: true });

    /* Si déjà peuplé */
    addMembresButtons();
  }

  /* ── Ajoute le bouton "📷 Membres" à chaque ligne ── */
  function addMembresButtons() {
    const tbody = document.getElementById('team-tbody');
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(tr => {
      if (tr.querySelector('.btn-membres')) return; /* déjà ajouté */
      const editBtn = tr.querySelector('[data-team-edit]');
      if (!editBtn) return;
      const teamId = editBtn.getAttribute('data-team-edit');
      const actTd = tr.querySelector('td:last-child');
      if (!actTd) return;

      const btn = document.createElement('button');
      btn.className = 'btn-membres';
      btn.setAttribute('data-group-id', teamId);
      btn.innerHTML = '📷 Membres';
      btn.style.marginRight = '.4rem';

      /* Insérer avant les autres boutons */
      actTd.insertBefore(btn, actTd.firstChild);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        /* Désactiver tous les autres */
        document.querySelectorAll('.btn-membres').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        openPanel(teamId);
      });
    });
  }

  /* ═══════════════════════════════════════════════
     LOGIQUE DU PANNEAU
  ═══════════════════════════════════════════════ */
  let curGroupId = null;
  let pendingPhoto = null;

  function openPanel(groupId) {
    curGroupId = groupId;
    pendingPhoto = null;
    resetUpload();

    const item = FoyerDB.getTeamItem ? FoyerDB.getTeamItem(groupId) : null;
    if (!item) return;

    document.getElementById('mp-group-title').textContent = item.role || '';
    document.getElementById('mp-group-count').textContent = item.count ? '— ' + item.count : '';
    document.getElementById('mp-new-name').value = '';
    document.getElementById('mp-new-title').value = '';

    renderMembersList(item);

    const panel = document.getElementById('members-panel');
    panel.classList.add('visible');
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  function initPanel() {
    /* Fermer le panneau */
    document.getElementById('mp-close').addEventListener('click', function () {
      document.getElementById('members-panel').classList.remove('visible');
      document.querySelectorAll('.btn-membres').forEach(b => b.classList.remove('active'));
      curGroupId = null;
    });

    /* Upload photo */
    const photoInput = document.getElementById('mp-photo-input');
    const dropArea = document.getElementById('mp-upload-area');

    photoInput.addEventListener('change', function () { handleFile(this.files[0]); });
    dropArea.addEventListener('dragover', function (e) {
      e.preventDefault(); this.classList.add('drag');
    });
    dropArea.addEventListener('dragleave', function () { this.classList.remove('drag'); });
    dropArea.addEventListener('drop', function (e) {
      e.preventDefault(); this.classList.remove('drag');
      handleFile(e.dataTransfer.files[0]);
    });

    /* Ajouter membre */
    document.getElementById('mp-btn-add').addEventListener('click', addMember);
    document.getElementById('mp-new-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addMember();
    });
  }

  function renderMembersList(item) {
    const list = document.getElementById('mp-members-list');
    const members = Array.isArray(item.members) ? item.members : [];

    if (!members.length) {
      list.innerHTML = '<div class="mp-no-members">Aucun professionnel enregistré pour ce groupe.</div>';
      return;
    }

    list.innerHTML = members.map(function (m) {
      const photo = m.photoData
        ? `<img src="${m.photoData}" class="mp-member-photo" alt="${esc(m.name)}">`
        : `<div class="mp-member-avatar">${esc(item.icon || '👥')}</div>`;
      return `
        <div class="mp-member-row" data-member-id="${esc(m.id)}">
          ${photo}
          <div class="mp-member-info">
            <strong>${esc(m.name || '')}</strong>
            <em>${esc(m.title || '')}</em>
          </div>
          <button class="mp-member-del" data-del-id="${esc(m.id)}" title="Supprimer">🗑</button>
        </div>`;
    }).join('');

    /* Événements suppression */
    list.querySelectorAll('.mp-member-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteMember(btn.getAttribute('data-del-id'));
      });
    });
  }

  function addMember() {
    if (!curGroupId) return;
    var name = document.getElementById('mp-new-name').value.trim();
    var title = document.getElementById('mp-new-title').value.trim();
    if (!name) { showToast('Le nom est obligatoire.', 'err'); return; }

    var item = FoyerDB.getTeamItem ? FoyerDB.getTeamItem(curGroupId) : null;
    if (!item) return;
    if (!Array.isArray(item.members)) item.members = [];

    item.members.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      title: title,
      photoData: pendingPhoto || ''
    });

    FoyerDB.saveTeamItem(item);
    document.getElementById('mp-new-name').value = '';
    document.getElementById('mp-new-title').value = '';
    resetUpload();
    renderMembersList(item);
    showToast(name + ' ajouté(e) ✓', 'ok');
  }

  function deleteMember(memberId) {
    if (!curGroupId || !memberId) return;
    if (!confirm('Supprimer ce professionnel ?')) return;
    var item = FoyerDB.getTeamItem ? FoyerDB.getTeamItem(curGroupId) : null;
    if (!item || !Array.isArray(item.members)) return;
    var name = '';
    item.members.forEach(function (m) { if (m.id === memberId) name = m.name; });
    item.members = item.members.filter(function (m) { return m.id !== memberId; });
    FoyerDB.saveTeamItem(item);
    renderMembersList(item);
    showToast(name + ' supprimé(e)', 'ok');
  }

  /* ── Gestion upload photo ── */
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image trop volumineuse (max 2 Mo)', 'err'); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      pendingPhoto = e.target.result;
      var preview = document.getElementById('mp-photo-preview');
      var ph = document.getElementById('mp-upload-ph');
      preview.src = pendingPhoto;
      preview.style.display = 'block';
      ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function resetUpload() {
    pendingPhoto = null;
    var input = document.getElementById('mp-photo-input');
    var preview = document.getElementById('mp-photo-preview');
    var ph = document.getElementById('mp-upload-ph');
    if (input) input.value = '';
    if (preview) { preview.style.display = 'none'; preview.src = ''; }
    if (ph) ph.style.display = 'block';
  }

  /* ── Toast ── */
  var toastTimer;
  function showToast(msg, type) {
    var t = document.getElementById('aeq-toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'show' + (type ? ' ' + type : '');
    t.id = 'aeq-toast';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; t.id = 'aeq-toast'; }, 3000);
  }

  /* ── Escape HTML ── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── Re-patcher si renderTeam est rappelé (navigation) ── */
  var _orig = window.renderTeam;
  if (typeof _orig === 'function') {
    window.renderTeam = function () {
      _orig.apply(this, arguments);
      setTimeout(addMembresButtons, 50);
    };
  }

  /* Aussi écouter les clics de navigation vers la page équipe */
  document.addEventListener('click', function (e) {
    var nav = e.target.closest('[data-page="team"]');
    if (nav) setTimeout(addMembresButtons, 150);
  });

})();
