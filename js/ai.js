/* ═══════════════════════════════════════════
   AI — Puter.js AI Entegrasyonu
═══════════════════════════════════════════ */
const AI_MODEL = "gpt-4.1-mini";

const ANALYZE_PROMPT = `Sen LGS sınavına hazırlık asistanısın. Sana bir OCR ile okunmuş veya elle yazılmış soru metni gelecek.
JSON formatında şu alanları döndür (başka hiçbir şey yazma, sadece JSON):
{
  "ders": "<Matematik|Fen|Türkçe|İnkılap|İngilizce|Din|Diğer>",
  "konu": "<kısa konu adı, max 5 kelime>",
  "ipucu": "<öğrenciye 2-3 cümle ipucu ve çalışma tavsiyesi, kesin cevabı söyleme, Türkçe>"
}`;

const SOLVE_PROMPT = `Sen LGS sınavına hazırlanan 8. sınıf öğrencilerine yardım eden uzman bir öğretmensin.
Soruyu adım adım çöz:
1. Önce soruyu kısaca analiz et (hangi ders, hangi konu)
2. Kullanılacak formül/kural/bilgiyi açıkla
3. Adım adım çözümü yaz
4. Doğru cevabı ve neden doğru olduğunu açıkla
Türkçe yaz, ortaokul seviyesinde anlaşılır şekilde açıkla. Emojiler kullanarak görsel olarak zenginleştir.`;

const COACH_PROMPT = `Sen LGS sınavına hazırlanan 8. sınıf öğrencisine yardım eden bir koç/öğretmensin.
Kurallar:
- Soru geldiğinde asla direkt cevabı söyleme
- Önce neyi anlamadığını sor, sonra küçük ipuçları ver
- Ortaokul seviyesinde konuş, pozitif ve motive edici ol
- Gereksiz uzun yazma, odaklı kal
- Türkçe konuş, emojiler kullan`;

const SOLVE_CHAT_PROMPT = `Sen LGS sınavına hazırlanan 8. sınıf öğrencisine yardım eden bir öğretmensin.
Kurallar:
- Soruları adım adım çöz ve açıkla
- Her adımda neden o işlemi yaptığını belirt
- Ortaokul seviyesinde konuş, anlaşılır ol
- Türkçe konuş, emojiler kullan`;

let chatHistory = [];
let chatMode = "coach"; // "coach" or "solve"
let currentImageFile = null;

function setChatMode(mode) {
  chatMode = mode;
  chatHistory = [];
  const msgs = document.getElementById("chatMessages");
  if (msgs) msgs.innerHTML = "";

  document.querySelectorAll(".mode-toggle button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.querySelector(`.mode-toggle button[data-mode="${mode}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const greeting = mode === "coach"
    ? "🎓 Koç modundayım! Soruyu anlatamazsan yardımcı olurum — ama cevabı direkt söylemem, ipucu veririm."
    : "✨ Çözüm modundayım! Soruyu yaz veya yapıştır, adım adım çözeyim.";
  appendChat("ai", greeting);
}

async function analyzeWithAI(text) {
  const subjectEl = document.getElementById("detectedSubject");
  const hintEl = document.getElementById("subjectHint");
  const noteEl = document.getElementById("aiNote");

  subjectEl.textContent = "...";
  noteEl.textContent = "AI analiz ediyor...";

  try {
    const response = await puter.ai.chat([
      { role: "system", content: ANALYZE_PROMPT },
      { role: "user", content: "SORU METNİ:\n" + text }
    ], false, { model: AI_MODEL });

    const result = response.message.content;
    let parsed;
    try {
      const clean = result.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      const ders = result.match(/"ders"\s*:\s*"([^"]+)"/)?.[1] || "Diğer";
      const konu = result.match(/"konu"\s*:\s*"([^"]+)"/)?.[1] || "";
      const ipucu = result.match(/"ipucu"\s*:\s*"([^"]+)"/)?.[1] || result;
      parsed = { ders, konu, ipucu };
    }

    const ders = SUBJECTS.includes(parsed.ders) ? parsed.ders : "Diğer";
    subjectEl.textContent = ders;
    subjectEl.style.color = SUBJECT_COLORS[ders] || "var(--accent)";
    hintEl.textContent = parsed.konu ? "Konu: " + parsed.konu : "Ders tespit edildi.";
    noteEl.textContent = parsed.ipucu || "Analiz alınamadı.";

    addScan(ders);
    addXp(20);
    showToast("📊 Analiz tamamlandı! +20 XP", "success");
  } catch (e) {
    subjectEl.textContent = "Hata";
    hintEl.textContent = "";
    noteEl.textContent = "AI bağlantı hatası: " + e.message;
    showToast("AI bağlantı hatası", "error");
  }
}

async function solveWithAI(text, imageFile) {
  const solutionBox = document.getElementById("solutionBox");
  const solveBtn = document.getElementById("solveBtn");
  if (!solutionBox) return;

  solutionBox.textContent = "";
  solutionBox.classList.add("streaming");
  solutionBox.innerHTML = '<span class="cursor-blink"></span>';
  if (solveBtn) solveBtn.disabled = true;

  try {
    let response;
    if (imageFile) {
      response = await puter.ai.chat(
        SOLVE_PROMPT + "\n\nBu fotoğraftaki soruyu çöz.",
        imageFile, false, { model: AI_MODEL, stream: true }
      );
    } else {
      response = await puter.ai.chat([
        { role: "system", content: SOLVE_PROMPT },
        { role: "user", content: text }
      ], false, { model: AI_MODEL, stream: true });
    }

    let fullText = "";
    for await (const chunk of response) {
      if (chunk?.text) {
        fullText += chunk.text;
        solutionBox.innerHTML = fullText + '<span class="cursor-blink"></span>';
        solutionBox.scrollTop = solutionBox.scrollHeight;
      }
    }
    solutionBox.textContent = fullText;
    solutionBox.classList.remove("streaming");
    addXp(30);
    showToast("🧠 Çözüm tamamlandı! +30 XP", "success");
  } catch (e) {
    solutionBox.textContent = "Çözüm alınamadı: " + e.message;
    solutionBox.classList.remove("streaming");
    showToast("Çözüm hatası: " + e.message, "error");
  } finally {
    if (solveBtn) solveBtn.disabled = false;
  }
}

async function sendChat() {
  const inp = document.getElementById("chatInput");
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = "";

  appendChat("user", msg);
  chatHistory.push({ role: "user", content: msg });

  const thinking = appendChat("ai", "Düşünüyorum...");
  thinking.classList.add("thinking");

  const systemPrompt = chatMode === "coach" ? COACH_PROMPT : SOLVE_CHAT_PROMPT;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await puter.ai.chat(messages, false, {
      model: AI_MODEL, stream: true
    });

    thinking.textContent = "";
    thinking.classList.remove("thinking");

    let fullText = "";
    for await (const chunk of response) {
      if (chunk?.text) {
        fullText += chunk.text;
        thinking.textContent = fullText;
        const box = document.getElementById("chatMessages");
        if (box) box.scrollTop = box.scrollHeight;
      }
    }

    chatHistory.push({ role: "assistant", content: fullText });
  } catch (e) {
    thinking.textContent = "Bağlantı hatası: " + e.message;
    thinking.classList.remove("thinking");
    thinking.style.color = "var(--danger)";
  }
}
