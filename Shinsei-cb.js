(function(){
  function waitForChatbox(callback, attempts) {
    attempts = attempts || 0;
    var obj = document.getElementById('frame_chatbox');
    if (obj) {
      callback(obj);
    } else if (attempts < 40) {
      setTimeout(function(){ waitForChatbox(callback, attempts + 1); }, 250);
    }
  }

  function styleChatbox(obj) {
    var FIXED_HEIGHT = 500; /* hauteur totale fixe du widget, en px - ajuste si besoin */

    function inject() {
      var doc = obj.contentDocument;
      if (!doc) return;

      var style = doc.createElement('style');
      style.textContent = `
        html, body.chatbox {
          height: 100% !important;
          overflow: hidden !important;
          margin: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        #chatbox_header {
          flex-shrink: 0;
        }
        #chatbox_members {
          flex-shrink: 0;
        }
        #chatbox {
          flex: 1 1 auto;
          overflow-y: auto !important;
          min-height: 0;
          box-sizing: border-box;
        }
        #chatbox_footer {
          flex-shrink: 0;
          display: flex !important;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem !important;
          padding-bottom: 1rem !important;
          box-sizing: border-box;
        }
        .right-box.style-buttons {
          padding-bottom: 0.25rem;
        }
      `;
      doc.head.appendChild(style);
    }

    function fixHeight() {
      obj.parentElement.style.height = FIXED_HEIGHT + 'px';
      obj.style.height = '100%';
    }

    function scrollToBottom() {
      if (!obj.contentDocument) return;
      var chatboxEl = obj.contentDocument.getElementById('chatbox');
      if (chatboxEl) {
        chatboxEl.scrollTop = chatboxEl.scrollHeight;
      }
    }

    function onReady() {
      inject();
      fixHeight();
      scrollToBottom();

      /* Observe les nouveaux messages pour re-scroller en bas automatiquement */
      var chatboxEl = obj.contentDocument.getElementById('chatbox');
      if (chatboxEl && window.MutationObserver) {
        var observer = new obj.contentWindow.MutationObserver(function(){
          scrollToBottom();
        });
        observer.observe(chatboxEl, { childList: true, subtree: true });
      }
    }

    if (obj.contentDocument && obj.contentDocument.readyState === 'complete') {
      onReady();
    } else {
      obj.addEventListener('load', onReady);
    }
  }

  waitForChatbox(styleChatbox);
})();
