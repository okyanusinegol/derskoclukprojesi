/* ═══════════════════════════════════════════
   APP — Ana Başlatıcı
═══════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
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
