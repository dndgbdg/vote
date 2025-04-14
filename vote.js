// 🔧 Firebase 설정 (이미 설정됨)
const firebaseConfig = {
  apiKey: "AIzaSyBYGLHgGbyfInoSJD8Xh50F_wl71h1pNZs",
  authDomain: "vote-4e2da.firebaseapp.com",
  projectId: "vote-4e2da",
  storageBucket: "vote-4e2da.firebasestorage.app",
  messagingSenderId: "408749919354",
  appId: "1:408749919354:web:7a31ee10bc5fca28807fc3",
  measurementId: "G-YHKYKNTJ5Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const voteItems = Array.from({ length: 17 }, (_, i) => `투표${i + 1}`);

// 투표 항목 select 박스에 추가
window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('choice');
  if (select) {
    voteItems.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
  }

  const deleteSelect = document.getElementById('deleteSelect');
  if (deleteSelect) {
    voteItems.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      deleteSelect.appendChild(opt);
    });
  }

  setupRealtimeTextResults();  // <-- 여기만 변경됨
});

// 투표 제출
const form = document.getElementById('voteForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const choice = document.getElementById('choice').value;

    if (!name || !choice) {
      alert("닉네임과 선택 항목을 입력하세요.");
      return;
    }

    await db.collection('votes').add({ name, choice, timestamp: new Date() });
    alert("투표 완료!");
    form.reset();
  });
}

// ✅ 막대그래프 대신 실시간 텍스트 결과 출력
function setupRealtimeTextResults() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;

  db.collection('votes').onSnapshot(snapshot => {
    const grouped = {};
    voteItems.forEach(item => grouped[item] = []);
    snapshot.forEach(doc => {
      const { name, choice } = doc.data();
      if (grouped[choice]) grouped[choice].push(name);
    });

    resultsDiv.innerHTML = '';
    voteItems.forEach(item => {
      const names = grouped[item];
      const block = document.createElement('div');
      block.className = 'result-block';
      block.innerHTML = `
        <strong>${item} :</strong> ${names.join(', ') || ' '}<br />
        (${names.length}명)
      `;
      resultsDiv.appendChild(block);
    });
  });
}

// 관리자 로그인
function checkPassword() {
  const pw = document.getElementById('password').value;
  if (pw === "12344321") {
    document.getElementById('adminPanel').style.display = 'block';
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
}

// 투표 초기화
async function resetVotes() {
  const confirmReset = confirm("모든 투표 데이터를 삭제할까요?");
  if (!confirmReset) return;

  const snapshot = await db.collection('votes').get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  alert("전체 투표가 초기화되었습니다.");
}

// 특정 항목 투표만 삭제
async function deleteVote() {
  const toDelete = document.getElementById('deleteSelect').value;
  const snapshot = await db.collection('votes').where("choice", "==", toDelete).get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  alert(`"${toDelete}" 항목의 투표가 삭제되었습니다.`);
}
