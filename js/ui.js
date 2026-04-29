/* ═══════════════════════════════════════════
   UI — Arayüz Güncellemeleri
═══════════════════════════════════════════ */
let chart = null;
let chatOpen = false;

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

}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setStyle(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = val;
}



/* ── Chart ── */
function initChart() {
  const canvas = document.getElementById("subjectChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const labels = Object.keys(state.errorsBySubject);
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: labels.map(k => state.errorsBySubject[k]),
        backgroundColor: labels.map(k => SUBJECT_COLORS[k] || "#94a3b8"),
        borderColor: "rgba(5,8,15,0.8)", borderWidth: 3, hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "65%",
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
  chart.data.datasets[0].data = labels.map(k => state.errorsBySubject[k]);
  chart.update();

  const bd = document.getElementById("subjectBreakdown");
  if (!bd) return;
  bd.innerHTML = "";
  const total = state.totalScans || 1;
  labels.forEach(k => {
    const v = state.errorsBySubject[k] || 0;
    if (v === 0) return;
    const pct = Math.round(v / total * 100);
    const div = document.createElement("div");
    div.style.cssText = "display:flex;align-items:center;gap:8px;";
    div.innerHTML =
      '<span style="width:8px;height:8px;border-radius:50%;background:' + (SUBJECT_COLORS[k]||'#94a3b8') + ';flex-shrink:0"></span>' +
      '<span style="font-size:0.75rem;flex:1;color:var(--text)">' + k + '</span>' +
      '<span class="font-mono" style="font-size:0.7rem;color:var(--muted)">' + v + '</span>' +
      '<div style="width:60px;height:4px;border-radius:99px;background:rgba(255,255,255,0.06);overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + (SUBJECT_COLORS[k]||'#94a3b8') + ';border-radius:99px"></div>' +
      '</div>';
    bd.appendChild(div);
  });
}

/* ── Chat Toggle ── */
function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById("chatPanel");
  const toggle = document.getElementById("chatToggle");
  const dot = document.getElementById("chatDot");

  if (chatOpen) {
    panel.classList.remove("hidden-panel");
    toggle.style.display = "none";
    if (dot) dot.style.display = "none";
    if (chatHistory.length === 0) {
      setChatMode(chatMode);
    }
  } else {
    panel.classList.add("hidden-panel");
    toggle.style.display = "flex";
  }
}

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
  if (!confirm("Tüm veriler silinecek. Emin misin?")) return;
  state = { xp:0, totalScans:0, errorsBySubject:{"Matematik":0,"Fen":0,"Türkçe":0,"İnkılap":0,"İngilizce":0,"Din":0,"Diğer":0} };
  save(); refreshUI(); refreshChart();
  const ocrText = document.getElementById("ocrText");
  if (ocrText) ocrText.value = "";
  setText("detectedSubject", "—");
  setText("subjectHint", "Soru tarandığında burada görünür");
  setText("aiNote", "Henüz analiz yok.");
  const sb = document.getElementById("solutionBox");
  if (sb) sb.textContent = "Bir soruyu tarayıp \"Çöz!\" butonuna basınca adım adım çözüm burada belirecek.";
  currentImageFile = null;
}

function changeUsername() {
  const n = prompt("Yeni isim veya takma adın:", username);
  if (n && n.trim()) { username = n.trim(); saveUsername(username); refreshUI(); }
}
