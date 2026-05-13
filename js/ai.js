/* ═══════════════════════════════════════════
   AI — Puter.js AI Entegrasyonu
═══════════════════════════════════════════ */
const AI_MODEL = "gpt-4.1-mini";

const ANALYZE_PROMPT = `Sen LGS sınavına hazırlık asistanısın. Sana bir OCR ile okunmuş veya elle yazılmış soru metni gelecek.
Eğer metnin içinde "grafik", "harita", "tablo", "şekle göre", "yandaki", "görsel" gibi kelimeler geçiyorsa veya sorunun eksik olduğunu/sadece görselle anlaşılabileceğini düşünüyorsan gorselGerekli alanını true yap.
JSON formatında şu alanları döndür (başka hiçbir şey yazma, sadece JSON):
{
  "ders": "<Matematik|Fen|Türkçe|İnkılap|İngilizce|Din|Diğer>",
  "konu": "<kısa konu adı, max 5 kelime>",
  "ipucu": "<öğrenciye 2-3 cümle ipucu ve çalışma tavsiyesi, kesin cevabı söyleme, Türkçe>",
  "gorselGerekli": <true veya false>
}`;

const SOLVE_PROMPT = `Sen LGS sınavına hazırlanan 8. sınıf öğrencilerine yardım eden uzman bir öğretmensin.
Soruyu adım adım çöz:
1. Önce soruyu kısaca analiz et (hangi ders, hangi konu)
2. Kullanılacak formül/kural/bilgiyi açıkla
3. Adım adım çözümü yaz
4. Doğru cevabı ve neden doğru olduğunu açıkla
Türkçe yaz, ortaokul seviyesinde anlaşılır şekilde açıkla. Emojiler kullanarak görsel olarak zenginleştir.`;

function getCoachPrompt() {
  const activeBooks = state.library.filter(b => !b.finished);
  const booksData = activeBooks.map(b => ({ id: b.id, name: b.name, subject: b.subject }));
  
  return `Sen LGS sınavına hazırlanan 8. sınıf öğrencisine yardım eden bir eğitim koçusun.
Kurallar:
- Soru sorarsa veya tavsiye isterse destekleyici, motive edici ve rehberlik eden bir dille yanıt ver.
- Eğer öğrenci çalışma programı yapmanı, değiştirmesini veya yeni bir görev eklemeni isterse, elindeki aktif kitaplara göre bir plan oluştur.
- ÖĞRENCİNİN AKTİF KİTAPLARI: ${JSON.stringify(booksData)}
- ÖNEMLİ: Eğer öğrencinin programını güncelliyorsan, metin cevabının HERHANGİ BİR YERİNE mutlaka şu formatta bir JSON bloğu ekle (bunu sistem algılayıp uygulayacaktır):
\`\`\`plan
[
  { "bookId": "ilgili_kitabin_id_si", "text": "Görev açıklaması (örn: Matematik Çarpanlar Test 1)", "questions": 20 }
]
\`\`\`
- Her zaman Türkçe konuş, bolca emoji kullan.`;
}

const PLAN_PROMPT = `Sen bir LGS rehberlik uzmanısın. Öğrencinin sana verdiği aktif kitapları ve günlük soru hedefini kullanarak mantıklı bir görev dağılımı yapacaksın.
KRİTİK KURALLAR (ANTI-HALÜSİNASYON):
1. Fiziksel kitapların içeriğini bilemeyeceğin için ASLA "Test 3'ü çöz", "Sayfa 45'ten başla" gibi spesifik bilgiler uydurma.
2. Çıktıda yalnızca kullanıcının elindeki kitapların isimlerini kullan ve her kitap için çözülmesi gereken TAHMİNİ soru sayısını belirle. Toplam soru sayısı hedefe yakın olmalıdır.
3. Çıktı KESİNLİKLE VE YALNIZCA geçerli bir JSON array olmalıdır. Başka hiçbir açıklama yazma.
Örnek Format:
[
  { "bookId": "verilenId", "text": "[Kitap Adı] kitabından yaklaşık 40 soru çöz", "questions": 40 }
]
`;

