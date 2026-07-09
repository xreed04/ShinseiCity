(function(){
  function initGCW(){
    var btn = document.getElementById("gcGenerer");
    if(!btn) return;

    var RANGS = {
      "Obsidienne": {couleur:"#3a3a3a", tampon:"SURVEILLANCE ACTIVE"},
      "Bronze":     {couleur:"#8a5a34", tampon:"CONDITIONNEL"},
      "Argent":     {couleur:"#9aa0a6", tampon:"STABLE"},
      "Or":         {couleur:"#c9a227", tampon:"PRIVILÉGIÉ"},
      "Platine":    {couleur:"#d7d9dc", tampon:"HORS CATÉGORIE"}
    };

    var GROUPES = {
      "Loyaliste":   "#4a7a5a",
      "Détracteur":  "#a23a3a",
      "Indifférent": "#6a6a6a",
      "Fanatique":   "#b5852f"
    };

    var CADRE = "#8a5a34";

    function pad(n){ return n.toString().padStart(2,"0"); }

    function numeroDossier(){
      var a = Math.floor(1000 + Math.random()*8999);
      var b = Math.floor(10 + Math.random()*89);
      return "SC-" + a + "-" + b;
    }

    function showErr(msg){
      var e = document.getElementById("gcErr");
      if(!e) return;
      if(!msg){ e.style.display = "none"; return; }
      e.textContent = msg;
      e.style.display = "block";
    }

    function chargerPhoto(url){
      return new Promise(function(resolve){
        if(!url){ resolve(null); return; }
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function(){ resolve(img); };
        img.onerror = function(){ resolve(false); };
        img.src = url;
      });
    }

    function dessinerPhoto(ctx, img, x, y, w, h){
      var r = Math.max(img.width / w, img.height / h);
      var sw = w * r, sh = h * r;
      var sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    function dessiner(){
      showErr(null);
      var nom = document.getElementById("gcNom").value.trim() || "RÉSIDENT NON DÉCLARÉ";
      var rang = document.getElementById("gcRang").value;
      var groupe = document.getElementById("gcGroupe").value;
      var quartier = document.getElementById("gcQuartier").value.trim() || "SECTEUR NON ASSIGNÉ";
      var photoUrl = document.getElementById("gcPhoto").value.trim();
      var infos = RANGS[rang];
      var couleurGroupe = GROUPES[groupe];

      var canvas = document.getElementById("gcCanvas");
      var ctx = canvas.getContext("2d");
      var W = canvas.width, H = canvas.height;

      var px = W-380, py = 210, pw = 300, ph = 340;

      function finaliser(photo, photoEchouee){
        ctx.fillStyle = "#111111";
        ctx.fillRect(0,0,W,H);

        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 2;
        ctx.strokeRect(20,20,W-40,H-40);

        ctx.fillStyle = infos.couleur;
        ctx.fillRect(20,20,W-40,10);

        ctx.fillStyle = "#888888";
        ctx.font = "20px monospace";
        ctx.fillText("VILLE DE SHINSEI — SERVICE DE LA RÉSIDENCE", 60, 76);

        ctx.fillStyle = "#555555";
        ctx.font = "16px monospace";
        ctx.fillText("Dossier n° " + numeroDossier(), 60, 102);
        var d = new Date();
        ctx.fillText("Édité le " + pad(d.getDate()) + "." + pad(d.getMonth()+1) + "." + d.getFullYear(), W-320, 102);

        ctx.strokeStyle = "#333333";
        ctx.beginPath(); ctx.moveTo(60,120); ctx.lineTo(W-60,120); ctx.stroke();

        ctx.fillStyle = "#eeeeee";
        ctx.font = "bold 42px monospace";
        ctx.fillText(nom.toUpperCase(), 60, 190);

        var champs = [
          ["QUARTIER DE RÉSIDENCE", quartier.toUpperCase()],
          ["SCORE D'ENGAGEMENT", rang.toUpperCase() + "  —  " + infos.tampon]
        ];
        var y = 250;
        champs.forEach(function(c){
          ctx.fillStyle = "#777777";
          ctx.font = "15px monospace";
          ctx.fillText(c[0], 60, y);
          ctx.fillStyle = "#dddddd";
          ctx.font = "22px monospace";
          ctx.fillText(c[1], 60, y+32);
          y += 78;
        });

        ctx.fillStyle = "#050505";
        ctx.fillRect(px, py, pw, ph);

        if(photo){
          dessinerPhoto(ctx, photo, px, py, pw, ph);
        } else {
          ctx.fillStyle = "#1c1c1c";
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = "#555555";
          ctx.font = "15px monospace";
          ctx.textAlign = "center";
          ctx.fillText(photoEchouee ? "PHOTO INDISPONIBLE" : "AUCUNE PHOTO FOURNIE", px+pw/2, py+ph/2);
          ctx.textAlign = "left";
        }

        var overlay = ctx.createLinearGradient(px, py+ph-110, px, py+ph);
        overlay.addColorStop(0, "rgba(5,5,5,0)");
        overlay.addColorStop(1, "rgba(5,5,5,0.88)");
        ctx.fillStyle = overlay;
        ctx.fillRect(px, py+ph-110, pw, 110);

        ctx.fillStyle = couleurGroupe;
        ctx.fillRect(px, py+ph-8, pw, 8);

        ctx.fillStyle = "#bbbbbb";
        ctx.font = "13px monospace";
        ctx.fillText("GROUPE D'AFFINITÉ", px+16, py+ph-56);
        ctx.fillStyle = couleurGroupe;
        ctx.font = "bold 22px monospace";
        ctx.fillText(groupe.toUpperCase(), px+16, py+ph-28);

        ctx.strokeStyle = CADRE;
        ctx.lineWidth = 6;
        ctx.strokeRect(px, py, pw, ph);
        ctx.strokeStyle = "#3a2618";
        ctx.lineWidth = 2;
        ctx.strokeRect(px-6, py-6, pw+12, ph+12);

        ctx.strokeStyle = "#2a2a2a";
        ctx.beginPath(); ctx.moveTo(60,H-90); ctx.lineTo(W-60,H-90); ctx.stroke();
        ctx.fillStyle = "#555555";
        ctx.font = "13px monospace";
        ctx.fillText("Ce document atteste de l'enregistrement du résident dans les registres municipaux.", 60, H-60);
        ctx.fillText("Toute altération est passible de réévaluation immédiate du score.", 60, H-40);

        var out = document.getElementById("gcOut");
        out.classList.add("show");
        var dl = document.getElementById("gcDownload");
        try{
          dl.href = canvas.toDataURL("image/png");
        }catch(e){
          showErr("La photo provient d'un site qui bloque l'export d'image (CORS). Le dossier s'affiche mais ne peut pas être téléchargé avec cette photo précise.");
          dl.href = "#";
        }
      }

      chargerPhoto(photoUrl).then(function(result){
        if(result === false){
          finaliser(null, true);
        } else {
          finaliser(result, false);
        }
      });
    }

    btn.addEventListener("click", dessiner);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initGCW);
  } else {
    initGCW();
  }
})();
