/* ═══════════════════════════════════════════
   APP — Ana Başlatıcı ve Mantık
═══════════════════════════════════════════ */

const MOTIVATIONAL_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Ertelenen her iş, daha büyük bir yüke dönüşür. Şimdi başla!",
  "Hiç kimse başarı merdivenlerini elleri cebinde tırmanmamıştır.",
  "Bugün yapacağın küçük bir fedakarlık, yarının büyük başarısıdır.",
  "Zorluklar, başarının değerini artıran engellerdir.",
  "LGS sadece bir sınav, senin potansiyelin ise sınırsız!",
  "Dünün keşkeleri yerine, bugünün iyikilerini inşa et."
];

let pomodoroInterval = null;
let currentPomodoroDuration = 25; // User selected duration
let pomodoroTime = 25 * 60; // Time in seconds
let isPomodoroRunning = false;

window.addEventListener("DOMContentLoaded", () => {
  // PWA & Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW Error:', e));
  }

  // Standalone Check
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (!isStandalone && window.innerWidth < 800) {
    const pwaOverlay = document.getElementById("pwaOverlay");
    if (pwaOverlay) {
      pwaOverlay.classList.remove("hidden");
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
      const isSafari = isIOS && /webkit/.test(ua) && !/crios/.test(ua) && !/fxios/.test(ua);
      const isChrome = /chrome|crios/.test(ua) && !/edg/.test(ua);

      const step1 = document.getElementById("pwaStep1");
      const step2 = document.getElementById("pwaStep2");

      if (isSafari) {
        step1.innerHTML = 'Alt kısımdaki <strong>Paylaş</strong> ikonuna dokun.';
        step2.innerHTML = '<strong>"Ana Ekrana Ekle"</strong> seçeneğini seç.';
      } else if (isChrome) {
        step1.innerHTML = 'Sağ üstteki <strong>Menü (⋮)</strong> ikonuna dokun.';
        step2.innerHTML = '<strong>"Ana Ekrana Ekle"</strong> seçeneğini seç.';
      }
    }
  }

  // Load state
  load();
  applyTheme();

  if (username === "Sen") {
    const n = prompt("Sana nasıl hitap etmemi istersin? (İsmin veya takma adın):");
    if (n && n.trim()) { username = n.trim(); saveUsername(username); }
  }

  // Check Onboarding
  if (!state.studyLevel) {
    document.getElementById("onboardingModal").classList.remove("hidden");
  }

  // Setup Initial UI
  initChart();
  initMockChart();
  refreshUI();
  refreshChart();
  refreshMockChart();
  
  // Set Random Quote
  const quoteEl = document.getElementById("dailyQuote");
  if (quoteEl) {
    quoteEl.textContent = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }

  // Live Countdown initialization
  setInterval(updateLiveCountdown, 1000);
  updateLiveCountdown();

  // Upload zone event listeners
  const zone = document.getElementById("uploadZone");
  if (zone) {
    zone.addEventListener("click", triggerUpload);
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  }

  const imgInput = document.getElementById("imgInput");
  if (imgInput) {
    imgInput.addEventListener("change", (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });
  }

  // Chat input enter
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChat();
      }
    });
  }
  
  updatePomodoroDisplay();
});

/* ── Pomodoro Logic ── */
function updatePomodoroDisplay() {
  const display = document.getElementById("timerDisplay");
  if (!display) return;
  const m = Math.floor(pomodoroTime / 60).toString().padStart(2, "0");
  const s = (pomodoroTime % 60).toString().padStart(2, "0");
  display.textContent = `${m}:${s}`;
}

function togglePomodoro() {
  const btn = document.getElementById("btnTimerStart");
  const status = document.getElementById("pomodoroStatus");
  
  if (isPomodoroRunning) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    btn.textContent = "Devam Et";
    btn.className = "btn btn-primary";
    status.textContent = "Duraklatıldı";
    status.className = "badge bg-light-warning text-warning";
  } else {
    isPomodoroRunning = true;
    btn.textContent = "Durdur";
    btn.className = "btn btn-outline border-danger text-danger";
    status.textContent = "Odaklanılıyor";
    status.className = "badge bg-light-success text-success";
    
    pomodoroInterval = setInterval(() => {
      if (pomodoroTime > 0) {
        pomodoroTime--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        showToast("Süre doldu!", "success");
        if (currentPomodoroDuration >= 15) {
          addXp(Math.floor(currentPomodoroDuration / 2)); // Dynamic XP based on minutes
        }
        resetPomodoro();
      }
    }, 1000);
  }
}

function setPomodoroTime(mins) {
  if (isPomodoroRunning) return showToast("Çalışan sayacı durdurmadan değiştiremezsin.", "warning");
  currentPomodoroDuration = mins;
  pomodoroTime = mins * 60;
  
  const presets = document.getElementById("pomodoroPresets");
  if (presets) {
    presets.querySelectorAll('.chip').forEach(c => {
      c.classList.remove('border-primary', 'text-primary');
    });
    
    const targetText = mins === 25 ? "25 Dk" : (mins === 50 ? "50 Dk" : "Özel");
    presets.querySelectorAll('.chip').forEach(c => {
      if(c.textContent.includes(targetText) || (targetText === "Özel" && c.textContent === "Özel")) {
        c.classList.add('border-primary', 'text-primary');
      }
    });
  }
  
  updatePomodoroDisplay();
}

function promptCustomPomodoro() {
  if (isPomodoroRunning) return showToast("Çalışan sayacı durdurmadan değiştiremezsin.", "warning");
  const mins = parseInt(prompt("Kaç dakika odaklanacaksın?", "40"));
  if (mins && mins > 0) {
    if (mins > 120) {
      showToast("120 dakikadan uzun bir seans yorucu olabilir ama sana güveniyorum! İyi çalışmalar.", "warning");
    }
    setPomodoroTime(mins);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  isPomodoroRunning = false;
  pomodoroTime = currentPomodoroDuration * 60;
  
  const btn = document.getElementById("btnTimerStart");
  if (btn) {
    btn.textContent = "Başlat";
    btn.className = "btn btn-primary";
  }
  const status = document.getElementById("pomodoroStatus");
  if (status) {
    status.textContent = "Bekliyor";
    status.className = "badge bg-light text-muted";
  }
  updatePomodoroDisplay();
}

function updateLiveCountdown() {
  const lgsDate = new Date("2026-06-13T09:30:00").getTime();
  const now = new Date().getTime();
  const distance = lgsDate - now;

  if (distance < 0) {
    document.getElementById("cdDays").textContent = "00";
    document.getElementById("cdHours").textContent = "00";
    document.getElementById("cdMins").textContent = "00";
    document.getElementById("cdSecs").textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const elD = document.getElementById("cdDays");
  const elH = document.getElementById("cdHours");
  const elM = document.getElementById("cdMins");
  const elS = document.getElementById("cdSecs");

  if(elD) elD.textContent = days.toString().padStart(2, '0');
  if(elH) elH.textContent = hours.toString().padStart(2, '0');
  if(elM) elM.textContent = minutes.toString().padStart(2, '0');
  if(elS) elS.textContent = seconds.toString().padStart(2, '0');
}