const MISTAKE_ANALYSIS_PROMPT = `Sen uzman bir LGS Eğitim Koçusun. Öğrenci denemede yanlış yaptığı bir sorunun analizini veriyor.
Aşağıdaki 'Hata Nedeni' (A, B veya C) durumuna göre JSON formatında kesin ve motive edici bir yanıt dönmelisin.
A: "Konuyu Hiç Anlamadım"
B: "Konuyu Anladım Ama Dikkat/Okuma Hatası Yaptım"
C: "Konuyu Biliyorum Ama Bu Tarz (Yeni Nesil) Soru Görmemiştim"

DERSLERE GÖRE KALİTELİ YOUTUBE KANALLARI (BUNLARIN DIŞINA ÇIKMA):
- Matematik: Rehber Matematik, Partikül Matematik, Şenol Hoca
- Fen: Tonguç Akademi, Benim Hocam, VIP Fizik
- Türkçe: Rüştü Hoca, Tonguç Akademi, Benim Hocam
- İnkılap: Sadettin Akyayla, Tonguç Akademi, Benim Hocam
- İngilizce: Tonguç Akademi, Benim Hocam
- Din: Tonguç Akademi, Benim Hocam

KURALLAR (ANTI-HALÜSİNASYON):
Eğer Seçim A ise: "actionType" "video" olmalı. "link" alanına "https://www.youtube.com/results?search_query=" formatında doğrudan ve SADECE öğrencinin DERSİNE UYGUN yukarıdaki kaliteli LGS kanallarını içeren bir URL üret. Örn: Fen dersi için "https://www.youtube.com/results?search_query=Tonguç+Akademi+LGS+Fen+Elektrik". Asla Matematik hocasını Fen için önerme! Asla spesifik video linki (watch?v=) uydurma, çünkü link bozuk çıkar. Sadece search_query linki ver.
Eğer Seçim B ise: "actionType" "practice" olmalı. "practiceQuestions" alanına 15-20 arası bir sayı ver.
Eğer Seçim C ise: "actionType" "video" veya "tactic" olabilir. Yeni nesil soru çözme taktikleri ver ve soru tarzına uygun arama linki koy.

ÇIKTI FORMATI SADECE JSON OLACAKTIR:
{
  "message": "<Öğrenciye sıcak, motive edici tavsiye metni>",
  "actionType": "<video | practice | tactic>",
  "link": "<A veya C ise arama linki, yoksa boş>",
  "practiceQuestions": <B ise soru sayısı, yoksa 0>
}`;


let chatHistory = [];
let isFirstChat = true;

/* ── Pollinations AI Helper ── */
async function fetchPollinations(messages) {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages,
      model: 'openai',
      jsonMode: false
    })
  });
  if (!response.ok) throw new Error("Yapay zeka bağlantı hatası");
  return await response.text();
}

/* ── AI Analysis ── */
async function analyzeWithAI(text) {
  const subjectEl = document.getElementById("detectedSubject");
  const hintEl = document.getElementById("subjectHint");
  const noteEl = document.getElementById("aiNote");

  subjectEl.textContent = "...";
  noteEl.textContent = "AI analiz ediyor...";

  try {
    const result = await fetchPollinations([
      { role: "system", content: ANALYZE_PROMPT },
      { role: "user", content: "SORU METNİ:\n" + text }
    ]);

    let parsed;
    try {
      const clean = result.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      const ders = result.match(/"ders"\s*:\s*"([^"]+)"/)?.[1] || "Diğer";
      const konu = result.match(/"konu"\s*:\s*"([^"]+)"/)?.[1] || "";
      const ipucu = result.match(/"ipucu"\s*:\s*"([^"]+)"/)?.[1] || result;
      const gorselGerekli = result.includes('"gorselGerekli": true') || result.includes('"gorselGerekli":true');
      parsed = { ders, konu, ipucu, gorselGerekli };
    }

    const ders = SUBJECTS.includes(parsed.ders) ? parsed.ders : "Diğer";
    subjectEl.textContent = ders;
    subjectEl.dataset.visionNeeded = parsed.gorselGerekli ? "true" : "false";
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

/* ── AI Solve ── */
async function solveWithAI(text, imageFile) {
  const solutionBox = document.getElementById("solutionBox");
  const solveBtn = document.getElementById("solveBtn");
  const detectedSubject = document.getElementById("detectedSubject")?.textContent;
  if (!solutionBox) return;

  solutionBox.textContent = "";
  solutionBox.innerHTML = '<span class="cursor-blink"></span>';
  if (solveBtn) solveBtn.disabled = true;

  try {
    let fullText = "";
    
    // Hibrit Sistem: AI görsel gerekli dediyse (harita, grafik vs.) veya Matematikse ve Fotoğraf varsa Puter (Vision) kullan
    const visionNeeded = document.getElementById("detectedSubject")?.dataset?.visionNeeded === "true";
    if (imageFile && (detectedSubject === "Matematik" || visionNeeded)) {
      const response = await puter.ai.chat(
        SOLVE_PROMPT + "\n\nBu fotoğraftaki soruyu çöz.",
        imageFile, false, { model: AI_MODEL, stream: true }
      );
      
      for await (const chunk of response) {
        if (chunk?.text) {
          fullText += chunk.text;
          solutionBox.innerHTML = fullText + '<span class="cursor-blink"></span>';
        }
      }
    } else {
      // Sözel dersler veya sadece metin varsa Pollinations (Text) kullan
      fullText = await fetchPollinations([
        { role: "system", content: SOLVE_PROMPT },
        { role: "user", content: text }
      ]);
      solutionBox.innerHTML = fullText + '<span class="cursor-blink"></span>';
    }

    solutionBox.textContent = fullText;
    addXp(30);
    showToast("🧠 Çözüm tamamlandı! +30 XP", "success");
  } catch (e) {
    solutionBox.textContent = "Çözüm alınamadı: " + e.message;
    showToast("Çözüm hatası: " + e.message, "error");
  } finally {
    if (solveBtn) solveBtn.disabled = false;
  }
}

