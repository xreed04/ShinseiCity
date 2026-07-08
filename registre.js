/* ===================================================
   Registre du Murmure — logique
   Hébergé sur GitHub (xreed04/ShinseiCity), chargé via
   <script src="https://xreed04.github.io/ShinseiCity/registre.js">

   Va chercher la page du sous-forum "Rumeurs" (même domaine,
   donc fetch() fonctionne sans blocage CORS), en extrait les
   sujets qui suivent la convention "Rumeur - MRM-XXXX", et les
   affiche. Aucune donnée n'est stockée : tout est recalculé à
   chaque chargement de page à partir du forum lui-même.
=================================================== */
(function () {

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fetchSourceLabel(topicUrl) {
    return fetch(topicUrl, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');

        var marker = doc.querySelector('[data-mrm-source]');
        if (marker) {
          var val = marker.getAttribute('data-mrm-source');
          if (val) return val;
        }

        var blocks = doc.querySelectorAll('.postbody .content, .content');
        for (var i = 0; i < blocks.length; i++) {
          var t = blocks[i].textContent || '';
          var m = t.match(/Source\s*:\s*([^\n.]{2,60})/i);
          if (m) {
            var raw = m[1].toLowerCase();
            if (raw.indexOf('anonyme') !== -1) return 'Anonyme';
            if (raw.indexOf('témoin') !== -1 || raw.indexOf('temoin') !== -1) return 'Témoin direct';
            if (raw.indexOf('ouï') !== -1 || raw.indexOf('oui-dire') !== -1) return 'Ouï-dire';
          }
        }
        return null;
      })
      .catch(function () { return null; });
  }

  function initOne(root) {
    if (root.getAttribute('data-mr-init')) return;
    root.setAttribute('data-mr-init', '1');

    var listEl = root.querySelector('.mr-list');
    var forumUrl = root.getAttribute('data-forum-url');
    var max = parseInt(root.getAttribute('data-max'), 10) || 6;

    if (!listEl) {
      console.warn('[Registre du Murmure] .mr-list introuvable — le widget ne peut pas s\'initialiser.');
      return;
    }
    if (!forumUrl) {
      listEl.innerHTML = '<div class="mr-error">URL du sous-forum manquante (attribut data-forum-url sur #mr-registre).</div>';
      return;
    }

    fetch(forumUrl, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');

        var candidates = doc.querySelectorAll('.ftopic .fttitle, .ftopic .ftinfo a.fttitle, .ftopic a.fttitle');
        var items = [];
        var seenHrefs = {};

        for (var i = 0; i < candidates.length; i++) {
          var el = candidates[i];
          var a = (el.tagName === 'A') ? el : el.querySelector('a');
          if (!a) continue;

          var text = (a.textContent || '').trim();
          var m = text.match(/MRM-\d+/i);
          if (!m) continue;

          var href = a.getAttribute('href') || '';
          if (href && href.indexOf('http') !== 0) {
            try {
              var base = new URL(forumUrl);
              href = base.origin + (href.indexOf('/') === 0 ? href : '/' + href);
            } catch (e) { /* on garde href tel quel si ça échoue */ }
          }
          if (seenHrefs[href]) continue;
          seenHrefs[href] = true;

          items.push({
            code: m[0].toUpperCase(),
            href: href
          });

          if (items.length >= max) break;
        }

        if (!items.length) {
          listEl.innerHTML = '<div class="mr-empty">Aucun murmure enregistré pour le moment.</div>';
          console.warn('[Registre du Murmure] Aucun sujet au format "Rumeur - MRM-XXXX" trouvé. Si des rumeurs existent bien sur le forum, vérifiez que les sélecteurs .ftopic/.fttitle correspondent toujours à la structure réelle de la page (elle a pu changer depuis).');
          return;
        }

        var sourceFetches = items.map(function (it) {
          return fetchSourceLabel(it.href).then(function (src) {
            it.source = src;
            return it;
          });
        });

        return Promise.all(sourceFetches);
      })
      .then(function (finalItems) {
        if (!finalItems) return;

        var htmlOut = '';
        for (var j = 0; j < finalItems.length; j++) {
          var it = finalItems[j];
          htmlOut += '<a class="mr-item" href="' + escapeHtml(it.href) + '">'
            + '<span class="mr-item-code">' + escapeHtml(it.code) + '</span>'
            + (it.source ? '<span class="mr-item-meta">Rapporté par ' + escapeHtml(it.source) + '</span>' : '')
            + '</a>';
        }
        listEl.innerHTML = htmlOut;
      })
      .catch(function (err) {
        listEl.innerHTML = '<div class="mr-error">Impossible de récupérer le registre pour le moment.</div>';
        console.warn('[Registre du Murmure] Erreur lors de la récupération du sous-forum :', err);
      });
  }

  function scanAndInit() {
    var roots = document.querySelectorAll('[id="mr-registre"]');
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
