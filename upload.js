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

const PASSWORD = "333cyj1116"; // 你可以改成自己的密碼

const form = document.getElementById("uploadForm");
const titleInput = document.getElementById("titleInput");
const transcript = document.getElementById("transcript");
const mediaFile = document.getElementById("mediaFile");
const dateInput = document.getElementById("dateInput");
const result = document.getElementById("result");

// 日期預設今天
dateInput.value = new Date().toISOString().slice(0,10);

// 簡單密碼驗證
let inputPass = prompt("請輸入上傳密碼：");
if (inputPass !== PASSWORD) {
  document.body.innerHTML = "<h2>❌ 密碼錯誤，暫時無法使用上傳頁面。</h2>";
}

// 表單送出
form.onsubmit = async (e) => {
  e.preventDefault();
  result.textContent = "";

  if (!titleInput.value.trim()) {
    result.textContent = "請填寫標題";
    return;
  }

  if (!transcript.value.trim()) {
    result.textContent = "請填寫逐字稿文字";
    return;
  }

  if (!mediaFile.files[0]) {
    result.textContent = "請選擇音檔或影片檔案";
    return;
  }

  // 後面開始處理檔案...


  const file = mediaFile.files[0];
const mimeType = file.type;

let mediaType = "file";
if (mimeType.startsWith("video/")) {
  mediaType = "video";
} else if (mimeType.startsWith("audio/")) {
  mediaType = "audio";
} else if (mimeType.startsWith("image/")) {
  mediaType = "image";
  const dateStr = dateInput.value;
  const remoteName = `media/${dateStr}_${file.name}`;

  result.textContent = "上傳中...";

  try {
    const snap = await storage.ref(remoteName).put(file);
    const url = await snap.ref.getDownloadURL();

   await db.collection("messages").add({
  title: titleInput.value.trim(),           // ← 新增這一行
  text: transcript.value.trim(),
  mediaUrl: url,
  mediaType: mediaType,
  fileName: file.name,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  date: dateStr
});


    result.textContent = "✓ 上傳成功！";
    form.reset();
    dateInput.value = new Date().toISOString().slice(0,10);
  } catch (err) {
    result.textContent = "上傳錯誤：" + err.message;
  }
};