/* ── AI Coach Chat ── */
async function sendChat(msgOverride) {
  const inp = document.getElementById("chatInput");
  const msg = msgOverride || inp.value.trim();
  if (!msg) return;
  if (!msgOverride) inp.value = "";

  if (isFirstChat) {
    const msgs = document.getElementById("chatMessages");
    if (msgs && msgs.children.length === 0) {
      appendChat("ai", "Merhaba! Ben senin LGS Koçunum. Sana nasıl yardımcı olabilirim? Çalışma programı yapabiliriz veya motivasyon verebilirim! 😊");
    }
    isFirstChat = false;
  }

  appendChat("user", msg);
  chatHistory.push({ role: "user", content: msg });

  const thinking = appendChat("ai", "Düşünüyorum...");
  thinking.classList.add("thinking");

  try {
    const messages = [
      { role: "system", content: getCoachPrompt() },
      ...chatHistory.map(m => ({ role: m.role, content: m.content }))
    ];

    let result = await fetchPollinations(messages);

    // Agentic Plan Parsing
    const planMatch = result.match(/```plan\n([\s\S]*?)```/);
    if (planMatch) {
       try {
         const planData = JSON.parse(planMatch[1]);
         state.dailyPlan.tasks = planData.map(p => ({
            id: generateId(),
            bookId: p.bookId || "",
            text: p.text || "Görev",
            questions: parseInt(p.questions) || 0,
            isDone: false
         }));
         save();
         if(typeof renderDailyPlan === 'function') renderDailyPlan();
         
         // Remove JSON block from the user-facing text and append success message
         result = result.replace(planMatch[0], "").trim() + "\n\n✅ *Arka planda programını güncelledim! Plan sekmesinden kontrol edebilirsin.*";
       } catch(e) {
         console.error("Plan ayrıştırma hatası", e);
       }
    }

    thinking.textContent = result;
    thinking.classList.remove("thinking");
    
    const box = document.getElementById("chatMessages");
    if (box) box.scrollTop = box.scrollHeight;

    chatHistory.push({ role: "assistant", content: result });
  } catch (e) {
    thinking.textContent = "Bağlantı hatası: " + e.message;
    thinking.classList.remove("thinking");
    thinking.classList.add("text-danger");
  }
}

function quickChat(msg) {
  switchTab('coach');
  sendChat(msg);
}

/* ── AI Plan Generator ── */
async function generateAIPlan() {
  const activeBooks = state.library.filter(b => !b.finished);
  if (activeBooks.length === 0) {
    showToast("Plan yapabilmek için Kütüphane'ye en az 1 aktif kitap eklemelisin.", "warning");
    return;
  }

  const target = state.dailyPlan.targetQuestions || 100;
  
  const booksData = activeBooks.map(b => ({ id: b.id, name: b.name, subject: b.subject, difficulty: b.difficulty }));
  const userMessage = `Günlük Hedef: ${target} Soru.\nAktif Kaynaklarım: ${JSON.stringify(booksData)}`;

  showToast("Yapay zeka programını hazırlıyor...", "info");

  try {
    const result = await fetchPollinations([
      { role: "system", content: PLAN_PROMPT },
      { role: "user", content: userMessage }
    ]);

    let parsed;
    try {
      const clean = result.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      showToast("AI yanıtı parse edilemedi.", "error");
      return;
    }

    if (!Array.isArray(parsed)) {
      showToast("AI geçersiz bir format döndürdü.", "error");
      return;
    }

    // Assign IDs and clear old tasks
    state.dailyPlan.tasks = parsed.map(p => ({
      id: generateId(),
      bookId: p.bookId || "",
      text: p.text || "Görev",
      questions: parseInt(p.questions) || 0,
      isDone: false
    }));
    
    save();
    renderDailyPlan();
    showToast("Günün planı AI tarafından oluşturuldu!", "success");

  } catch (e) {
    showToast("AI Plan hatası: " + e.message, "error");
  }
}

/* ── Mistake Analysis AI ── */
async function analyzeMistakeAI(subject, topic, reason) {
  const reasonMap = {
    "A": "Konuyu Hiç Anlamadım",
    "B": "Konuyu Anladım Ama Dikkat/Okuma Hatası Yaptım",
    "C": "Konuyu Biliyorum Ama Bu Tarz (Yeni Nesil) Soru Görmemiştim"
  };
  
  const userMessage = `Ders: ${subject}\nKonu: ${topic}\nHata Nedeni: ${reasonMap[reason]}`;
  
  try {
    const result = await fetchPollinations([
      { role: "system", content: MISTAKE_ANALYSIS_PROMPT },
      { role: "user", content: userMessage }
    ]);

    try {
      const clean = result.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch (e) {
      console.error("Mistake AI JSON Parse Error", result);
      return {
        message: "Analiz tamamlandı fakat format hatası oluştu. Lütfen bu konu üzerine test çözmeye devam et.",
        actionType: "tactic"
      };
    }
  } catch (error) {
    return {
        message: "Bağlantı hatası oluştu. Tavsiye alınamadı.",
        actionType: "tactic"
    };
  }
}
