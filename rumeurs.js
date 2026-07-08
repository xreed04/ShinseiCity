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

  function buildHtmlCard(gen) {
    var body = "[RUMEUR — " + gen.cat.toUpperCase() + "]\n\n"
             + gen.opener + "\n\n"
             + gen.text + "\n\n"
             + gen.srcLabel + "\n"
             + "Réf. registre : " + gen.id;
    var bodyHtml = escapeHtml(body).replace(/\n/g, '<br>');

    return '<div style="background:#1a171b;border:1px solid #2c2830;border-left:3px solid #7d2027;'
      + 'border-radius:2px;padding:1em 1.2em;max-width:520px;font-family:\'Courier New\',monospace;'
      + 'font-size:0.9rem;line-height:1.6;color:#e8e2d8;">' + bodyHtml + '</div>'
      + '<div style="margin-top:0.6em;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;'
      + 'font-size:0.72rem;color:#948d84;">Propagation : <b style="color:#e8e2d8;">' + escapeHtml(gen.prop) + '</b>'
      + ' &middot; Premier relais : <b style="color:#e8e2d8;">' + escapeHtml(gen.grp) + '</b>'
      + ' &middot; ID : <b style="color:#e8e2d8;">' + escapeHtml(gen.id) + '</b></div>';
  }

  function initOne(root) {
    if (root.getAttribute('data-rm-init')) return;
    root.setAttribute('data-rm-init', '1');

    var clockEl = root.querySelector('[id="rm-clock"]');
    var sendBtn = root.querySelector('[id="rm-send"]');
    var copyBtn = root.querySelector('[id="rm-copy"]');
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
    var chipGrp = root.querySelector('[id="rm-chip-grp"]');
    var chipId = root.querySelector('[id="rm-chip-id"]');
    var copiedEl = root.querySelector('[id="rm-copied"]');

    // Garde-fou : si un élément essentiel manque (ID modifié, collage
    // corrompu par ForumActif, page pas encore mise à jour...), on le dit
    // clairement dans la console au lieu de planter silencieusement au clic.
    // Le bouton "Copier en HTML" est traité séparément, plus bas : son
    // absence ne doit jamais empêcher le reste du widget de fonctionner.
    var required = {
      'rm-clock': clockEl, 'rm-send': sendBtn, 'rm-copy': copyBtn,
      'rm-reset': resetBtn, 'rm-scan': scanBox,
      'rm-result': resultBox, 'rm-body': bodyBox, 'rm-scan-txt': scanTxt,
      'rm-text': textEl, 'rm-cat': catEl, 'rm-src': srcEl, 'rm-out': outEl,
      'rm-chip-prop': chipProp, 'rm-chip-grp': chipGrp,
      'rm-chip-id': chipId, 'rm-copied': copiedEl
    };
    for (var key in required) {
      if (!required[key]) {
        console.warn('[Réseau du Murmure] élément introuvable dans le DOM : #' + key + ' — le widget ne peut pas s\'initialiser.');
        return;
      }
    }
    if (!copyHtmlBtn) {
      console.warn('[Réseau du Murmure] #rm-copy-html absent — bouton "Copier en HTML" indisponible sur cette page, le reste fonctionne normalement.');
    }

    function tick() {
      var d = new Date();
      var h = String(d.getHours()).padStart(2, '0');
      var m = String(d.getMinutes()).padStart(2, '0');
      clockEl.textContent = h + ':' + m;
    }
    tick();
    setInterval(tick, 15000);

    var propLevels = ['Faible', 'Modérée', 'Modérée', 'Virale'];
    var groups = ['Loyalistes', 'Détracteurs', 'Indifférents', 'Fanatiques'];

    var openLines = {
      Politique: [
        "Il paraît qu'en haut, ça ne s'entend plus du tout.",
        "On dit que la dernière annonce cachait autre chose.",
        "Une voix qui en sait plus qu'elle ne devrait a parlé."
      ],
      Criminelle: [
        "Dans la file de ce matin, on ne parlait que de ça.",
        "Quelque chose a été vu, et personne ne veut le répéter fort.",
        "Un dossier aurait disparu là où il n'aurait pas dû."
      ],
      Industrielle: [
        "Les chiffres du dernier quota ne collent pas.",
        "Une ligne aurait été arrêtée sans qu'on en parle.",
        "Ce qui sort de l'usine ce mois-ci n'est pas ce qu'on croit."
      ],
      Personnelle: [
        "On raconte que quelqu'un a changé, du jour au lendemain.",
        "Une histoire qui circule sur un voisin, un visage familier.",
        "Ce qu'on chuchote à propos d'elle, ou de lui, ne s'arrête pas."
      ],
      Brume: [
        "Quelque chose est revenu de la Brume différent.",
        "On dit qu'un bruit s'en est échappé, cette nuit-là.",
        "Un enfant né ici s'en approcherait sans jamais avoir peur."
      ]
    };

    var srcTag = {
      'Anonyme': "Source : anonyme, transmise sans visage.",
      'Témoin direct': "Source : témoin direct, présent sur place.",
      'Ouï-dire': "Source : ouï-dire, déjà passée par d'autres bouches."
    };

    var scanMessages = [
      "Analyse du contenu en cours",
      "Évaluation de la source",
      "Estimation de la portée",
      "Attribution du premier relais"
    ];

    var lastGen = null;

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function genId() {
      var n = Math.floor(1000 + Math.random() * 8999);
      return 'MRM-' + n;
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

        var prop = pick(propLevels);
        var grp = pick(groups);
        var id = genId();
        var opener = pick(openLines[cat]);
        var srcLabel = srcTag[src];

        lastGen = { cat: cat, opener: opener, text: text, srcLabel: srcLabel, prop: prop, grp: grp, id: id };

        var out = "[RUMEUR — " + cat.toUpperCase() + "]\n\n"
                + opener + "\n\n"
                + text + "\n\n"
                + srcLabel + "\n"
                + "Réf. registre : " + id;

        outEl.textContent = out;
        chipProp.textContent = prop;
        chipGrp.textContent = grp;
        chipId.textContent = id;

        resultBox.style.display = 'block';
      }, 2100);
    });

    copyBtn.addEventListener('click', function () {
      var out = outEl.textContent;
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(out).then(function () {
        flashCopied('Copié.');
      }).catch(function () { /* silencieux : copie manuelle toujours possible */ });
    });

    if (copyHtmlBtn) {
      copyHtmlBtn.addEventListener('click', function () {
        if (!lastGen) return;
        if (!navigator.clipboard || !navigator.clipboard.writeText) return;
        var html = buildHtmlCard(lastGen);
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
    // ForumActif permet plusieurs posts avec le même id="rm-root" sur une
    // seule page (un par post). getElementById ne renverrait que le
    // premier ; on balaie donc tous les nœuds correspondants et on
    // initialise chacun indépendamment (le garde-fou data-rm-init évite
    // les doubles écoutes d'événements au fil des re-scans).
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

  // Filet de sécurité si MutationObserver n'a rien capté
  setTimeout(scanAndInit, 1000);
  setTimeout(scanAndInit, 3000);

})();
