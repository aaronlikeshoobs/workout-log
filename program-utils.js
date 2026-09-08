// Shared program/exercise logic — used by both the Training Log app itself and the
// Hub's TODAY card. Loaded as a plain <script> tag; both apps live under the same
// GitHub Pages origin (aaronlikeshoobs.github.io), so no CORS/module setup is needed.
//
// This exists because the Hub reads program.json/data.json directly (it doesn't go
// through the Training Log app), which meant "which week is active", "is this exercise
// done", and a couple of small date/target-parsing helpers were being hand-copied into
// the Hub and had already drifted out of sync once. One copy now, loaded by both.
(function (global) {
  const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  function todayName() {
    return DAY_ORDER[(new Date().getDay() + 6) % 7];
  }

  // "4 x 6" -> {sets:4, reps:6}. Used to know how many sets/reps an exercise targets.
  function parseSetsReps(target) {
    const m = (target || "").match(/(\d+)\s*x\s*(\d+)/i);
    return m ? { sets: parseInt(m[1], 10), reps: parseInt(m[2], 10) } : null;
  }

  function isWeightExercise(ex) {
    const t = (ex.target || "").toLowerCase();
    const g = (ex.goal || "").toLowerCase();
    if (g === "n/a" || g === "bodyweight") return false;
    if (t.includes("min") || t.includes("as needed")) return false;
    return true;
  }

  // log: the data.json entry for this exercise this week (or undefined). ex: the
  // program.json exercise definition.
  function isExerciseComplete(log, ex) {
    if (!log) return false;
    if (isWeightExercise(ex)) {
      const sr = parseSetsReps(ex.target);
      const target = sr ? sr.sets : 1;
      return (log.sets || []).length >= target;
    }
    return !!log.done;
  }

  // Picks the latest week that's actually started (no startDate, or startDate already
  // passed) rather than just the highest week number — so a future week added ahead of
  // time doesn't silently become "current" before its Monday arrives.
  function resolveActiveWeek(PROGRAM, todayStr) {
    const weeks = Object.keys(PROGRAM).map(Number).sort((a, b) => a - b);
    const activeWeeks = weeks.filter((w) => !PROGRAM[w].startDate || PROGRAM[w].startDate <= todayStr);
    const pool = activeWeeks.length ? activeWeeks : weeks;
    return pool[pool.length - 1];
  }

  global.ProgramUtils = {
    DAY_ORDER: DAY_ORDER,
    todayName: todayName,
    parseSetsReps: parseSetsReps,
    isWeightExercise: isWeightExercise,
    isExerciseComplete: isExerciseComplete,
    resolveActiveWeek: resolveActiveWeek,
  };
})(window);
