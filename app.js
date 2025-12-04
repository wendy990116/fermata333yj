// Firebase 設定（保持你的 config）
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

// DOM 元素
const groupsEl = document.getElementById('groups');
const searchInput = document.getElementById('searchInput');

let allMessages = [];

// 從 Firestore 讀資料
db.collection('messages')
  .orderBy('createdAt', 'desc')
  .onSnapshot((snap) => {
    allMessages = [];
    snap.forEach(doc => {
      allMessages.push(doc.data());
    });
    renderAll();
  });

// 依搜尋＋日期分組顯示全部
function renderAll() {
  const keyword = (searchInput.value || '').trim().toLowerCase();
  groupsEl.innerHTML = '';

  // 關鍵字過濾：標題 / 內容 / 日期
  const filtered = allMessages.filter(msg => {
    const title = (msg.title || '').toLowerCase();
    const text = (msg.text || '').toLowerCase();
    const date = (msg.date || '').toLowerCase();
    if (!keyword) return true;
    return title.includes(keyword) || text.includes(keyword) || date.includes(keyword);
  });

  if (filtered.length === 0) {
    groupsEl.innerHTML = '<div class="section-title">沒有符合條件的紀錄。</div>';
    return;
  }

  // 依日期分組（msg.date 是 YYYY-MM-DD）
  const byDate = {};
  filtered.forEach(msg => {
    const d = msg.date || '未指定日期';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(msg);
  });

  // 日期從新到舊排序
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  dates.forEach(dateStr => {
    const section = document.createElement('section');

    const titleDiv = document.createElement('div');
    titleDiv.className = 'section-title';
    titleDiv.textContent = formatDateLabel(dateStr);
    section.appendChild(titleDiv);

    const ul = document.createElement('ul');
    ul.className = 'card-list';

    byDate[dateStr].forEach(msg => {
      ul.appendChild(renderCard(msg));
    });

    section.appendChild(ul);
    groupsEl.appendChild(section);
  });
}

// 單一卡片
function renderCard(msg) {
  const li = document.createElement('li');
  li.className = 'card';

  const created =
    msg.createdAt && msg.createdAt.seconds
      ? new Date(msg.createdAt.seconds * 1000)
      : null;

  const dateStr = msg.date || '';
  const displayDate = toYMD(dateStr);

  li.innerHTML = `
    <div class="date-large">${displayDate}</div>
    ${msg.title ? `<div class="title">${(msg.title || '').replace(/</g, '&lt;')}</div>` : ''}
    <div class="text">${(msg.text || '').replace(/</g, '&lt;')}</div>
    ${
      msg.mediaUrl
        ? (
            msg.mediaType === 'video'
              ? `<video controls src="${msg.mediaUrl}"></video>`
              : msg.mediaType === 'audio'
                ? `<audio controls src="${msg.mediaUrl}"></audio>`
                : msg.mediaType === 'image'
                  ? `<img src="${msg.mediaUrl}" style="max-width:100%;border-radius:10px;display:block;">`
                  : ''
          )
        : ''
    }
    <div class="meta">
      ${created ? created.toLocaleString() : ''}
    </div>
  `;
  return li;
}

// YYYY-MM-DD → YYYY/MM/DD
function toYMD(dateStr) {
  if (!dateStr || dateStr.length !== 10) return dateStr || '';
  return dateStr.replace(/-/g, '/');
}

// 今日 / 昨日 / 其餘顯示日期
function formatDateLabel(dateStr) {
  if (!dateStr || dateStr.length !== 10) return dateStr || '未指定日期';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const d = new Date(dateStr + 'T00:00:00');

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return '今日';
  if (sameDay(d, yesterday)) return '昨日';
  return toYMD(dateStr);
}

// 搜尋框即時篩選
searchInput.addEventListener('input', () => {
  renderAll();
});
