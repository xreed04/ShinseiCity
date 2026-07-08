/* ===================================================
   Réseau du Murmure — logique
   Hébergé sur GitHub (xreed04/ShinseiCity), chargé via
   <script src="https://xreed04.github.io/ShinseiCity/rumeurs.js">
   sur la page ForumActif concernée.
=================================================== */
(function () {

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildTractHtml(gen) {
    var textHtml = escapeHtml(gen.text).replace(/\n/g, '<br>');
    var srcHtml = escapeHtml(gen.srcLabel);
    var srcTypeHtml = escapeHtml(gen.src || '');
    var catHtml = escapeHtml(gen.cat);
    var propHtml = escapeHtml(gen.prop);
    var idHtml = escapeHtml(gen.id);
    var credHtml = gen.cred ? escapeHtml(gen.cred) : null;
    var timeHtml = escapeHtml(gen.timestamp);

    return '<div style="max-width:520px;margin:1em auto;background:var(--dbckg1);'
      + 'border:1px solid color-mix(in srgb, var(--accent1) 35%, var(--border1-c));'
      + 'border-radius:2px;overflow:hidden;font-family:var(--f-body,sans-serif);color:var(--text);">'
      + '<div style="height:3px;background:linear-gradient(to right, var(--accent2), var(--accent1), var(--accent2));"></div>'
      + '<div style="padding:1.3em 1.5em 1.1em;">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:1em;margin-bottom:1.1em;">'
      + '<span style="display:flex;align-items:center;gap:.5em;font:700 0.68rem var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--accent1);">'
      + '<span style="width:6px;height:6px;border-radius:50%;background:var(--accent1);flex-shrink:0;"></span>'
      + 'Réseau du Murmure</span>'
      + '<span style="font:700 0.62rem var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase;'
      + 'padding:.3em .7em;border:1px solid color-mix(in srgb, var(--accent2) 55%, var(--border1-c));'
      + 'color:var(--subtitle);border-radius:2px;white-space:nowrap;">' + catHtml + '</span>'
      + '</div>'
      + '<div style="font:600 0.7rem var(--f-mono,monospace);letter-spacing:.03em;color:var(--text3);margin-bottom:1em;">Rumeur datant du : ' + timeHtml + '</div>'
      + '<div style="font-size:0.98rem;line-height:1.6;color:var(--subtitle);white-space:pre-wrap;margin-bottom:1em;">' + textHtml + '</div>'
      + '<div data-mrm-source="' + srcTypeHtml + '" style="font-size:0.82rem;font-style:italic;color:var(--text2);margin-bottom:1.1em;">' + srcHtml + '</div>'
      + '<div style="border-top:1px dashed color-mix(in srgb, var(--accent2) 40%, var(--border1-c));padding-top:.8em;'
      + 'display:flex;flex-wrap:wrap;gap:.4em 1em;font:700 0.66rem var(--f-mono,monospace);text-transform:uppercase;letter-spacing:.03em;">'
      + '<span style="color:var(--text2);">Propagation : <b style="color:var(--accent1);">' + propHtml + '</b></span>'
      + (credHtml ? '<span style="color:var(--text2);">Crédibilité : <b style="color:var(--accent1);">' + credHtml + '</b></span>' : '')
      + '<span style="color:var(--text2);">Réf. : <b style="color:var(--accent1);">' + idHtml + '</b></span>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  function initOne(root) {
    if (root.getAttribute('data-rm-init')) return;
    root.setAttribute('data-rm-init', '1');

    var clockEl = root.querySelector('[id="rm-clock"]');
    var sendBtn = root.querySelector('[id="rm-send"]');
    var copyHtmlBtn = root.querySelector('[id="rm-copy-html"]');
    var resetBtn = root.querySelector('[id="rm-reset"]');
    var scanBox = root.querySelector('[id="rm-scan"]');
    var resultBox = root.querySelector('[id="rm-result"]');
    var bodyBox = root.querySelector('[id="rm-body"]');
    var scanTxt = root.querySelector('[id="rm-scan-txt"]');
    var textEl = root.querySelector('[id="rm-text"]');
    var catEl = root.querySelector('[id="rm-cat"]');
    var srcEl = root.querySelector('[id="rm-src"]');
    var outEl = root.querySelector('[id="rm-out"]');
    var chipProp = root.querySelector('[id="rm-chip-prop"]');
    var chipId = root.querySelector('[id="rm-chip-id"]');
    var copiedEl = root.querySelector('[id="rm-copied"]');
    var rankEl = root.querySelector('[id="rm-rank"]');
    var chipCred = root.querySelector('[id="rm-chip-cred"]');

    var required = {
      'rm-clock': clockEl, 'rm-send': sendBtn, 'rm-copy-html': copyHtmlBtn,
      'rm-reset': resetBtn, 'rm-scan': scanBox,
      'rm-result': resultBox, 'rm-body': bodyBox, 'rm-scan-txt': scanTxt,
      'rm-text': textEl, 'rm-cat': catEl, 'rm-src': srcEl, 'rm-out': outEl,
      'rm-chip-prop': chipProp,
      'rm-chip-id': chipId, 'rm-copied': copiedEl
    };
    for (var key in required) {
      if (!required[key]) {
        console.warn('[Réseau du Murmure] élément introuvable dans le DOM : #' + key + ' — le widget ne peut pas s\'initialiser.');
        return;
      }
    }
    if (!rankEl || !chipCred) {
      console.warn('[Réseau du Murmure] #rm-rank ou #rm-chip-cred absent — le chip de crédibilité perçue sera ignoré, le reste fonctionne normalement.');
    }

    function tick() {
      var d = new Date();
      var h = String(d.getHours()).padStart(2, '0');
      var m = String(d.getMinutes()).padStart(2, '0');
      clockEl.textContent = h + ':' + m;
    }
    tick();
    setInterval(tick, 15000);

    var propPools = {
      'Brume': ['Faible', 'Modérée', 'Virale', 'Virale'],
      'Criminelle': ['Modérée', 'Modérée', 'Virale', 'Virale'],
      'Politique': ['Faible', 'Modérée', 'Modérée', 'Virale'],
      'Industrielle': ['Faible', 'Modérée', 'Modérée', 'Virale'],
      'Personnelle': ['Faible', 'Faible', 'Modérée', 'Modérée'],
      'Le Maire': ['Modérée', 'Virale', 'Virale', 'Virale']
    };
    var propLevelsDefault = ['Faible', 'Modérée', 'Modérée', 'Virale'];

    var srcTag = {
      'Anonyme': "Source : anonyme.",
      'Témoin direct': "Source : témoin direct, présent sur place.",
      'Ouï-dire': "Source : ouï-dire, déjà passée par d'autres bouches."
    };

    var scanMessages = [
      "Analyse du contenu en cours",
      "Évaluation de la source",
      "Estimation de la portée",
      "Calcul de la crédibilité perçue"
    ];

    var rankTier = {
      'Obsidian': 'low', 'Bronze': 'low',
      'Silver': 'mid',
      'Gold': 'high', 'Platinum': 'high'
    };
    var credibilityPools = {
      low: ['Faible', 'Très faible', 'Douteuse'],
      mid: ['Moyenne', 'Incertaine'],
      high: ['Élevée', 'Fiable']
    };

    var lastGen = null;

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function genId() {
      var n = Math.floor(1000 + Math.random() * 8999);
      return 'MRM-' + n;
    }
    function genTimestamp() {
      var d = new Date();
      var jj = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var aaaa = d.getFullYear();
      var hh = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return jj + '/' + mm + '/' + aaaa + ' à ' + hh + ':' + min;
    }

    function flashCopied(label) {
      copiedEl.textContent = label;
      copiedEl.style.display = 'inline';
      setTimeout(function () {
        copiedEl.style.display = 'none';
        copiedEl.textContent = 'Copié.';
      }, 1800);
    }

    sendBtn.addEventListener('click', function () {
      var text = textEl.value.trim();
      if (!text) {
        textEl.style.borderColor = 'var(--rm-red-br)';
        textEl.placeholder = "Une rumeur vide ne circule pas.";
        return;
      }
      textEl.style.borderColor = '';

      var cat = catEl.value;
      var src = srcEl.value;

      bodyBox.style.display = 'none';
      scanBox.style.display = 'block';

      var i = 0;
      scanTxt.textContent = scanMessages[0];
      var interval = setInterval(function () {
        i++;
        if (i < scanMessages.length) {
          scanTxt.textContent = scanMessages[i];
        }
      }, 500);

      setTimeout(function () {
        clearInterval(interval);
        scanBox.style.display = 'none';

        var prop = pick(propPools[cat] || propLevelsDefault);
        var id = genId();
        var timestamp = genTimestamp();
        var srcLabel = srcTag[src];

        var cred = null;
        if (rankEl) {
          var tier = rankTier[rankEl.value] || 'mid';
          if (cat === 'Criminelle' && tier === 'low') {
            tier = 'mid';
          }
          cred = pick(credibilityPools[tier]);
        }

        lastGen = { cat: cat, text: text, src: src, srcLabel: srcLabel, prop: prop, id: id, cred: cred, timestamp: timestamp };

        var out = "[RUMEUR — " + cat.toUpperCase() + "]\n\n"
                + text + "\n\n"
                + srcLabel + "\n"
                + "Réf. registre : " + id;

        outEl.textContent = out;
        chipProp.textContent = prop;
        chipId.textContent = id;
        if (chipCred && cred) {
          chipCred.textContent = cred;
        }

        resultBox.style.display = 'block';
      }, 2100);
    });

    if (copyHtmlBtn) {
      copyHtmlBtn.addEventListener('click', function () {
        if (!lastGen) return;
        if (!navigator.clipboard || !navigator.clipboard.writeText) return;
        var html = buildTractHtml(lastGen);
        navigator.clipboard.writeText(html).then(function () {
          flashCopied('Copié (HTML).');
        }).catch(function () { /* silencieux : copie manuelle toujours possible */ });
      });
    }

    resetBtn.addEventListener('click', function () {
      textEl.value = '';
      textEl.placeholder = "Ce qui se raconte dans les files, les paliers, les salles d'attente...";
      textEl.style.borderColor = '';
      resultBox.style.display = 'none';
      bodyBox.style.display = 'block';
    });
  }

  function scanAndInit() {
    var roots = document.querySelectorAll('[id="rm-root"]');
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
