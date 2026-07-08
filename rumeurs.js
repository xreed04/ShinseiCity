/* ===================================================
   Réseau du Murmure — logique
   Hébergé sur GitHub (xreed04/ShinseiCity), chargé via
   <script src="https://xreed04.github.io/ShinseiCity/rumeurs.js">
   sur la page ForumActif concernée.
=================================================== */
(function () {

  function initMurmure() {
    var root = document.getElementById('rm-root');
    if (!root) return false;
    if (root.getAttribute('data-rm-init')) return true;
    root.setAttribute('data-rm-init', '1');

    var clockEl = root.querySelector('#rm-clock');
    var sendBtn = root.querySelector('#rm-send');
    var copyBtn = root.querySelector('#rm-copy');
    var resetBtn = root.querySelector('#rm-reset');
    var scanBox = root.querySelector('#rm-scan');
    var resultBox = root.querySelector('#rm-result');
    var bodyBox = root.querySelector('#rm-body');
    var scanTxt = root.querySelector('#rm-scan-txt');
    var textEl = root.querySelector('#rm-text');
    var catEl = root.querySelector('#rm-cat');
    var srcEl = root.querySelector('#rm-src');
    var outEl = root.querySelector('#rm-out');
    var chipProp = root.querySelector('#rm-chip-prop');
    var chipGrp = root.querySelector('#rm-chip-grp');
    var chipId = root.querySelector('#rm-chip-id');
    var copiedEl = root.querySelector('#rm-copied');

    // Garde-fou : si un élément attendu manque (ID modifié, collage
    // corrompu par ForumActif...), on le dit clairement dans la console
    // au lieu de planter silencieusement au clic.
    var required = {
      'rm-clock': clockEl, 'rm-send': sendBtn, 'rm-copy': copyBtn,
      'rm-reset': resetBtn, 'rm-scan': scanBox, 'rm-result': resultBox,
      'rm-body': bodyBox, 'rm-scan-txt': scanTxt, 'rm-text': textEl,
      'rm-cat': catEl, 'rm-src': srcEl, 'rm-out': outEl,
      'rm-chip-prop': chipProp, 'rm-chip-grp': chipGrp,
      'rm-chip-id': chipId, 'rm-copied': copiedEl
    };
    for (var key in required) {
      if (!required[key]) {
        console.warn('[Réseau du Murmure] élément introuvable dans le DOM : #' + key + ' — le widget ne peut pas s\'initialiser.');
        return true;
      }
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

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function genId() {
      var n = Math.floor(1000 + Math.random() * 8999);
      return 'MRM-' + n;
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

        var out = "[RUMEUR — " + cat.toUpperCase() + "]\n\n"
                + opener + "\n\n"
                + text + "\n\n"
                + srcTag[src] + "\n"
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
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        return;
      }
      navigator.clipboard.writeText(out).then(function () {
        copiedEl.style.display = 'inline';
        setTimeout(function () { copiedEl.style.display = 'none'; }, 1800);
      }).catch(function () { /* silencieux : copie manuelle toujours possible */ });
    });

    resetBtn.addEventListener('click', function () {
      textEl.value = '';
      textEl.placeholder = "Ce qui se raconte dans les files, les paliers, les salles d'attente...";
      textEl.style.borderColor = '';
      resultBox.style.display = 'none';
      bodyBox.style.display = 'block';
    });

    return true;
  }

  function tryInit() {
    if (initMurmure() && observer) {
      observer.disconnect();
      observer = null;
    }
  }

  var observer = null;
  if ('MutationObserver' in window) {
    observer = new MutationObserver(tryInit);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  // Filet de sécurité si MutationObserver n'a rien capté
  setTimeout(tryInit, 1000);
  setTimeout(tryInit, 3000);

})();
