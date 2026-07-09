(function(){
  var monthsFR = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth();
  var todayDate = today.getDate();
  var monthKey = year + "-" + String(month + 1).padStart(2, "0");

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setText("tbdate-today", todayDate + " " + monthsFR[month].toLowerCase() + " " + year);
  setText("tbweather-month", todayDate + " " + monthsFR[month]);

  function esc(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function renderCalendar(evenements) {
    var target = document.getElementById("tbcalendar-days");
    if (!target) return;
    evenements = evenements || {};
    var firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var totalCells = firstDay + daysInMonth;
    var totalRows = Math.ceil(totalCells / 7);
    var html = "";
    var day = 1;
    for (var r = 0; r < totalRows; r++) {
      html += "<span>";
      for (var c = 0; c < 7; c++) {
        var cellIndex = r * 7 + c;
        if (cellIndex < firstDay || day > daysInMonth) {
          html += "<b></b>";
        } else {
          var ev = evenements[day];
          var extra = [];
          if (day === todayDate) extra.push("hoy");
          if (ev && ev.type) extra.push(ev.type);
          var bAttrs = extra.length ? ' class="' + extra.join(" ") + '"' : "";
          var inner;
          if (ev && ev.lien) {
            var t = ev.titre ? ' title="' + esc(ev.titre) + '"' : "";
            inner = '<a href="' + ev.lien + '"' + t + '>' + day + "</a>";
          } else if (ev && ev.titre) {
            bAttrs += ' title="' + esc(ev.titre) + '"';
            inner = day;
          } else {
            inner = day;
          }
          html += "<b" + bAttrs + ">" + inner + "</b>";
          day++;
        }
      }
      html += "</span>";
    }
    target.outerHTML = html;
  }

  fetch("https://cdn.jsdelivr.net/gh/xreed04/ShinseiCity@main/evenements.json?v=1")
    .then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(data){
      renderCalendar(data && data[monthKey] ? data[monthKey] : {});
    })
    .catch(function(){
      renderCalendar({});
    });

  fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto")
    .then(function(r){ return r.json(); })
    .then(function(data){
      var code = data.current.weather_code;
      var tempNow = Math.round(data.current.temperature_2m);
      var tempMax = Math.round(data.daily.temperature_2m_max[0]);
      var tempMin = Math.round(data.daily.temperature_2m_min[0]);
      setText("tbweather-temp", tempMin + "\u00b0 / " + tempMax + "\u00b0 (actuel " + tempNow + "\u00b0)");
      var icon = "fa-cloud";
      if (code === 0) icon = "fa-sun";
      else if (code === 1 || code === 2) icon = "fa-cloud-sun";
      else if (code === 3) icon = "fa-clouds";
      else if (code === 45 || code === 48) icon = "fa-smog";
      else if (code >= 51 && code <= 67) icon = "fa-cloud-rain";
      else if (code >= 71 && code <= 77) icon = "fa-snowflake";
      else if (code >= 80 && code <= 82) icon = "fa-cloud-showers-heavy";
      else if (code === 85 || code === 86) icon = "fa-snowflake";
      else if (code >= 95) icon = "fa-cloud-bolt";
      var iconEl = document.getElementById("tbweather-icon");
      if (iconEl) iconEl.className = "fa-light " + icon;
    })
    .catch(function(){
      setText("tbweather-temp", "--\u00b0 / --\u00b0");
    });
})();
