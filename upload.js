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
const storage = firebase.storage();
const auth = firebase.auth();  // ← 新增這行

const ADMIN_EMAIL = "admin@fermata333yj.com";  // ← 先在 Console 創這個帳號
const ADMIN_PASSWORD = "333cyj1116";          // ← 跟你的密碼一樣
const PASSWORD = "333cyj1116"; // 前端密碼（可改）

const form = document.getElementById("uploadForm");
const titleInput = document.getElementById("titleInput");
const transcript = document.getElementById("transcript");
const mediaFile = document.getElementById("mediaFile");
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");

// 日期預設今天
dateInput.value = new Date().toISOString().slice(0, 10);

// 1. 先驗前端密碼
let inputPass = prompt("請輸入上傳密碼：");
if (inputPass !== PASSWORD) {
  document.body.innerHTML = "<h2>❌ 密碼錯誤，暫時無法使用上傳頁面。</h2>";
}

// 2. 密碼對 → Firebase Auth 自動登入管理員
auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
  .then(() => {
    console.log("✓ Firebase 管理員登入成功");
  })
  .catch((error) => {
    console.error("Firebase 登入失敗：", error.message);
    result.textContent = "系統錯誤：請聯絡管理員設定帳號";
  });

// 3. 監聽登入狀態（確保上傳時已登入）
auth.onAuthStateChanged((user) => {
  if (!user) {
    result.textContent = "請重新整理頁面並輸入密碼";
  }
});

// 表單送出（不變）
form.onsubmit = async (e) => {
  e.preventDefault();
  result.textContent = "";

  // 檢查登入狀態
  const user = auth.currentUser;
  if (!user) {
    result.textContent = "請先輸入密碼登入！";
    return;
  }

  if (!titleInput.value.trim()) {
    result.textContent = "請填寫標題";
    return;
  }

  if (!transcript.value.trim()) {
    result.textContent = "請填寫逐字稿文字";
    return;
  }

  if (!mediaFile.files[0]) {
    result.textContent = "請選擇音檔、影片或圖片檔案";
    return;
  }

  const file = mediaFile.files[0];
  const mimeType = file.type;

  // 判斷檔案類型
  let mediaType = "file";
  if (mimeType.startsWith("video/")) {
    mediaType = "video";
  } else if (mimeType.startsWith("audio/")) {
    mediaType = "audio";
  } else if (mimeType.startsWith("image/")) {
    mediaType = "image";
  }

  const dateStr = dateInput.value;
  const remoteName = `media/${dateStr}_${file.name}`;

  result.textContent = "上傳中...";

  try {
    const snap = await storage.ref(remoteName).put(file);
    const url = await snap.ref.getDownloadURL();

    await db.collection("messages").add({
      title: titleInput.value.trim(),
      text: transcript.value.trim(),
      mediaUrl: url,
      mediaType: mediaType,
      fileName: file.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      date: dateStr
    });

    result.textContent = "✓ 上傳成功！";
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
  } catch (err) {
    result.textContent = "上傳錯誤：" + err.message;
  }
};
