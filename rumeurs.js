(function(){
  var root = document.getElementById('rm-root');
  if(!root) return;

  var clockEl = root.querySelector('#rm-clock');
  function tick(){
    var d = new Date();
    var h = String(d.getHours()).padStart(2,'0');
    var m = String(d.getMinutes()).padStart(2,'0');
    clockEl.textContent = h+':'+m;
  }
  tick(); setInterval(tick, 15000);

  var propLevels = [
    {label:'Faible', weight:1},
    {label:'Modérée', weight:1},
    {label:'Modérée', weight:1},
    {label:'Virale', weight:1}
  ];
  var groups = ['Loyalistes','Détracteurs','Indifférents','Fanatiques'];

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

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function genId(){
    var n = Math.floor(1000 + Math.random()*8999);
    return 'MRM-'+n;
  }

  var sendBtn = root.querySelector('#rm-send');
  var scanBox = root.querySelector('#rm-scan');
  var resultBox = root.querySelector('#rm-result');
  var bodyBox = root.querySelector('#rm-body');
  var scanTxt = root.querySelector('#rm-scan-txt');

  var scanMessages = [
    "Analyse du contenu en cours",
    "Évaluation de la source",
    "Estimation de la portée",
    "Attribution du premier relais"
  ];

  sendBtn.addEventListener('click', function(){
    var textEl = root.querySelector('#rm-text');
    var text = textEl.value.trim();
    if(!text){
      textEl.style.borderColor = 'var(--rm-red-br)';
      textEl.placeholder = "Une rumeur vide ne circule pas.";
      return;
    }

    var cat = root.querySelector('#rm-cat').value;
    var src = root.querySelector('#rm-src').value;

    bodyBox.style.display = 'none';
    scanBox.style.display = 'block';

    var i = 0;
    scanTxt.textContent = scanMessages[0];
    var interval = setInterval(function(){
      i++;
      if(i < scanMessages.length){
        scanTxt.textContent = scanMessages[i];
      }
    }, 500);

    setTimeout(function(){
      clearInterval(interval);
      scanBox.style.display = 'none';

      var prop = pick(propLevels).label;
      var grp = pick(groups);
      var id = genId();
      var opener = pick(openLines[cat]);

      var out = "[RUMEUR — "+cat.toUpperCase()+"]\n\n"
              + opener + "\n\n"
              + text + "\n\n"
              + srcTag[src] + "\n"
              + "Réf. registre : "+id;

      root.querySelector('#rm-out').textContent = out;
      root.querySelector('#rm-chip-prop').textContent = prop;
      root.querySelector('#rm-chip-grp').textContent = grp;
      root.querySelector('#rm-chip-id').textContent = id;

      resultBox.style.display = 'block';
    }, 2100);
  });

  root.querySelector('#rm-copy').addEventListener('click', function(){
    var out = root.querySelector('#rm-out').textContent;
    navigator.clipboard.writeText(out).then(function(){
      var c = root.querySelector('#rm-copied');
      c.style.display = 'inline';
      setTimeout(function(){ c.style.display = 'none'; }, 1800);
    });
  });

  root.querySelector('#rm-reset').addEventListener('click', function(){
    var textEl = root.querySelector('#rm-text');
    textEl.value = '';
    textEl.placeholder = "Ce qui se raconte dans les files, les paliers, les salles d'attente...";
    textEl.style.borderColor = '';
    resultBox.style.display = 'none';
    bodyBox.style.display = 'block';
  });
})();
