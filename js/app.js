/* ═══════════════════════════════════════════
   APP — Ana Başlatıcı
═══════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  // PWA & Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  // Standalone Check (Eğer tarayıcıda açılmışsa uyarı göster)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  // Mobil veya dar ekranlarda uyarıyı göster
  if (!isStandalone && window.innerWidth < 800) {
    const pwaOverlay = document.getElementById("pwaOverlay");
    if (pwaOverlay) {
      pwaOverlay.classList.remove("hidden");
      
      // Tarayıcı Tespiti ve Özel Talimatlar
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
      const isSafari = isIOS && /webkit/.test(ua) && !/crios/.test(ua) && !/fxios/.test(ua);
      const isChrome = /chrome|crios/.test(ua) && !/edg/.test(ua);

      const step1 = document.getElementById("pwaStep1");
      const step2 = document.getElementById("pwaStep2");

      if (isSafari) {
        step1.innerHTML = 'Alt kısımdaki <strong style="color:var(--accent)">Paylaş (Kare ve Ok ⍐)</strong> ikonuna dokun.';
        step2.innerHTML = 'Menüyü aşağı kaydır ve <strong style="color:var(--accent)">"Ana Ekrana Ekle"</strong> seçeneğini seç.';
      } else if (isChrome) {
        step1.innerHTML = 'Sağ üstteki <strong style="color:var(--accent)">Menü (⋮)</strong> ikonuna dokun.';
        step2.innerHTML = 'Açılan menüden <strong style="color:var(--accent)">"Ana Ekrana Ekle"</strong> (veya Uygulamayı Yükle) seçeneğini seç.';
      }
    }
  }

  load();

  if (username === "Sen") {
    const n = prompt("Sana nasıl hitap etmemi istersin? (İsmin veya takma adın):");
    if (n && n.trim()) { username = n.trim(); saveUsername(username); }
  }

  initChart();
  refreshUI();
  refreshChart();

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

  // Show chat notification dot after 3s
  setTimeout(() => {
    if (!chatOpen) {
      const dot = document.getElementById("chatDot");
      if (dot) dot.style.display = "block";
    }
  }, 3000);
});
