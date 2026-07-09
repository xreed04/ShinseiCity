const firebaseConfig = {
  apiKey: "AIzaSyA3NrJ_MF_Xz0-D2o8tP6vG2NQXu8wFCrU",
  authDomain: "shinsei-city.firebaseapp.com",
  projectId: "shinsei-city",
  storageBucket: "shinsei-city.firebasestorage.app",
  messagingSenderId: "23807897974",
  appId: "1:23807897974:web:2f2a59c1836de1fb770a57"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const MAIRE_PASSPHRASE = "CHANGE_MOI";

let maireMode = sessionStorage.getItem('gbpet_maire') === '1';

function statusLabel(s){
  if(s==='etude') return 'En étude par le Maire';
  if(s==='repondue') return 'Répondue';
  return 'Active';
}

function renderCard(id, p){
  const signers = p.signers || [];
  const div = document.createElement('div');
  div.className = 'gbpetcard';
  div.innerHTML = `
    <span class="gbpetbadge ${p.status}">${statusLabel(p.status)}</span>
    <h4>${p.title}</h4>
    <div class="gbpetmeta">Déposée par ${p.author}</div>
    <div class="gbpettext">${p.text}</div>
    <div class="gbpetcount">${signers.length} signature${signers.length>1?'s':''}</div>
    ${p.status==='active' ? `<button class="gbpetsign" data-id="${id}">Signer</button>` : ''}
    ${p.status==='repondue' && p.responseUrl ? `<div class="gbpetresponse"><a href="${p.responseUrl}" target="_blank">Voir la réponse du Maire</a></div>` : ''}
    ${maireMode ? `<div class="gbpetadmin">
      ${p.status==='active' ? `<button data-action="etude" data-id="${id}">Marquer en étude</button>` : ''}
      ${p.status!=='repondue' ? `<button data-action="link" data-id="${id}">Attacher lien réponse</button>` : ''}
    </div>` : ''}
  `;
  return div;
}

function loadPetitions(){
  db.collection('petitions').orderBy('createdAt','desc').onSnapshot(snap=>{
    const list = document.getElementById('gbpet-list');
    list.innerHTML = '';
    snap.forEach(doc=> list.appendChild(renderCard(doc.id, doc.data())));
  });
}

document.getElementById('gbpet-submit').addEventListener('click', async ()=>{
  const author = document.getElementById('gbpet-author').value.trim();
  const title = document.getElementById('gbpet-title').value.trim();
  const text = document.getElementById('gbpet-text').value.trim();
  const msg = document.getElementById('gbpet-msg');
  if(!author || !title || !text){ msg.textContent = 'Tous les champs sont requis.'; return; }
  await db.collection('petitions').add({
    author, title, text, status: 'active', signers: [], responseUrl: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById('gbpet-author').value = '';
  document.getElementById('gbpet-title').value = '';
  document.getElementById('gbpet-text').value = '';
  msg.textContent = 'Pétition déposée.';
});

document.getElementById('gbpet-list').addEventListener('click', async (e)=>{
  const id = e.target.dataset.id;
  if(!id) return;
  if(e.target.classList.contains('gbpetsign')){
    const pseudo = prompt('Votre pseudo forum, pour signer :');
    if(!pseudo) return;
    const ref = db.collection('petitions').doc(id);
    const doc = await ref.get();
    const signers = doc.data().signers || [];
    if(signers.some(s=> s.toLowerCase() === pseudo.trim().toLowerCase())){
      alert('Vous avez déjà signé cette pétition sous ce pseudo.');
      return;
    }
    await ref.update({ signers: firebase.firestore.FieldValue.arrayUnion(pseudo.trim()) });
  }
  if(e.target.dataset.action === 'etude'){
    await db.collection('petitions').doc(id).update({ status: 'etude' });
  }
  if(e.target.dataset.action === 'link'){
    const url = prompt('Lien du topic de réponse :');
    if(!url) return;
    await db.collection('petitions').doc(id).update({ status: 'repondue', responseUrl: url });
  }
});

document.getElementById('gbpet-mairebtn').addEventListener('click', ()=>{
  if(maireMode){
    maireMode = false;
    sessionStorage.removeItem('gbpet_maire');
  } else {
    const pass = prompt('Phrase de passe :');
    if(pass === MAIRE_PASSPHRASE){
      maireMode = true;
      sessionStorage.setItem('gbpet_maire','1');
    }
  }
  loadPetitions();
});

loadPetitions();
