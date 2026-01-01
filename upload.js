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
const ADMIN_PASS = "333cyj1116";  // 改這裡的密碼
const FRONTEND_PASS = "333cyj1116";  // 前端提示密碼

const form = document.getElementById("uploadForm");
const titleInput = document.getElementById("titleInput");
const transcript = document.getElementById("transcript");
const mediaFile = document.getElementById("mediaFile");
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");

// 預設今天日期
dateInput.value = new Date().toISOString().slice(0, 10);

// ===== 步驟 1：前端密碼驗證 =====
let frontendPass = prompt("🔐 請輸入上傳密碼：");
if (frontendPass !== FRONTEND_PASS) {
  document.body.innerHTML = `
    <h2 style="color: red;">❌ 密碼錯誤！</h2>
    <p>請重新整理並輸入正確密碼。</p>
  `;
} else {
  console.log("✅ 前端密碼驗證通過");
  
  // ===== 步驟 2：Firebase Auth 自動登入 =====
  auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASS)
    .then(() => {
      console.log("✅ Firebase 管理員登入成功");
      result.textContent = "已登入，準備上傳！";
    })
    .catch((error) => {
      console.error("Firebase 登入失敗：", error);
      result.textContent = `登入失敗：${error.message}。請檢查 Console → Authentication → Users 有沒有 admin@fermata333yj.com`;
    });
}

// 監聽登入狀態
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("當前使用者：", user.email);
  } else {
    console.log("未登入狀態");
  }
});

// ===== 上傳表單 =====
form.onsubmit = async (e) => {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user) {
    result.textContent = "❌ 請重新整理並輸入密碼登入！";
    return;
  }
  
  if (!titleInput.value.trim()) {
    result.textContent = "請填寫標題";
    return;
  }
  
  if (!transcript.value.trim()) {
    result.textContent = "請填寫逐字稿";
    return;
  }
  
  if (!mediaFile.files[0]) {
    result.textContent = "請選擇檔案";
    return;
  }
  
  const file = mediaFile.files[0];
  const dateStr = dateInput.value;
  const remoteName = `media/${dateStr}_${Date.now()}_${file.name}`;
  
  result.textContent = "📤 上傳檔案中...";
  
  try {
    // 1. 上傳 Storage
    const snap = await storage.ref(remoteName).put(file);
    const url = await snap.ref.getDownloadURL();
    
    result.textContent = "💾 儲存 Firestore...";
    
    // 2. 存 Firestore
    await db.collection("messages").add({
      title: titleInput.value.trim(),
      text: transcript.value.trim(),
      mediaUrl: url,
      mediaType: file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('audio/') ? 'audio' : 'image',
      fileName: file.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      date: dateStr,
      uploadedBy: user.email  // 記錄誰上傳
    });
    
    result.innerHTML = "🎉 <strong>上傳成功！</strong>";
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    
  } catch (err) {
    console.error("詳細錯誤：", err);
    result.textContent = `❌ ${err.message}`;
  }
};
