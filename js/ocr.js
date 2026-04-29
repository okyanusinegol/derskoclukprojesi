/* ═══════════════════════════════════════════
   OCR — Fotoğraf İşleme
═══════════════════════════════════════════ */

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("uploadZone").classList.remove("dragging");
  const f = e.dataTransfer?.files?.[0];
  if (f && f.type.startsWith("image/")) handleFile(f);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("uploadZone").classList.add("dragging");
}

function handleDragLeave() {
  document.getElementById("uploadZone").classList.remove("dragging");
}

async function handleFile(file) {
  if (!file) return;

  currentImageFile = file;

  const content = document.getElementById("uploadContent");
  const progress = document.getElementById("uploadProgress");
  const progText = document.getElementById("progressText");

  content.style.display = "none";
  progress.style.display = "block";
  progText.textContent = "OCR çalışıyor...";

  try {
    const worker = await Tesseract.createWorker("tur", 1, {
      logger: m => {
        if (m.status === "recognizing text") {
          progText.textContent = "OCR: %" + Math.round((m.progress || 0) * 100);
        }
      }
    });
    const { data } = await worker.recognize(file);
    await worker.terminate();

    const text = (data.text || "").trim();
    document.getElementById("ocrText").value = text;
    document.getElementById("analyzeBtn").classList.remove("hidden");
    document.getElementById("solveBtn").classList.remove("hidden");

    if (text.length > 5) {
      progText.textContent = "AI analiz ediyor...";
      await analyzeWithAI(text);
    } else {
      progText.textContent = "Metin çok kısa — soruyu elle de yazabilirsin.";
    }
  } catch (e) {
    progText.textContent = "OCR hatası: " + e.message;
    showToast("OCR hatası", "error");
  } finally {
    setTimeout(() => {
      content.style.display = "block";
      progress.style.display = "none";
    }, 1500);
  }
}

function triggerUpload() {
  document.getElementById("imgInput").click();
}

function reanalyze() {
  const text = document.getElementById("ocrText").value.trim();
  if (!text) return;
  document.getElementById("aiNote").textContent = "Analiz ediliyor...";
  analyzeWithAI(text);
}

function triggerSolve() {
  const text = document.getElementById("ocrText").value.trim();
  if (!text && !currentImageFile) {
    showToast("Önce bir soru yaz veya fotoğraf yükle", "error");
    return;
  }
  solveWithAI(text || "Bu fotoğraftaki soruyu çöz", text ? null : currentImageFile);
}
