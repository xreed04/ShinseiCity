(function(){
  function styleChatbox() {
    var obj = document.getElementById('frame_chatbox');
    if (!obj) return;

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

    if (obj.contentDocument && obj.contentDocument.readyState === 'complete') {
      inject();
      resize();
    } else {
      obj.addEventListener('load', function(){
        inject();
        resize();
      });
    }

    setInterval(resize, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', styleChatbox);
  } else {
    styleChatbox();
  }
})();
