/* ═══════════════════════════════════════════
   GAMIFICATION — XP, Seviye, Liderlik
═══════════════════════════════════════════ */


function level(xp) { return Math.floor(xp / 100) + 1; }
function xpInLevel(xp) { return xp % 100; }

function levelTitle(lv) {
  const titles = ["LGS Acemi","LGS Başlangıç","Çalışkan Kalem","Soru Avcısı",
    "Formül Ustası","LGS Savaşçısı","Deha Adayı","LGS Yıldızı","Efsane","LGS Şampiyonu"];
  return titles[Math.min(lv - 1, titles.length - 1)] || "LGS Şampiyonu";
}

function addXp(n) {
  const oldLv = level(state.xp);
  state.xp += n;
  save();
  refreshUI();
  const newLv = level(state.xp);
  if (newLv > oldLv) {
    showToast("🎉 Seviye " + newLv + " — " + levelTitle(newLv), "success");
  }
}

function addScan(subject) {
  state.totalScans++;
  state.errorsBySubject[subject] = (state.errorsBySubject[subject] || 0) + 1;
  save();
  refreshUI();
  refreshChart();
}


