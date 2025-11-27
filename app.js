// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCVxXn8MPF1BU6V4WhCAB5HJZ2eQlQ5Fz0",
    authDomain: "fermata-333yj.firebaseapp.com",
    projectId: "fermata-333yj",
    storageBucket: "fermata-333yj.firebasestorage.app",
    messagingSenderId: "360093400346",
    appId: "1:360093400346:web:b2ee52979c7d180c4cc0a3"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const list = document.getElementById('list');

function render(msg) {
  const li = document.createElement('li');
  li.innerHTML = `
    <div>
      <p>${(msg.text || '').replace(/</g, '&lt;')}</p>
      ${
        msg.mediaUrl
          ? (msg.mediaType === 'video'
              ? `<video controls width="320" src="${msg.mediaUrl}"></video>`
              : `<audio controls src="${msg.mediaUrl}"></audio>`
            )
          : ''
      }
      <div style="font-size:12px;color:#666;">
        ${msg.date || ''} ${msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ''}
      </div>
    </div>
  `;
  list.appendChild(li);
}

db.collection('messages')
  .orderBy('createdAt', 'desc')
  .onSnapshot((snap) => {
    list.innerHTML = '';
    snap.forEach(doc => render(doc.data()));
  });

