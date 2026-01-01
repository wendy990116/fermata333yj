// Firebase 配置
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
const storage = firebase.storage();
const auth = firebase.auth();

const ADMIN_EMAIL = "admin@fermata333yj.com";
const ADMIN_PASS = "333cyj1116";
const FRONTEND_PASS = "333cyj1116";

const form = document.getElementById("uploadForm");
const titleInput = document.getElementById("titleInput");
const transcript = document.getElementById("transcript");
const mediaFile = document.getElementById("mediaFile");
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");

// 預設日期
dateInput.value = new Date().toISOString().slice(0, 10);

// ===== 前端密碼 + Firebase 登入 =====
let isFrontendPassOk = false;
const frontendPassInput = prompt("🔐 請輸入上傳密碼：");
if (frontendPassInput === FRONTEND_PASS) {
  isFrontendPassOk = true;
  result.textContent = "驗證中...";
  
  // Firebase 登入（不重載）
  auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASS)
    .then(() => {
      result.textContent = "✅ 登入成功！可以上傳";
      console.log("管理員登入 OK");
    })
    .catch((error) => {
      console.error("登入失敗：", error);
      result.innerHTML = `
        <p style="color: orange;">⚠️ 系統登入失敗</p>
        <p>${error.message}</p>
        <p>F12 Console 查看詳情，或檢查 Authentication → Users</p>
      `;
    });
} else {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 50px; color: red;">
      <h2>❌ 密碼錯誤</h2>
      <p>請重新整理頁面</p>
    </div>
  `;
}

// 監聽登入狀態
auth.onAuthStateChanged((user) => {
  console.log("登入狀態：", user ? user.email : "未登入");
});

// ===== 上傳表單（加強防重整）=====
form.addEventListener('submit', async function(e) {
  e.preventDefault();  // ← 關鍵！阻止表單重整
  e.stopPropagation();
  
  const user = auth.currentUser;
  if (!user || !isFrontendPassOk) {
    result.textContent = "❌ 請重新整理並輸入密碼";
    return;
  }
  
  // 表單驗證
  const title = titleInput.value.trim();
  const text = transcript.value.trim();
  const file = mediaFile.files[0];
  
  if (!title || !text || !file) {
    result.textContent = "請填完整表單";
    return;
  }
  
  if (file.size > 100 * 1024 * 1024) {
    result.textContent = "檔案太大（限 100MB）";
    return;
  }
  
  const dateStr = dateInput.value;
  const remoteName = `media/${dateStr}_${Date.now()}_${file.name}`;
  
  result.innerHTML = "📤 <strong>上傳中...</strong>";
  
  try {
    // 1. Storage 上傳
    result.innerHTML = "📤 上傳檔案...";
    const snap = await storage.ref(remoteName).put(file);
    const url = await snap.ref.getDownloadURL();
    
    // 2. Firestore 儲存
    result.innerHTML = "💾 儲存資料...";
    await db.collection("messages").add({
      title,
      text,
      mediaUrl: url,
      mediaType: file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('audio/') ? 'audio' : 'image',
      fileName: file.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      date: dateStr,
      uploadedBy: user.email
    });
    
    result.innerHTML = `
      <div style="color: green;">
        🎉 <strong>上傳成功！</strong><br>
        <small>影片：${file.name}</small>
      </div>
    `;
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    
  } catch (error) {
    console.error("完整錯誤：", error);
    result.innerHTML = `
      <div style="color: red;">
        ❌ <strong>上傳失敗</strong><br>
        <code>${error.message}</code>
      </div>
    `;
  }
});
