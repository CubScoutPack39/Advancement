(function(){
  const MAIN_KEY = "cubScoutAdvancementTracker_v2";
  const FALLBACK_KEY = "cubScoutAdvancementTracker_nextAward_v1";

  function readRawState(){
    try { return JSON.parse(localStorage.getItem(MAIN_KEY) || "null") || {}; }
    catch(e) { return {}; }
  }

  function savedDate(){
    const raw = readRawState();
    return raw.nextAward || localStorage.getItem(FALLBACK_KEY) || "";
  }

  // Preserve the Next Award value when the main app reloads state (including Restore Data).
  try {
    const originalLoad = load;
    load = function(){
      const raw = readRawState();
      const loaded = originalLoad();
      loaded.nextAward = raw.nextAward || localStorage.getItem(FALLBACK_KEY) || "";
      return loaded;
    };
  } catch(e) {}

  const style = document.createElement("style");
  style.textContent = `
    .meta{grid-template-columns:2fr 1fr 1fr 1fr auto}
    .next-award-field input{font-variant-numeric:tabular-nums}
    .award-countdown{background:#fff;border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:132px;display:flex;flex-direction:column;justify-content:center;text-align:center}
    .award-countdown b{font-size:20px;line-height:1.05;color:#17365D;font-variant-numeric:tabular-nums}
    .award-countdown small{margin-top:4px;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#65717d;font-weight:800}
    .award-countdown.today{background:#fff6d8;border-color:#e0c56b}
    .award-countdown.past{background:#f2f4f6;color:#69737d}
    @media(max-width:1050px){.meta{grid-template-columns:1.5fr 1fr 1fr}.award-countdown{min-height:58px}}
    @media(max-width:800px){.meta{grid-template-columns:1fr}.award-countdown{min-height:58px}}
    @media print{.award-countdown{box-shadow:none}}
  `;
  document.head.appendChild(style);

  const meta = document.querySelector(".meta");
  if (!meta || document.getElementById("nextAward")) return;

  const label = document.createElement("label");
  label.className = "next-award-field";
  label.innerHTML = 'Next Award<input id="nextAward" type="date" aria-label="Next award ceremony date">';

  const countdown = document.createElement("div");
  countdown.id = "awardCountdown";
  countdown.className = "award-countdown";
  countdown.innerHTML = '<b>—</b><small>Days until awards</small>';

  meta.appendChild(label);
  meta.appendChild(countdown);

  const input = document.getElementById("nextAward");
  input.value = savedDate();

  try { S.nextAward = input.value; } catch(e) {}

  function persist(){
    const value = input.value || "";
    localStorage.setItem(FALLBACK_KEY, value);
    try {
      S.nextAward = value;
      save();
    } catch(e) {
      const raw = readRawState();
      raw.nextAward = value;
      localStorage.setItem(MAIN_KEY, JSON.stringify(raw));
    }
  }

  function dayDiff(value){
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const target = new Date(parts[0], parts[1]-1, parts[2]);
    target.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return Math.round((target - today) / 86400000);
  }

  function updateCountdown(){
    const diff = dayDiff(input.value);
    countdown.classList.remove("today","past");
    const number = countdown.querySelector("b");
    const caption = countdown.querySelector("small");

    if (diff === null){
      number.textContent = "—";
      caption.textContent = "Set award date";
    } else if (diff === 0){
      number.textContent = "Today";
      caption.textContent = "Awards ceremony";
      countdown.classList.add("today");
    } else if (diff > 0){
      number.textContent = String(diff);
      caption.textContent = diff === 1 ? "Day left" : "Days left";
    } else {
      number.textContent = String(Math.abs(diff));
      caption.textContent = Math.abs(diff) === 1 ? "Day ago" : "Days ago";
      countdown.classList.add("past");
    }
  }

  input.addEventListener("change", function(){ persist(); updateCountdown(); });
  input.addEventListener("input", function(){ persist(); updateCountdown(); });
  updateCountdown();
  setInterval(updateCountdown, 60 * 60 * 1000);

  // After Restore Data, refresh the displayed ceremony date from the restored backup.
  const restoreInput = document.getElementById("file");
  if (restoreInput){
    restoreInput.addEventListener("change", function(){
      setTimeout(function(){
        try { input.value = (typeof S !== "undefined" && S.nextAward) ? S.nextAward : savedDate(); }
        catch(e) { input.value = savedDate(); }
        persist();
        updateCountdown();
      }, 250);
    }, true);
  }
})();
