// Firebase 配置
firebase.initializeApp({
apiKey: "AIzaSyCVxXn8MPF1BU6V4WhCAB5HJZ2eQlQ5Fz0",
authDomain: "fermata-333yj.firebaseapp.com",
projectId: "fermata-333yj",
storageBucket: "fermata-333yj.firebasestorage.app",
messagingSenderId: "360093400346",
appId: "1:360093400346:web:b2ee52979c7d180c4cc0a3"
});

const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// 設定
const ADMIN_EMAIL = "admin@fermata333yj.com";
const ADMIN_PASS = "333cyj1116";
const FRONTEND_PASS = "333cyj1116";

const result = document.getElementById("result");
const uploadButton = document.getElementById("uploadButton");
let isUploadEnabled = false;

// 預設日期
document.getElementById("dateInput").value = new Date().toISOString().slice(0, 10);

// ===== 每次重整都要密碼 =====
const pass = prompt("🔐 上傳密碼：");
if (pass === FRONTEND_PASS) {
isUploadEnabled = true;

// 後台 Firebase 登入
auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASS)
.then(() => {
result.className = "success";
result.textContent = "✅ 準備完成！按「上傳」開始";
})
.catch((e) => {
console.error(e);
result.className = "error";
result.textContent = "⚠️ 系統登入問題，請檢查 Authentication → Users";
});
} else {
uploadButton.disabled = true;
result.className = "error";
result.textContent = "❌ 密碼錯誤！";
}

// ===== 按鈕點擊上傳（絕對不重整）=====
uploadButton.addEventListener('click', async () => {
if (!isUploadEnabled) return;

const title = document.getElementById("titleInput").value.trim();
const text = document.getElementById("transcript").value.trim();
const file = document.getElementById("mediaFile").files[0];
const dateStr = document.getElementById("dateInput").value;

if (!title || !text || !file) {
result.className = "error";
result.textContent = "請填完整！";
return;
}

const user = auth.currentUser;
if (!user) {
result.className = "error";
result.textContent = "請重新整理！";
return;
}

result.className = "uploading";
result.textContent = "📤 上傳檔案...";

try {
const remoteName = `media/${dateStr}_${Date.now()}_${file.name}`;
const snap = await storage.ref(remoteName).put(file);
const url = await snap.ref.getDownloadURL();

result.textContent = "💾 儲存資料...";
await db.collection("messages").add({
title, text, mediaUrl: url,
mediaType: file.type.includes('video') ? 'video' :
file.type.includes('audio') ? 'audio' : 'image',
fileName: file.name,
createdAt: firebase.firestore.FieldValue.serverTimestamp(),
date: dateStr
});

result.className = "success";
result.innerHTML = `🎉 <strong>成功！</strong> ${file.name}`;

} catch (err) {
console.error(err);
result.className = "error";
result.textContent = `❌ ${err.message}`;
}
});
