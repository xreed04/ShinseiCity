(function(){
  function waitForObject(callback, attempts) {
    attempts = attempts || 0;
    var wrapper = document.getElementById("frame_chatbox");
    var obj = wrapper ? wrapper.querySelector("object") : null;
    if (obj) {
      callback(obj);
    } else if (attempts < 40) {
      setTimeout(function(){ waitForObject(callback, attempts + 1); }, 250);
    }
  }

  function setupChatbox(obj) {
    var FIXED_HEIGHT = 540;
    var STYLE_ID = "shinsei-cb-style";

    function isLight() {
      return document.documentElement.classList.contains("light");
    }

    function buildCSS(light) {
      var c = light ? {
        bg: "#f5ebe0", panel: "#e3d5ca", border: "#d9bfa0",
        text: "#6b5946", text2: "#86735d", subtitle: "#2c2115",
        accent1: "#af7853", accent2: "#865438", pillBg: "#fbf6ef",
        rowBorder: "rgba(0,0,0,0.06)", popupBg: "#efe2d5",
        btnBg: "#d9bfa0", btnHover: "#c9ab86"
      } : {
        bg: "#0c0b0f", panel: "#0e0d12", border: "#16151a",
        text: "#8d8a92", text2: "#6a6770", subtitle: "#c3bfc9",
        accent1: "#b494cf", accent2: "#5f6f8a", pillBg: "#16151a",
        rowBorder: "rgba(255,255,255,0.04)", popupBg: "#1a1820",
        btnBg: "#2e2b36", btnHover: "#3e3a48"
      };

      return "html, body.chatbox { margin: 0 !important; height: 100% !important; overflow: hidden !important; box-sizing: border-box !important; background: " + c.bg + " !important; font-family: 'Lato', sans-serif !important; color: " + c.text + " !important; }" +
        "body.chatbox { display: grid !important; grid-template-columns: 150px 1fr; grid-template-rows: auto minmax(0, 1fr) auto; grid-template-areas: 'header header' 'members chatbox' 'footer footer'; padding-bottom: .6rem !important; }" +
        "#chatbox_header { grid-area: header; background: " + c.panel + "; border-bottom: 1px solid " + c.border + "; padding: .75em 1em; }" +
        ".chatbox-title, .chat-title { font: 700 1.1rem 'Electrolize', sans-serif; color: " + c.subtitle + "; text-transform: uppercase; margin: 0; }" +
        ".chatbox-options { list-style: none; padding: 0; margin: .4em 0 0; display: flex; gap: 1em; }" +
        ".chatbox-options a, .chatbox-options li { font: 700 .7rem 'IBM Plex Mono', monospace; color: " + c.text2 + "; text-transform: uppercase; }" +
        ".chatbox-options a:hover { color: " + c.accent1 + "; }" +
        "#tab_selector_cb { display:none; }" +
        "#chatbox_members { grid-area: members; overflow-y: auto; min-height: 0; background: " + c.panel + "; border-right: 1px solid " + c.border + "; padding: .75em .5em; box-sizing: border-box; }" +
        ".member-title { font: 700 .7rem 'IBM Plex Mono', monospace; color: " + c.accent2 + "; text-transform: uppercase; margin: .5em 0 .3em; }" +
        ".online-users, .away-users { list-style: none; padding: 0; margin: 0; font-size: .8rem; }" +

        "#chatbox { grid-area: chatbox; overflow-y: auto !important; overflow-x: hidden !important; min-height: 0 !important; padding: .6em .8em; box-sizing: border-box; }" +
        ".chatbox_row_1, .chatbox_row_2 { padding: .35em 0; border-bottom: 1px solid " + c.rowBorder + "; font-size: .85rem; line-height: 1.4em; overflow-wrap: break-word !important; word-break: break-word !important; }" +
        ".chatbox_row_1 *, .chatbox_row_2 * { overflow-wrap: break-word !important; word-break: break-word !important; max-width: 100%; }" +
        ".date-and-time { color: " + c.text2 + "; font-size: .7rem; margin-right: .5em; }" +

        "@keyframes cbFadeIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }" +
        ".cb-animate-in { animation: cbFadeIn .4s ease-out; }" +

        "#chatbox_footer { grid-area: footer !important; display: flex !important; flex-direction: column !important; background: " + c.panel + " !important; border-top: 1px solid " + c.border + " !important; padding: 0 !important; box-sizing: border-box !important; min-height: 3.2rem !important; overflow: visible !important; }" +
        "#chatbox_footer > form { display: contents !important; }" +
        "#help-button { display: none !important; }" +

        "#chatbox_messenger_form { position: relative !important; display: block !important; width: 100% !important; box-sizing: border-box !important; padding: .6em .75em !important; overflow: visible !important; }" +

        "#chatbox_messenger_form > div.right-box:not(.style-buttons) { position: absolute !important; left: .75em !important; right: .75em !important; bottom: calc(100% - .1em) !important; width: auto !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; gap: .4em !important; padding: .5em .6em !important; background: " + c.popupBg + " !important; border: 1px solid " + c.border + " !important; border-radius: 8px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important; opacity: 0 !important; transform: translateY(6px) !important; pointer-events: none !important; transition: opacity .2s ease, transform .2s ease !important; z-index: 5 !important; }" +
        "#chatbox_messenger_form.cb-focused > div.right-box:not(.style-buttons) { opacity: 1 !important; transform: translateY(0) !important; pointer-events: auto !important; }" +
        "#chatbox_messenger_form > div.right-box:not(.style-buttons) input.format-message { display: none !important; }" +
        "label[for^='format-'] { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 1.6rem !important; height: 1.6rem !important; flex-shrink: 0 !important; border-radius: 5px !important; background: " + c.btnBg + " !important; color: " + c.text + " !important; font-size: .75rem !important; cursor: pointer !important; margin: 0 !important; }" +
        "label[for^='format-']:hover { background: " + c.btnHover + " !important; color: " + c.subtitle + " !important; }" +
        "#divcolor, #divcolor-preview { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }" +

        "div.right-box.style-buttons { position: static !important; width: 100% !important; }" +
        ".text-field { display: flex !important; align-items: center !important; gap: .5em !important; width: 100% !important; background: " + c.pillBg + " !important; border-radius: 20px !important; padding: .3em .5em .3em 1em !important; box-sizing: border-box !important; }" +
        ".text-field label[for='message'] { display: none !important; }" +
        "input#message { order: 1 !important; flex: 1 1 auto !important; min-width: 0 !important; width: auto !important; background: transparent !important; border: none !important; color: " + c.subtitle + " !important; font-size: .85rem !important; padding: .4em 0 !important; height: 1.6rem !important; box-sizing: border-box !important; }" +
        "input#message:focus { outline: none !important; }" +

        "input#submit_button { order: 2 !important; flex: 0 0 2rem !important; width: 2rem !important; height: 2rem !important; min-width: 2rem !important; max-width: 2rem !important; min-height: 2rem !important; max-height: 2rem !important; padding: 0 !important; margin: 0 !important; border: none !important; border-radius: 50% !important; background: " + c.accent2 + " !important; font-size: 0 !important; line-height: 0 !important; cursor: pointer !important; background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='22' y1='2' x2='11' y2='13'%3E%3C/line%3E%3Cpolygon points='22 2 15 22 11 13 2 9 22 2'%3E%3C/polygon%3E%3C/svg%3E\") !important; background-repeat: no-repeat !important; background-position: center !important; background-size: 14px 14px !important; }" +
        "input#submit_button:hover { background-color: " + c.accent1 + " !important; }" +

        "#divsmilies { order: 3 !important; flex: 0 0 1.8rem !important; width: 1.8rem !important; height: 1.8rem !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; background: " + c.btnBg + " !important; cursor: pointer !important; position: static !important; }" +
        "#divsmilies img { width: 14px !important; height: 14px !important; filter: brightness(0) invert(1) !important; opacity: .85 !important; }" +
        ".light #divsmilies img, [class*='light'] #divsmilies img { filter: none !important; }" +
        "#divsmilies:hover { background: " + c.btnHover + " !important; }" +

        "::-webkit-scrollbar { width: 6px; }" +
        "::-webkit-scrollbar-thumb { background: " + c.accent2 + "; }";
    }

    function inject(force) {
      var doc = obj.contentDocument;
      if (!doc || !doc.head) return;

      var existing = doc.getElementById(STYLE_ID);

      if (!existing) {
        var style = doc.createElement("style");
        style.id = STYLE_ID;
        style.textContent = buildCSS(isLight());
        doc.head.appendChild(style);
      } else if (force) {
        existing.textContent = buildCSS(isLight());
      }

      var textField = doc.querySelector(".text-field");
      var smilies = doc.getElementById("divsmilies");
      if (textField && smilies && smilies.parentElement !== textField) {
        textField.appendChild(smilies);
      }

      var msgInput = doc.getElementById("message");
      var form = doc.getElementById("chatbox_messenger_form");
      var submitBtn = doc.getElementById("submit_button");

      if (msgInput && form && !msgInput._cbBound) {
        msgInput._cbBound = true;
        msgInput.setAttribute("placeholder", "Ecrivez ici...");

        var suppress = false;

        function suppressBriefly() {
          suppress = true;
          form.classList.remove("cb-focused");
          setTimeout(function(){ suppress = false; }, 60);
        }

        msgInput.addEventListener("focus", function(){
          if (!suppress) form.classList.add("cb-focused");
        });
        msgInput.addEventListener("blur", function(){
          setTimeout(function(){
            form.classList.remove("cb-focused");
          }, 200);
        });
        msgInput.addEventListener("keydown", function(e){
          if (e.key === "Enter") suppressBriefly();
        });

        if (submitBtn) submitBtn.addEventListener("mousedown", suppressBriefly, true);
        if (smilies) smilies.addEventListener("mousedown", suppressBriefly, true);

        var messengerForm = msgInput.closest ? msgInput.closest("form") : null;
        if (messengerForm && !messengerForm._cbSubmitBound) {
          messengerForm._cbSubmitBound = true;
          messengerForm.addEventListener("submit", suppressBriefly, true);
        }
      }
    }

    function fixHeight() {
      obj.parentElement.style.height = FIXED_HEIGHT + "px";
      obj.style.height = "100%";
    }

    function scrollToBottom() {
      var doc = obj.contentDocument;
      if (!doc) return;
      var chatboxEl = doc.getElementById("chatbox");
      if (chatboxEl) chatboxEl.scrollTop = chatboxEl.scrollHeight;
    }

    function preventScrollJump() {
      var doc = obj.contentDocument;
      if (!doc) return;
      doc.addEventListener("mousedown", function(e){
        if (e.target && e.target.id === "message") {
          e.preventDefault();
          e.target.focus({ preventScroll: true });
        }
      }, true);
    }

    function watchNewMessages() {
      var doc = obj.contentDocument;
      if (!doc) return;
      var chatboxEl = doc.getElementById("chatbox");
      if (!chatboxEl || !obj.contentWindow.MutationObserver) return;

      var win = obj.contentWindow;

      var observer = new win.MutationObserver(function(mutations){
        var lastNode = null;
        mutations.forEach(function(m){
          m.addedNodes.forEach(function(node){
            if (node.nodeType === 1) lastNode = node;
          });
        });
        if (lastNode) {
          /* Force le navigateur à "voir" l'état initial avant d'ajouter la classe,
             sinon l'animation peut être ignorée si tout se passe dans le même tick */
          lastNode.style.opacity = "0";
          win.requestAnimationFrame(function(){
            win.requestAnimationFrame(function(){
              lastNode.style.opacity = "";
              lastNode.classList.add("cb-animate-in");
            });
          });
        }
        scrollToBottom();
      });
      observer.observe(chatboxEl, { childList: true, subtree: false });
    }

    function watchThemeChange() {
      if (!window.MutationObserver) return;
      var themeObserver = new MutationObserver(function(){
        inject(true);
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    function onReady() {
      inject();
      fixHeight();
      scrollToBottom();
      preventScrollJump();
      watchNewMessages();
      watchThemeChange();
      setInterval(function(){ inject(false); }, 800);
    }

    if (obj.contentDocument && obj.contentDocument.readyState === "complete") {
      onReady();
    } else {
      obj.addEventListener("load", onReady);
    }
  }

  waitForObject(setupChatbox);
})();
