/* ═══════════════════════════════════════════
   STORAGE — LocalStorage Yönetimi
═══════════════════════════════════════════ */
const STORAGE_KEY = "lgs_koc_v4";
const NAME_KEY = "lgs_name_v4";

const SUBJECTS = ["Matematik", "Fen", "Türkçe", "İnkılap", "İngilizce", "Din", "Diğer"];
const DIFFICULTIES = ["Kolay", "Orta", "Zor"];

let state = {
  xp: 0, 
  totalScans: 0,
  errorsBySubject: { "Matematik":0,"Fen":0,"Türkçe":0,"İnkılap":0,"İngilizce":0,"Din":0,"Diğer":0 },
  
  // Yeni Özellikler:
  studyLevel: null, // 1, 2 veya 3
  library: [], // { id, name, subject, difficulty, finished }
  dailyPlan: {
    date: "", // "YYYY-MM-DD"
    targetQuestions: 0,
    tasks: [] // { id, text, isDone, bookId }
  },
  historicalStats: {}, // "YYYY-MM-DD": { target, solved, extra }
  gamificationEntity: 1, // 1: Tohum, 2: Filiz, 3: Fidan, 4: Ağaç, 5: Orman
  theme: "light",
  mockExams: [], // { id, date, name, nets: {}, score }
  targetSchool: { name: "", score: 0 },
  mistakes: [] // { id, date, subject, topic, reason, feedback }
};
let username = "Sen";

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const p = JSON.parse(s);
      state = { ...state, ...p, errorsBySubject: { ...state.errorsBySubject, ...(p.errorsBySubject||{}) } };
      
      // Ensure arrays/objects exist if they were missing in older versions
      if (!state.library) state.library = [];
      if (!state.dailyPlan) state.dailyPlan = { date: "", targetQuestions: 0, tasks: [] };
      if (!state.historicalStats) state.historicalStats = {};
      if (!state.gamificationEntity) state.gamificationEntity = 1;
      if (!state.mockExams) state.mockExams = [];
      if (!state.targetSchool) state.targetSchool = { name: "", score: 0 };
      if (!state.mistakes) state.mistakes = [];
    }
    const n = localStorage.getItem(NAME_KEY);
    if (n) username = n;
  } catch(e) { console.warn("Storage load hatası:", e); }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

function saveUsername(n) {
  try { localStorage.setItem(NAME_KEY, n); } catch(e) {}
}

// Generate unique ID helper
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tarih helper
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
