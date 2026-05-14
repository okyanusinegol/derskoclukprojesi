/* ═══════════════════════════════════════════
   UI — Arayüz Güncellemeleri ve Modül Mantığı
═══════════════════════════════════════════ */
let chart = null;
let mockChartLine = null;

/* ── Tab Switching ── */
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  const activePage = document.getElementById(`page-${tabId}`);
  if (activePage) {
    activePage.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

function switchPlanTab(subtabId) {
  document.querySelectorAll('.segment-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.segment-btn[onclick="switchPlanTab('${subtabId}')"]`).classList.add('active');
  
  document.getElementById('subtab-daily').classList.add('hidden');
  document.getElementById('subtab-library').classList.add('hidden');
  
  document.getElementById(`subtab-${subtabId}`).classList.remove('hidden');
}

/* ── Modals ── */
function closeAddBookModal() { document.getElementById("addBookModal").classList.add("hidden"); }
function openAddBookModal() { document.getElementById("addBookModal").classList.remove("hidden"); }
function closeAddTaskModal() { document.getElementById("addTaskModal").classList.add("hidden"); }
function openSettingsModal() { 
  document.getElementById("settingsModal").classList.remove("hidden"); 
  document.getElementById("themeToggle").checked = (state.theme === "dark");
  if(typeof renderColorPalette === "function") renderColorPalette();
}
function closeSettingsModal() { document.getElementById("settingsModal").classList.add("hidden"); }

function openAddMockModal() { document.getElementById("addMockModal").classList.remove("hidden"); }
function closeAddMockModal() { document.getElementById("addMockModal").classList.add("hidden"); }

function openGamificationInfoModal() {
  const solved = state.totalScans;
  const level = state.gamificationEntity;
  const nextThreshold = level * 250;
  const needed = nextThreshold - solved;
  
  document.getElementById("infoCurrentState").innerHTML = `Seviye: <strong>${level}</strong> • Çözülen: <strong>${solved}</strong> Soru`;
  if (level < 100) {
    document.getElementById("infoNextLevel").textContent = `Sonraki seviye için ${needed} soru daha çözmen lazım.`;
  } else {
    document.getElementById("infoNextLevel").textContent = `Maksimum seviyeye ulaştın! Gerçek bir LGS şampiyonusun.`;
  }
  
  document.getElementById("gamificationInfoModal").classList.remove("hidden");
}

function closeGamificationInfoModal() {
  document.getElementById("gamificationInfoModal").classList.add("hidden");
}

/* ── Theme ── */
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
  "#78716c", "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d",
  "#16a34a", "#059669", "#0f766e", "#0891b2", "#0284c7", "#2563eb"
];

function toggleTheme() {
  state.theme = document.getElementById("themeToggle").checked ? "dark" : "light";
  save();
  applyTheme();
}

function applyTheme() {
  if (state.theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  
  if (state.primaryColor) {
    document.documentElement.style.setProperty('--primary', state.primaryColor);
  } else {
    document.documentElement.style.removeProperty('--primary');
  }
}

function renderColorPalette() {
  const grid = document.getElementById("colorPaletteGrid");
  if (!grid) return;
  
  let html = "";
  const current = state.primaryColor || "#4f46e5"; // default indigo
  
  PRESET_COLORS.forEach(color => {
    const isActive = color.toLowerCase() === current.toLowerCase() ? "active" : "";
    html += `<div class="color-swatch ${isActive}" style="background-color: ${color}" onclick="selectColor('${color}')"></div>`;
  });
  
  grid.innerHTML = html;
  
  const picker = document.getElementById("customColorPicker");
  const hexInput = document.getElementById("customColorHex");
  if (picker && hexInput) {
    picker.value = current;
    hexInput.value = current;
    picker.oninput = (e) => { hexInput.value = e.target.value; };
  }
}

function selectColor(hex) {
  state.primaryColor = hex;
  save();
  applyTheme();
  renderColorPalette();
  showToast("Tema rengi güncellendi!", "success");
}

function applyCustomColor() {
  const hexInput = document.getElementById("customColorHex").value.trim();
  const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/i;
  if (hexRegex.test(hexInput)) {
    selectColor(hexInput);
  } else {
    showToast("Geçersiz renk kodu. # ile başlamalıdır.", "error");
  }
}

function openAddTaskModal() {
  const select = document.getElementById("taskBookInput");
  select.innerHTML = '<option value="">(Kitapsız Görev)</option>';
  state.library.filter(b => !b.finished).forEach(b => {
    select.innerHTML += `<option value="${b.id}">${b.name}</option>`;
  });
  document.getElementById("addTaskModal").classList.remove("hidden");
}

/* ── Onboarding ── */
function selectLevel(level) {
  const sName = document.getElementById("targetSchoolName").value.trim();
  const sScore = parseFloat(document.getElementById("targetSchoolScore").value);
  if (!sName || !sScore) return showToast("Lütfen hedef lise ve puanı girin", "error");

  state.targetSchool = { name: sName, score: sScore };
  state.studyLevel = level;
  let target = 100;
  if(level === 1) target = 100;
  if(level === 2) target = 160;
  if(level === 3) target = 250;
  state.dailyPlan.targetQuestions = target;
  save();
  document.getElementById("onboardingModal").classList.add("hidden");
  showToast("Harika! Hedefin güncellendi. Hedef: " + target + " soru/gün", "success");
  refreshUI();
}

/* ── Gamification ── */
function getGamificationEmoji(entityLevel) {
  let emoji = "🌱";
  let title = "Tohum";
  
  if (entityLevel >= 100) { emoji = "🌲🌌"; title = "Evrensel Orman"; }
  else if (entityLevel >= 90) { emoji = "🌲🦅"; title = "Efsanevi Orman"; }
  else if (entityLevel >= 80) { emoji = "🌲🐿️"; title = "Büyük Orman"; }
  else if (entityLevel >= 70) { emoji = "🌳🍎"; title = "Bilgi Ağacı"; }
  else if (entityLevel >= 60) { emoji = "🌳🦉"; title = "Ulu Ağaç"; }
  else if (entityLevel >= 50) { emoji = "🌳"; title = "Yetişkin Ağaç"; }
  else if (entityLevel >= 40) { emoji = "🪴🌿"; title = "Büyük Fidan"; }
  else if (entityLevel >= 30) { emoji = "🪴"; title = "Fidan"; }
  else if (entityLevel >= 20) { emoji = "🌿"; title = "Büyük Filiz"; }
  else if (entityLevel >= 10) { emoji = "🌱✨"; title = "Filiz"; }
  else { emoji = "🌱"; title = "Tohum"; }
  
  return { emoji, text: `Seviye ${entityLevel}: ${title}` };
}

function updateGamification() {
  const stage = getGamificationEmoji(state.gamificationEntity);
  setText("plantEmoji", stage.emoji);
  setText("plantStatus", stage.text);
  
  const gamificationCard = document.querySelector(".gamification-card");
  if (gamificationCard) {
    if (state.gamificationEntity >= 100) {
      gamificationCard.classList.add("card-legendary-glow");
    } else {
      gamificationCard.classList.remove("card-legendary-glow");
    }
  }

  const avatar = document.getElementById("avatarLetter");
  if (avatar) {
    avatar.classList.remove("avatar-bronze", "avatar-silver", "avatar-gold", "avatar-diamond");
    if (state.gamificationEntity >= 80) avatar.classList.add("avatar-diamond");
    else if (state.gamificationEntity >= 50) avatar.classList.add("avatar-gold");
    else if (state.gamificationEntity >= 20) avatar.classList.add("avatar-silver");
    else if (state.gamificationEntity >= 5) avatar.classList.add("avatar-bronze");
  }
}

function checkLevelUp() {
  let oldEntity = state.gamificationEntity;
  const solved = state.totalScans;
  
  let newLevel = Math.floor(solved / 250) + 1;
  if (newLevel > 100) newLevel = 100;
  
  state.gamificationEntity = newLevel;
  
  if (oldEntity !== state.gamificationEntity) {
    showToast("🎉 Bitkin büyüyor! Yeni Seviye: " + state.gamificationEntity, "success");
    if (typeof launchConfetti === 'function') launchConfetti();
    save();
  }
}

/* ── Library Logic ── */
function saveBook() {
  const name = document.getElementById("bookNameInput").value.trim();
  const subject = document.getElementById("bookSubjectInput").value;
  const diff = document.getElementById("bookDifficultyInput").value;
  if (!name) return showToast("Kitap adı zorunludur", "error");
  state.library.push({ id: generateId(), name, subject, difficulty: diff, finished: false });
  save();
  closeAddBookModal();
  document.getElementById("bookNameInput").value = "";
  showToast("Kaynak kütüphaneye eklendi", "success");
  renderLibrary();
}

function toggleBookFinished(id) {
  const book = state.library.find(b => b.id === id);
  if(book) {
    book.finished = !book.finished;
    save();
    renderLibrary();
  }
}

function renderLibrary() {
  const container = document.getElementById("libraryList");
  if (!container) return;
  if (!state.library || state.library.length === 0) {
    container.innerHTML = '<p class="text-sm text-muted text-center py-4">Kütüphanen boş. Kaynaklarını ekleyerek başla!</p>';
    return;
  }
  container.innerHTML = "";
  state.library.forEach(b => {
    const diffColor = b.difficulty === "Zor" ? "text-danger" : (b.difficulty === "Orta" ? "text-warning" : "text-success");
    container.innerHTML += `
      <div class="list-item ${b.finished ? 'done' : ''}">
        <div class="flex-1">
          <p class="font-bold text-sm task-text">${b.name}</p>
          <p class="text-xs text-muted">${b.subject} • <span class="${diffColor}">${b.difficulty}</span></p>
        </div>
        <div class="checkbox-custom" onclick="toggleBookFinished('${b.id}')">
          ${b.finished ? '<i class="ri-check-line text-lg"></i>' : ''}
        </div>
      </div>
    `;
  });
}

/* ── Daily Plan Logic ── */
function saveTask() {
  const bookId = document.getElementById("taskBookInput").value;
  const text = document.getElementById("taskTextInput").value.trim();
  const qCount = parseInt(document.getElementById("taskQuestionCountInput").value) || 0;
  if (!text || qCount <= 0) return showToast("Görev tanımı ve geçerli soru sayısı girin", "error");
  state.dailyPlan.tasks.push({ id: generateId(), text, bookId, questions: qCount, isDone: false });
  save();
  closeAddTaskModal();
  document.getElementById("taskTextInput").value = "";
  document.getElementById("taskQuestionCountInput").value = "";
  renderDailyPlan();
}

function toggleTaskDone(id) {
  const task = state.dailyPlan.tasks.find(t => t.id === id);
  if (!task) return;
  task.isDone = !task.isDone;
  if (task.isDone) {
    state.totalScans += task.questions;
    const book = state.library.find(b => b.id === task.bookId);
    const subj = book ? book.subject : "Diğer";
    state.errorsBySubject[subj] = (state.errorsBySubject[subj] || 0) + task.questions;
    updateHistoricalStats(task.questions);
    checkLevelUp();
    showToast(`Harika! ${task.questions} soru eklendi.`, "success");
  } else {
    state.totalScans = Math.max(0, state.totalScans - task.questions);
    updateHistoricalStats(-task.questions);
  }
  save();
  refreshUI();
}

function updateHistoricalStats(deltaQuestions) {
  const today = getTodayStr();
  
  if (deltaQuestions > 0 && state.lastActiveDate !== today) {
     const yesterday = new Date();
     yesterday.setDate(yesterday.getDate() - 1);
     const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
     
     if (state.lastActiveDate === yStr) {
        state.streak = (state.streak || 0) + 1;
     } else {
        state.streak = 1;
     }
     state.lastActiveDate = today;
  }

  if (!state.historicalStats[today]) {
    state.historicalStats[today] = { target: state.dailyPlan.targetQuestions, solved: 0, extra: 0 };
  }
  let stats = state.historicalStats[today];
  stats.solved += deltaQuestions;
  if (stats.solved < 0) stats.solved = 0;
  if (stats.solved > stats.target) {
    stats.extra = stats.solved - stats.target;
  } else {
    stats.extra = 0;
  }
}

function renderDailyPlan() {
  const target = state.dailyPlan.targetQuestions || 100;
  setText("dailyGoalText", `${target} Soru`);
  const solved = state.dailyPlan.tasks.filter(t => t.isDone).reduce((sum, t) => sum + (t.questions||0), 0);
  setText("dailyProgressText", `${solved} / ${target} Soru Çözüldü`);
  const container = document.getElementById("taskList");
  if (!container) return;
  if (!state.dailyPlan.tasks || state.dailyPlan.tasks.length === 0) {
    container.innerHTML = '<p class="text-sm text-muted text-center py-4">Bugün için henüz plan yapmadın.</p>';
    return;
  }
  container.innerHTML = "";
  state.dailyPlan.tasks.forEach(t => {
    container.innerHTML += `
      <div class="list-item ${t.isDone ? 'done' : ''}">
        <div class="flex-1">
          <p class="font-bold text-sm task-text">${t.text}</p>
          <p class="text-xs text-muted">${t.questions} Soru</p>
        </div>
        <div class="checkbox-custom" onclick="toggleTaskDone('${t.id}')">
          ${t.isDone ? '<i class="ri-check-line text-lg"></i>' : ''}
        </div>
      </div>
    `;
  });
}

function updateCountdown() {
  const el = document.getElementById("countdownDays");
  if (!el) return;
  const lgsDate = new Date("2026-06-13T09:30:00");
  const today = new Date();
  const diffTime = Math.abs(lgsDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  el.textContent = diffDays + " GÜN";
}

/* ── Mock Exams (Deneme Takibi) ── */
function saveMockExam() {
  const name = document.getElementById("mockNameInput").value.trim() || `Deneme ${state.mockExams.length + 1}`;
  
  const getVal = (id) => parseInt(document.getElementById(id).value) || 0;
  
  const turD = getVal("mockTurD"); const turY = getVal("mockTurY");
  const matD = getVal("mockMatD"); const matY = getVal("mockMatY");
  const fenD = getVal("mockFenD"); const fenY = getVal("mockFenY");
  const inkD = getVal("mockInkD"); const inkY = getVal("mockInkY");
  const ingD = getVal("mockIngD"); const ingY = getVal("mockIngY");
  const dinD = getVal("mockDinD"); const dinY = getVal("mockDinY");
  
  const calcNet = (d, y) => d - (y / 3);
  
  const nets = {
    tur: calcNet(turD, turY),
    mat: calcNet(matD, matY),
    fen: calcNet(fenD, fenY),
    ink: calcNet(inkD, inkY),
    ing: calcNet(ingD, ingY),
    din: calcNet(dinD, dinY)
  };
  
  // Approximate LGS score calculation
  const weightedNet = (nets.tur + nets.mat + nets.fen) * 4 + (nets.ink + nets.ing + nets.din) * 1;
  const maxWeightedNet = 270; // 60*4 + 30*1
  
  // Base 190, max 500
  let score = 190 + (weightedNet / maxWeightedNet) * 310;
  if (score < 190) score = 190;
  if (score > 500) score = 500;
  
  state.mockExams.push({
    id: generateId(),
    date: getTodayStr(),
    name: name,
    nets: nets,
    score: parseFloat(score.toFixed(2))
  });
  
  save();
  closeAddMockModal();
  showToast(`${name} kaydedildi. Puanın: ${score.toFixed(2)}`, "success");
  
  // Clear inputs
  ["mockNameInput","mockTurD","mockTurY","mockMatD","mockMatY","mockFenD","mockFenY","mockInkD","mockInkY","mockIngD","mockIngY","mockDinD","mockDinY"].forEach(id => {
    document.getElementById(id).value = "";
  });
  
  renderMockExams();
  refreshMockChart();
}

function renderMockExams() {
  const container = document.getElementById("mockList");
  if (!container) return;
  
  if (!state.mockExams || state.mockExams.length === 0) {
    container.innerHTML = '<p class="text-xs text-muted text-center py-4">Henüz bir deneme sınavı eklemedin.</p>';
    return;
  }
  
  let html = "";
  // Reverse to show latest first
  [...state.mockExams].reverse().forEach(m => {
    const totalNet = Object.values(m.nets).reduce((a, b) => a + b, 0).toFixed(2);
    html += `
      <div class="list-item">
        <div class="flex-1">
          <p class="font-bold text-sm text-primary">${m.name}</p>
          <p class="text-xs text-muted">${m.date} • ${totalNet} Toplam Net</p>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg text-dark">${m.score}</p>
          <p class="text-xs text-muted">LGS Puanı</p>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function initMockChart() {
  const canvas = document.getElementById("mockChart");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Ensure array exists
  if (!state.mockExams) state.mockExams = [];
  
  const labels = state.mockExams.map(m => m.name.substring(0,10));
  const data = state.mockExams.map(m => m.score);
  
  mockChartLine = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "LGS Puanı",
        data: data,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#4f46e5",
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false, min: 190, max: 500 }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function refreshMockChart() {
  if (!mockChartLine) {
    initMockChart();
    return;
  }
  
  mockChartLine.data.labels = state.mockExams.map(m => m.name.substring(0,10));
  mockChartLine.data.datasets[0].data = state.mockExams.map(m => m.score);
  mockChartLine.update();
}


/* ── Refresh UI ── */
function refreshUI() {
  const lv = level(state.xp);
  const pct = xpInLevel(state.xp);

  setText("levelNum", lv);
  setText("headerLevel", lv);
  setText("levelTitle", levelTitle(lv));
  setText("xpLabel", pct + " / 100");
  setStyle("xpBar", "width", pct + "%");
  setText("totalXp", state.xp);
  setText("totalScans", state.totalScans);
  setText("usernameDisplay", username);
  setText("avatarLetter", username.charAt(0).toUpperCase());
  
  if (state.streak > 0) {
    const badge = document.getElementById("streakBadge");
    if(badge) {
       badge.textContent = `🔥 ${state.streak} Seri`;
       badge.classList.remove("hidden");
    }
  }
  
  updateGamification();
  renderLibrary();
  renderDailyPlan();
  updateCountdown();
  renderExtraStats();
  renderMockExams();
  renderMotivationLoop();
  renderMistakes();
  
  if (state.targetSchool && state.targetSchool.name) {
    setText("dailyQuote", `Bu testi çözmek zor gelebilir ama ${state.targetSchool.name} hedefine ulaşmak için sadece bir adım. Başarabilirsin!`);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setStyle(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = val;
}

/* ── Extra Stats Chart ── */
function renderExtraStats() {
  const container = document.getElementById("extraQuestionsStats");
  if (!container) return;
  const entries = Object.entries(state.historicalStats || {});
  if (entries.length === 0) return;
  let html = `<div class="space-y-2">`;
  entries.sort((a,b) => b[0].localeCompare(a[0])).slice(0, 5).forEach(([date, data]) => {
    if (data.extra > 0) {
      html += `
        <div class="flex justify-between items-center bg-light-success p-2 rounded-xl">
          <span class="text-xs font-bold text-success">${date}</span>
          <span class="text-sm font-bold text-success">+${data.extra} Soru Fazla!</span>
        </div>
      `;
    } else {
      html += `
        <div class="flex justify-between items-center bg-light p-2 rounded-xl">
          <span class="text-xs text-muted">${date}</span>
          <span class="text-xs text-muted">Hedefte kalındı (${data.solved}/${data.target})</span>
        </div>
      `;
    }
  });
  html += `</div>`;
  container.innerHTML = html;
}

/* ── Chart ── */
function initChart() {
  const canvas = document.getElementById("subjectChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const labels = Object.keys(state.errorsBySubject);
  
  const getSubjectColor = (k) => {
    const colors = {
      "Matematik": "#4f46e5", "Fen": "#10b981", "Türkçe": "#f43f5e",
      "İnkılap": "#f59e0b", "İngilizce": "#8b5cf6", "Din": "#0ea5e9", "Diğer": "#64748b"
    };
    return colors[k] || "#64748b";
  };

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: labels.map(k => state.errorsBySubject[k]),
        backgroundColor: labels.map(k => getSubjectColor(k)),
        borderWidth: 2, borderColor: "#ffffff", hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => " " + ctx.label + ": " + ctx.parsed + " soru" } }
      }
    }
  });
}

function refreshChart() {
  if (!chart) return;
  const labels = Object.keys(state.errorsBySubject);
  const getSubjectColor = (k) => {
    const colors = {
      "Matematik": "#4f46e5", "Fen": "#10b981", "Türkçe": "#f43f5e",
      "İnkılap": "#f59e0b", "İngilizce": "#8b5cf6", "Din": "#0ea5e9", "Diğer": "#64748b"
    };
    return colors[k] || "#64748b";
  };

  chart.data.datasets[0].data = labels.map(k => state.errorsBySubject[k]);
  chart.update();

  const bd = document.getElementById("subjectBreakdown");
  if (!bd) return;
  bd.innerHTML = "";
  const total = Object.values(state.errorsBySubject).reduce((a,b)=>a+b, 0) || 1;
  
  labels.forEach(k => {
    const v = state.errorsBySubject[k] || 0;
    if (v === 0) return;
    const pct = Math.round(v / total * 100);
    const color = getSubjectColor(k);
    
    const div = document.createElement("div");
    div.className = "flex items-center gap-2";
    div.innerHTML = `
      <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>
      <span class="text-sm flex-1 font-bold">${k}</span>
      <span class="font-mono text-sm text-muted">${v}</span>
      <div style="width:80px;height:6px;border-radius:99px;background:var(--border);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:99px"></div>
      </div>
    `;
    bd.appendChild(div);
  });
}

/* ── Chat Messages ── */
function appendChat(role, text) {
  const box = document.getElementById("chatMessages");
  if (!box) return document.createElement("div");
  const div = document.createElement("div");
  div.className = role === "user" ? "chat-bubble-user" : "chat-bubble-ai";
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

/* ── Toast ── */
function showToast(msg, type) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast toast-" + (type || "info");
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ── Utils ── */
function clearAll() {
  if (!confirm("Tüm istatistiklerin, kütüphanen ve seviyen sıfırlanacak. Emin misin?")) return;
  state = { 
    xp:0, totalScans:0, 
    errorsBySubject:{"Matematik":0,"Fen":0,"Türkçe":0,"İnkılap":0,"İngilizce":0,"Din":0,"Diğer":0},
    studyLevel: null, library: [], dailyPlan: { date: "", targetQuestions: 100, tasks: [] },
    historicalStats: {}, gamificationEntity: 1, theme: "light", mockExams: [],
    targetSchool: { name: "", score: 0 }, mistakes: []
  };
  save(); 
  document.getElementById("onboardingModal").classList.remove("hidden");
  refreshUI(); refreshChart(); refreshMockChart();
  
  const ocrText = document.getElementById("ocrText");
  if (ocrText) ocrText.value = "";
  setText("detectedSubject", "—");
  setText("subjectHint", "Soru tarandığında görünür");
  setText("aiNote", "Henüz analiz yok.");
  const sb = document.getElementById("solutionBox");
  if (sb) sb.textContent = "Bir soruyu tarayıp \"Çöz!\" butonuna basınca adım adım çözüm burada belirecek.";
  showToast("Veriler sıfırlandı", "success");
}

function changeUsername() {
  const n = prompt("Yeni isim veya takma adın:", username);
  if (n && n.trim()) { username = n.trim(); saveUsername(username); refreshUI(); }
}

/* ── Motivation Loop ── */
function renderMotivationLoop() {
  const box = document.getElementById("targetMotivationBox");
  const textEl = document.getElementById("targetMotivationText");
  if (!box || !textEl) return;
  
  if (!state.mockExams || state.mockExams.length === 0 || !state.targetSchool || !state.targetSchool.score) {
    box.classList.add("hidden");
    return;
  }
  
  const lastScore = state.mockExams[state.mockExams.length - 1].score;
  const target = state.targetSchool.score;
  const diff = target - lastScore;
  
  box.classList.remove("hidden");
  
  if (diff <= 0) {
    textEl.innerHTML = `🎉 Harika! Son denemende ${lastScore} puan aldın. ${state.targetSchool.name} (${target}) hedefine çoktan ulaştın. Sadece böyle devam et!`;
  } else {
    textEl.innerHTML = `💪 Son denemen ${lastScore} puan. Hayalindeki ${state.targetSchool.name} (${target}) hedefine sadece <strong>${diff.toFixed(2)} puan</strong> kaldı! En çok hata yaptığın derslere odaklanarak bu farkı çok rahat kapatabiliriz.`;
  }
}

/* ── Mistake Analysis ── */
function openMistakeModal() {
  document.getElementById("mistakeModal").classList.remove("hidden");
}

function closeMistakeModal() {
  document.getElementById("mistakeModal").classList.add("hidden");
}

async function submitMistakeAnalysis() {
  const subject = document.getElementById("mistakeSubject").value;
  const topic = document.getElementById("mistakeTopic").value.trim();
  const reason = document.getElementById("mistakeReason").value;
  
  if (!topic) return showToast("Lütfen konuyu yazın", "error");
  
  const btn = document.getElementById("analyzeMistakeBtn");
  btn.textContent = "AI Analiz Ediyor...";
  btn.disabled = true;
  
  try {
    const feedback = await analyzeMistakeAI(subject, topic, reason);
    
    state.mistakes.push({
      id: generateId(),
      date: getTodayStr(),
      subject,
      topic,
      reason,
      feedback
    });
    save();
    
    closeMistakeModal();
    document.getElementById("mistakeTopic").value = "";
    showMistakeResult(feedback);
    renderMistakes();
  } catch (err) {
    console.error(err);
    showToast("Analiz başarısız oldu.", "error");
  } finally {
    btn.textContent = "Analiz Et";
    btn.disabled = false;
  }
}

function showMistakeResult(feedback) {
  const modal = document.getElementById("mistakeResultModal");
  const content = document.getElementById("mistakeResultContent");
  const action = document.getElementById("mistakeResultAction");
  
  content.innerHTML = `<p>${feedback.message}</p>`;
  action.innerHTML = "";
  
  if (feedback.actionType === "video" && feedback.link) {
    action.innerHTML = `<a href="${feedback.link}" target="_blank" class="btn btn-primary w-full"><i class="ri-youtube-fill"></i> Çözüm Videosu İzle</a>`;
  } else if (feedback.actionType === "practice" && feedback.practiceQuestions) {
    action.innerHTML = `<button onclick="addExtraPractice('${feedback.practiceQuestions}', '${feedback.topic}')" class="btn btn-primary w-full"><i class="ri-add-line"></i> ${feedback.practiceQuestions} Soru Ekle</button>`;
  }
  
  modal.classList.remove("hidden");
}

function addExtraPractice(qCount, topic) {
  state.dailyPlan.tasks.push({
    id: generateId(),
    text: `Dikkat Pratiği: ${topic}`,
    bookId: "",
    questions: parseInt(qCount) || 15,
    isDone: false
  });
  save();
  document.getElementById("mistakeResultModal").classList.add("hidden");
  showToast("Görev günlük plana eklendi!", "success");
  refreshUI();
}

function renderMistakes() {
  const container = document.getElementById("mistakeList");
  if (!container) return;
  
  if (!state.mistakes || state.mistakes.length === 0) {
    container.innerHTML = '<p class="text-xs text-muted text-center py-4">Henüz hiç yanlış analizi eklemedin.</p>';
    return;
  }
  
  let html = "";
  [...state.mistakes].reverse().forEach(m => {
    html += `
      <div class="list-item flex-col items-start gap-2">
        <div class="flex justify-between w-full">
          <p class="font-bold text-sm text-danger">${m.subject} - ${m.topic}</p>
          <span class="text-xs text-muted">${m.date}</span>
        </div>
        <div class="bg-light w-full p-2 rounded text-xs text-dark italic border-l-2 border-primary">
          ${m.feedback.message}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

/* ── Confetti ── */
function launchConfetti() {
  const colors = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(confetti);
    setTimeout(() => { if (confetti.parentNode) confetti.remove(); }, 3500);
  }
}
