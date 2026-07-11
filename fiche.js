/* ===================================================
   Fiche de présentation — logique
   Hébergé sur GitHub (xreed04/ShinseiCity), chargé via
   <script src="https://xreed04.github.io/ShinseiCity/fiche.js">

   Génère une fiche de personnage entièrement en styles
   inline (indépendante du CSS du formulaire), basée sur
   les variables du thème du forum : s'adapte au clair/
   sombre automatiquement, où qu'elle soit collée.
=================================================== */
(function () {

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function nl2br(str) {
    return str.replace(/\n/g, '<br>');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function fieldRow(label, value) {
    if (!value) return '';
    return '<div style="margin-bottom:1.1em;padding-bottom:.9em;border-bottom:var(--border1);">'
      + '<div style="font:700 0.68rem var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin-bottom:.35em;">' + label + '</div>'
      + '<div style="font-size:0.95rem;color:var(--subtitle);">' + value + '</div>'
      + '</div>';
  }

  function archiveParagraph(text) {
    if (!text) return '';
    return '<p style="margin:0 0 1.3em;font-size:0.95rem;line-height:1.7;color:var(--text);text-align:justify;">'
      + '<span style="color:var(--accent2);">&larr;</span> ' + nl2br(text) + ' <span style="color:var(--accent2);">&rarr;</span>'
      + '</p>';
  }

  function buildSheetHtml(gen) {
    var photoHtml = gen.photo
      ? '<div style="line-height:0;"><img src="' + escapeHtml(gen.photo) + '" alt="" style="display:block;width:100%;height:auto;filter:var(--gm-filter);"></div>'
      : '';

    var quoteHtml = gen.quote
      ? '<div style="padding:1.2em 2.2em;text-align:center;font-style:italic;font-size:1.02rem;color:var(--subtitle);border-bottom:var(--border1);">&laquo;&nbsp;' + escapeHtml(gen.quote) + '&nbsp;&raquo;</div>'
      : '';

    var apparenceHtml = gen.apparence
      ? '<div style="border-left:3px solid var(--accent1);padding-left:1em;margin-bottom:1.6em;">'
        + '<div style="font:700 0.72rem var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--accent1);margin-bottom:.5em;">Apparence</div>'
        + '<div style="font-size:0.95rem;line-height:1.65;color:var(--text);white-space:pre-wrap;">' + escapeHtml(gen.apparence) + '</div>'
        + '</div>'
      : '';

    var psychologieHtml = gen.psychologie
      ? '<div style="border-left:3px solid var(--accent1);padding-left:1em;">'
        + '<div style="font:700 0.72rem var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--accent1);margin-bottom:.5em;">Psychologie</div>'
        + '<div style="font-size:0.95rem;line-height:1.65;color:var(--text);white-space:pre-wrap;">' + escapeHtml(gen.psychologie) + '</div>'
        + '</div>'
      : '';

    var champs = fieldRow('Nom complet', escapeHtml(gen.nomcomplet))
      + fieldRow('&Acirc;ge', escapeHtml(gen.age))
      + fieldRow('Genre &amp; orientation', escapeHtml(gen.genre))
      + fieldRow('Origine', escapeHtml(gen.origine))
      + fieldRow('M&eacute;tier', escapeHtml(gen.metier))
      + fieldRow('Groupe / affinit&eacute;', escapeHtml(gen.groupe));

    var archives = archiveParagraph(gen.histoire1)
      + archiveParagraph(gen.histoire2)
      + archiveParagraph(gen.histoire3);

    var horsJeuHtml = gen.horsjeu
      ? '<div style="padding:1.4em 2.2em 2em;text-align:center;color:var(--text2);font-size:0.92rem;line-height:1.6;">'
        + '<span style="color:var(--accent2);">&larr;</span> ' + nl2br(escapeHtml(gen.horsjeu)) + ' <span style="color:var(--accent2);">&rarr;</span>'
        + '</div>'
      : '';

    var year = new Date().getFullYear();

    return '<div style="max-width:820px;margin:2em auto;background:var(--cuerpo);'
      + 'border:1px solid color-mix(in srgb, var(--accent1) 30%, var(--border1-c));'
      + 'border-radius:2px;overflow:hidden;font-family:var(--f-body,sans-serif);color:var(--text);">'

      + '<div style="height:2px;background:linear-gradient(to right, var(--accent2), var(--accent1), var(--accent2));"></div>'

      + photoHtml

      + '<div style="padding:1.8em 2.2em 1.4em;text-align:center;border-bottom:var(--border1);">'
      + '<h1 style="margin:0 0 .5em;font:700 2rem var(--f-titles,sans-serif);text-transform:uppercase;letter-spacing:.02em;color:var(--title);line-height:1.2;">' + escapeHtml(gen.name) + '</h1>'
      + (gen.date ? '<div style="font:700 0.72rem var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--text2);">Contrat sign&eacute; le&nbsp;: <span style="color:var(--accent1);">' + escapeHtml(gen.date) + '</span></div>' : '')
      + '</div>'

      + quoteHtml

      + (apparenceHtml || psychologieHtml || champs
        ? '<div style="padding:1.6em 2.2em 0.4em;text-align:center;">'
          + '<h2 style="margin:0;font:700 1.35rem var(--f-titles,sans-serif);text-transform:uppercase;letter-spacing:.01em;color:var(--title);">Informations g&eacute;n&eacute;rales</h2>'
          + '<div style="font-size:0.78rem;font-style:italic;color:var(--text3);margin-top:.3em;">dossier officiel</div>'
          + '</div>'
          + '<div style="padding:1.3em 2.2em 1.8em;display:flex;gap:2em;flex-wrap:wrap;">'
          + '<div style="flex:1 1 300px;min-width:260px;">' + apparenceHtml + psychologieHtml + '</div>'
          + '<div style="flex:1 1 220px;min-width:200px;">' + champs + '</div>'
          + '</div>'
        : '')

      + (archives
        ? '<div style="padding:1.6em 2.2em 0.4em;text-align:center;border-top:var(--border1);">'
          + '<h2 style="margin:0;font:700 1.35rem var(--f-titles,sans-serif);text-transform:uppercase;letter-spacing:.01em;color:var(--title);">Archives personnelles</h2>'
          + '<div style="font-size:0.78rem;font-style:italic;color:var(--text3);margin-top:.3em;">ce que la ville sait de vous</div>'
          + '</div>'
          + '<div style="padding:1.3em 2.2em 0.5em;">' + archives + '</div>'
        : '')

      + (gen.horsjeu
        ? '<div style="padding:1.6em 2.2em 0.2em;text-align:center;border-top:var(--border1);">'
          + '<h2 style="margin:0;font:700 1.35rem var(--f-titles,sans-serif);text-transform:uppercase;letter-spacing:.01em;color:var(--title);">Hors jeu</h2>'
          + '<div style="font-size:0.78rem;font-style:italic;color:var(--text3);margin-top:.3em;">infos joueur</div>'
          + '</div>'
        : '')
      + horsJeuHtml

      + '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5em;padding:1em 2.2em;border-top:var(--border1);font:700 0.68rem var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--text3);">'
      + '<span>Shinsei City &mdash; ' + year + '</span>'
      + '<span>Dossier r&eacute;sident</span>'
      + '</div>'

      + '</div>';
  }

  function initOne(root) {
    if (root.getAttribute('data-cf-init')) return;
    root.setAttribute('data-cf-init', '1');

    var sendBtn = root.querySelector('[id="cf-send"]');
    var editBtn = root.querySelector('[id="cf-edit"]');
    var copyBtn = root.querySelector('[id="cf-copy"]');
    var bodyBox = root.querySelector('[id="cf-body"]');
    var previewWrap = root.querySelector('[id="cf-preview-wrap"]');
    var previewEl = root.querySelector('[id="cf-preview"]');
    var copiedEl = root.querySelector('[id="cf-copied"]');
    var nameEl = root.querySelector('[id="cf-name"]');

    var required = {
      'cf-send': sendBtn, 'cf-edit': editBtn, 'cf-copy': copyBtn,
      'cf-body': bodyBox, 'cf-preview-wrap': previewWrap, 'cf-preview': previewEl,
      'cf-copied': copiedEl, 'cf-name': nameEl
    };
    for (var key in required) {
      if (!required[key]) {
        console.warn('[Fiche de présentation] élément introuvable dans le DOM : #' + key + ' — le widget ne peut pas s\'initialiser.');
        return;
      }
    }

    function val(id) {
      var el = root.querySelector('[id="' + id + '"]');
      return el ? el.value.trim() : '';
    }

    var lastHtml = null;

    sendBtn.addEventListener('click', function () {
      var name = nameEl.value.trim();
      if (!name) {
        nameEl.style.borderColor = 'var(--accent1)';
        nameEl.placeholder = 'Un personnage a besoin d\'un nom.';
        nameEl.focus();
        return;
      }
      nameEl.style.borderColor = '';

      var gen = {
        photo: val('cf-photo'),
        name: name,
        date: formatDate(val('cf-date')),
        quote: val('cf-quote'),
        apparence: val('cf-apparence'),
        psychologie: val('cf-psychologie'),
        nomcomplet: val('cf-nomcomplet'),
        age: val('cf-age'),
        genre: val('cf-genre'),
        origine: val('cf-origine'),
        metier: val('cf-metier'),
        groupe: val('cf-groupe'),
        histoire1: val('cf-histoire1'),
        histoire2: val('cf-histoire2'),
        histoire3: val('cf-histoire3'),
        horsjeu: val('cf-horsjeu')
      };

      lastHtml = buildSheetHtml(gen);
      previewEl.innerHTML = lastHtml;

      bodyBox.style.display = 'none';
      previewWrap.style.display = 'block';
    });

    editBtn.addEventListener('click', function () {
      previewWrap.style.display = 'none';
      bodyBox.style.display = 'block';
    });

    copyBtn.addEventListener('click', function () {
      if (!lastHtml) return;
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(lastHtml).then(function () {
        copiedEl.style.display = 'inline';
        setTimeout(function () {
          copiedEl.style.display = 'none';
        }, 1800);
      }).catch(function () { /* silencieux : copie manuelle toujours possible depuis l'aperçu */ });
    });
  }

  function scanAndInit() {
    var roots = document.querySelectorAll('[id="cf-root"]');
    for (var i = 0; i < roots.length; i++) {
      initOne(roots[i]);
    }
  }

  if ('MutationObserver' in window) {
    var observer = new MutationObserver(scanAndInit);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInit);
  } else {
    scanAndInit();
  }

  setTimeout(scanAndInit, 1000);
  setTimeout(scanAndInit, 3000);

})();
