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
    function inject() {
      var doc = obj.contentDocument;
      if (!doc) return;

      var style = doc.createElement('style');
      style.textContent = `
        html, body.chatbox {
          height: auto !important;
          overflow: visible !important;
        }
        #chatbox_footer {
          display: flex !important;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem !important;
          box-sizing: border-box;
        }
        #chatbox {
          box-sizing: border-box;
        }
      `;
      doc.head.appendChild(style);
    }

    function resize() {
      if (!obj.contentDocument) return;
      var chatboxEl = obj.contentDocument.getElementById('chatbox');
      var footerEl = obj.contentDocument.getElementById('chatbox_footer');
      var headerEl = obj.contentDocument.getElementById('chatbox_header');
      var membersEl = obj.contentDocument.getElementById('chatbox_members');
      if (chatboxEl && footerEl) {
        var total = (headerEl ? headerEl.offsetHeight : 0)
                  + (membersEl ? membersEl.offsetHeight : 0)
                  + chatboxEl.scrollHeight
                  + footerEl.offsetHeight
                  + 20;
        obj.parentElement.style.height = total + 'px';
        obj.style.height = '100%';
      }
    }

    function onReady() {
      inject();
      resize();
      setInterval(resize, 1000);
    }

    if (obj.contentDocument && obj.contentDocument.readyState === 'complete') {
      onReady();
    } else {
      obj.addEventListener('load', onReady);
    }
  }

  waitForChatbox(styleChatbox);
})();
