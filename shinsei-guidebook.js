/* ============================================================
   GUIDEBOOK SHINSEI CITY — JS
   À héberger sur jsDelivr (comme le reste), puis charger avec :
   <script src="https://cdn.jsdelivr.net/gh/xreed04/ShinseiCity@main/shinsei-guidebook.js?v=1"></script>
   juste après le bloc HTML #guidebook dans la Page HTML.

   Vanilla JS pur : aucune dépendance à jQuery.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var guidebook = document.getElementById('guidebook');
  if (!guidebook) return;

  var catToggles = guidebook.querySelectorAll('.gbcat-toggle');
  var links = guidebook.querySelectorAll('.gblink');
  var pages = guidebook.querySelectorAll('.gbpage');

  /* ---- Accordéon : ouvrir/fermer une catégorie ---- */
  catToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.gbcat-item');
      item.classList.toggle('open');
    });
  });

  /* ---- Fil d'Ariane ---- */
  function updateBreadcrumb(categoryName, pageTitle) {
    var el = guidebook.querySelector('#gbbreadcrumb') || document.getElementById('gbbreadcrumb');
    if (!el) return;
    if (!categoryName) {
      el.innerHTML = '<span class="gbcrumb-current">Accueil</span>';
      return;
    }
    el.innerHTML = categoryName +
      ' <em class="fa-solid fa-chevron-right"></em> ' +
      '<span class="gbcrumb-current">' + pageTitle + '</span>';
  }

  /* ---- Affiche une page et met à jour le menu ---- */
  function showPage(id) {
    var target = document.getElementById(id);
    if (!target || !target.classList.contains('gbpage')) return;

    pages.forEach(function (p) { p.classList.remove('active'); });
    target.classList.add('active');

    links.forEach(function (l) { l.classList.remove('active'); });
    var activeLink = guidebook.querySelector('.gblink[href="#' + id + '"]');
    var categoryName = null;

    if (activeLink) {
      activeLink.classList.add('active');
      var parentItem = activeLink.closest('.gbcat-item');
      if (parentItem) {
        parentItem.classList.add('open');
        var catLabel = parentItem.querySelector('.gbcat-toggle span');
        if (catLabel) categoryName = catLabel.textContent.trim();
      }
    }

    var titleEl = target.querySelector('.gbheader h2');
    var pageTitle = titleEl ? titleEl.textContent.trim() : '';
    updateBreadcrumb(categoryName, pageTitle);

    guidebook.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Clic sur un lien du menu ---- */
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = link.getAttribute('href').substring(1);
      showPage(id);
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---- Au chargement : ouvre la bonne page si l'URL contient une ancre ---- */
  var hash = window.location.hash.substring(1);
  if (hash && document.getElementById(hash)) {
    showPage(hash);
  } else {
    var firstCat = guidebook.querySelector('.gbcat-item');
    if (firstCat) firstCat.classList.add('open');
    updateBreadcrumb(null, '');
  }

});
