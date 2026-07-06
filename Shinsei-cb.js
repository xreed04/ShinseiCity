(function(){
  function waitForObject(callback, attempts) {
    attempts = attempts || 0;
    var wrapper = document.getElementById('frame_chatbox');
    var obj = wrapper ? wrapper.querySelector('object') : null;
    if (obj) {
      callback(obj);
    } else if (attempts < 40) {
      setTimeout(function(){ waitForObject(callback, attempts + 1); }, 250);
    }
  }

  function setupChatbox(obj) {
    var FIXED_HEIGHT = 480;

    function inject() {
      var doc = obj.contentDocument;
      if (!doc) return;

      var style = doc.createElement('style');
      style.textContent = `
        html, body.chatbox {
          margin: 0;
          height: 100% !important;
          overflow: hidden !important;
          box-sizing: border-box;
          background: #0c0b0f;
          font-family: "Lato", sans-serif;
          color: #8d8a92;
        }
        body.chatbox {
          display: grid;
          grid-template-columns: 150px 1fr;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            "header header"
            "members chatbox"
            "footer footer";
        }
        #chatbox_header {
          grid-area: header;
          background: #0e0d12;
          border-bottom: 1px solid #16151a;
          padding: .75em 1em;
        }
        .chatbox-title, .chat-title {
          font: 700 1.1rem "Electrolize", sans-serif;
          color: #c3bfc9;
          text-transform: uppercase;
          margin: 0;
        }
        .chatbox-options {
          list-style: none;
          padding: 0;
          margin: .4em 0 0;
          display: flex;
          gap: 1em;
        }
        .chatbox-options a, .chatbox-options li {
          font: 700 .7rem "IBM Plex Mono", monospace;
          color: #6a6770;
          text-transform: uppercase;
        }
        .chatbox-options a:hover { color: #b494cf; }
        #tab_selector_cb { display:none; }
        #chatbox_members {
          grid-area: members;
          overflow-y: auto;
          background: #0e0d12;
          border-right: 1px solid #16151a;
          padding: .75em .5em;
          box-sizing: border-box;
        }
        .member-title {
          font: 700 .7rem "IBM Plex Mono", monospace;
          color: #5f6f8a;
          text-transform: uppercase;
          margin: .5em 0 .3em;
        }
        .online-users, .away-users {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: .8rem;
        }
        #chatbox {
          grid-area: chatbox;
          overflow-y: auto;
          padding: .6em .8em;
          box-sizing: border-box;
        }
        .chatbox_row_1, .chatbox_row_2 {
          padding: .35em 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: .85rem;
          line-height: 1.4em;
        }
        .date-and-time {
          color: #47454c;
          font-size: .7rem;
          margin-right: .5em;
        }

        #chatbox_footer {
          grid-area: footer;
          background: #0e0d12;
          border-top: 1px solid #16151a;
          padding: .6em .75em;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: .6em;
        }
        #help-button {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #16151a;
          border-radius: 8px;
          color: #6a6770;
          cursor: help;
          font-size: .85rem;
          order: 1;
        }

        .right-box:not(.style-buttons) label[for^="format-"],
        .right-box:not(.style-buttons) input[name="bold"],
        .right-box:not(.style-buttons) input[name="italic"],
        .right-box:not(.style-buttons) input[name="underline"],
        .right-box:not(.style-buttons) input[name="strike"],
        #divcolor {
          display: none !important;
        }

        #chatbox_messenger_form {
          order: 2;
          flex-grow: 1;
          display: flex;
        }
        .right-box.style-buttons {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .text-field {
          display: flex;
          align-items: center;
          gap: .5em;
          width: 100%;
          background: #16151a;
          border-radius: 20px;
          padding: .3em .5em .3em 1em;
          box-sizing: border-box;
        }
        .text-field label { display: none; }
        .text-field input#message {
          flex-grow: 1;
          min-width: 0;
          background: transparent;
          border: none;
          color: #c3bfc9;
          font-size: .85rem;
          padding: .4em 0;
          box-sizing: border-box;
        }
        .text-field input#message:focus { outline: none; }
        #divsmilies {
          flex-shrink: 0;
          width: 1.8rem;
          height: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b494cf;
          cursor: pointer;
          font-size: 1rem;
        }
        .text-field input#submit_button {
          flex-shrink: 0;
          width: 2.2rem;
          height: 2.2rem;
          background: #5f6f8a;
          color: #ece9ef;
          border: none;
          border-radius: 50%;
          font-size: 0;
          cursor: pointer;
          position: relative;
        }
        .text-field input#submit_button::before {
          content: '\\27A4';
          font-size: .9rem;
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text-field input#submit_button:hover { background: #b494cf; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #5f6f8a; }
      `;
      doc.head.appendChild(style);

      var msgInput = doc.getElementById('message');
      if (msgInput) msgInput.setAttribute('placeholder', 'Message');
    }

    function fixHeight() {
      obj.parentElement.style.height = FIXED_HEIGHT + 'px';
      obj.style.height = '100%';
    }

    function scrollToBottom() {
      var doc = obj.contentDocument;
      if (!doc) return;
      var chatboxEl = doc.getElementById('chatbox');
      if (chatboxEl) chatboxEl.scrollTop = chatboxEl.scrollHeight;
    }

    function onReady() {
      inject();
      fixHeight();
      scrollToBottom();

      var doc = obj.contentDocument;
      var chatboxEl = doc.getElementById('chatbox');
      if (chatboxEl && obj.contentWindow.MutationObserver) {
        var observer = new obj.contentWindow.MutationObserver(scrollToBottom);
        observer.observe(chatboxEl, { childList: true, subtree: true });
      }
    }

    if (obj.contentDocument && obj.contentDocument.readyState === 'complete') {
      onReady();
    } else {
      obj.addEventListener('load', onReady);
    }
  }

  waitForObject(setupChatbox);
})();
