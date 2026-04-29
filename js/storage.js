/* ═══════════════════════════════════════════
   STORAGE — LocalStorage Yönetimi
═══════════════════════════════════════════ */
const STORAGE_KEY = "lgs_koc_v3";
const NAME_KEY = "lgs_name_v3";

const SUBJECTS = ["Matematik", "Fen", "Türkçe", "İnkılap", "İngilizce", "Din", "Diğer"];
const SUBJECT_COLORS = {
  "Matematik": "#00ffb3", "Fen": "#00c8ff", "Türkçe": "#a78bfa",
  "İnkılap": "#f97316", "İngilizce": "#eab308", "Din": "#f43f5e", "Diğer": "#94a3b8"
};

let state = {
  xp: 0, totalScans: 0,
  errorsBySubject: { "Matematik":0,"Fen":0,"Türkçe":0,"İnkılap":0,"İngilizce":0,"Din":0,"Diğer":0 }
};
let username = "Sen";

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const p = JSON.parse(s);
      state = { ...state, ...p, errorsBySubject: { ...state.errorsBySubject, ...(p.errorsBySubject||{}) } };
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
