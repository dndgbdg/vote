// 🔧 Firebase 설정 (자신의 프로젝트 정보로 교체)
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
let chart;

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

  drawChart();
  setupRealtimeChart();
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

// 실시간 차트 갱신
function setupRealtimeChart() {
  db.collection('votes').onSnapshot(snapshot => {
    const counts = {};
    voteItems.forEach(item => counts[item] = 0);
    snapshot.forEach(doc => {
      const { choice } = doc.data();
      if (counts.hasOwnProperty(choice)) counts[choice]++;
    });
    updateChart(counts);
  });
}

// Chart.js 초기화
function drawChart() {
  const ctx = document.getElementById('voteChart');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: voteItems,
      datasets: [{
        label: '투표 수',
        data: Array(voteItems.length).fill(0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, precision: 0 }
      }
    }
  });
}

// Chart 데이터 갱신
function updateChart(counts) {
  if (!chart) return;
  chart.data.datasets[0].data = voteItems.map(item => counts[item] || 0);
  chart.update();
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
