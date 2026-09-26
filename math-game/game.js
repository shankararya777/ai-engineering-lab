/**
 * Math Sprint - browser UI controller.
 * Depends on MathLogic (logic.js) being loaded first.
 */
(function () {
  "use strict";

  const { GAME_DURATION, DIFFICULTIES, generateQuestion, parseAnswer, accuracy, formatTime } =
    window.MathLogic;

  // ----- DOM references -----
  const $ = (id) => document.getElementById(id);
  const screens = { start: $("start-screen"), game: $("game-screen"), end: $("end-screen") };
  const el = {
    startBtn: $("start-btn"),
    startBest: $("start-best"),
    timer: $("timer"),
    timebarFill: $("timebar-fill"),
    score: $("score"),
    streak: $("streak"),
    question: $("question"),
    form: $("answer-form"),
    answer: $("answer"),
    feedback: $("feedback"),
    skipBtn: $("skip-btn"),
    quitBtn: $("quit-btn"),
    endTitle: $("end-title"),
    finalScore: $("final-score"),
    newBest: $("new-best"),
    sumLevel: $("sum-level"),
    sumCorrect: $("sum-correct"),
    sumWrong: $("sum-wrong"),
    sumAccuracy: $("sum-accuracy"),
    sumStreak: $("sum-streak"),
    sumBest: $("sum-best"),
    restartBtn: $("restart-btn"),
    menuBtn: $("menu-btn"),
  };

  // ----- Game state -----
  let state = null;
  let tickHandle = null;

  // ----- Best-score storage (localStorage can throw in private mode) -----
  const BEST_KEY = "mathSprint.best.";
  function getBest(level) {
    try {
      return Number(localStorage.getItem(BEST_KEY + level)) || 0;
    } catch (e) {
      return 0;
    }
  }
  function setBest(level, value) {
    try {
      localStorage.setItem(BEST_KEY + level, String(value));
    } catch (e) {
      /* storage unavailable - best score just won't persist */
    }
  }

  function selectedLevel() {
    const checked = document.querySelector('input[name="difficulty"]:checked');
    return checked && DIFFICULTIES[checked.value] ? checked.value : "easy";
  }

  function showScreen(name) {
    Object.keys(screens).forEach((key) => {
      screens[key].hidden = key !== name;
    });
  }

  function updateStartBest() {
    const level = selectedLevel();
    const best = getBest(level);
    el.startBest.textContent = best
      ? "Your best on " + DIFFICULTIES[level].label + ": " + best
      : "No best score yet on " + DIFFICULTIES[level].label + " - set one!";
  }

  function setFeedback(message, kind) {
    el.feedback.textContent = message;
    el.feedback.className = "feedback" + (kind ? " " + kind : "");
  }

  // ----- Game flow -----
  function startGame() {
    const level = selectedLevel();
    state = {
      level,
      score: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
      question: null,
      // Using a wall-clock deadline keeps the timer accurate even if the
      // browser throttles setInterval (e.g. when the tab is in the background).
      endsAt: Date.now() + GAME_DURATION * 1000,
    };

    el.score.textContent = "0";
    el.streak.textContent = "0";
    setFeedback("Type your answer and press Enter.", "info");
    showScreen("game");
    nextQuestion();
    renderTimer();

    clearInterval(tickHandle);
    tickHandle = setInterval(renderTimer, 200);
  }

  function nextQuestion() {
    let q;
    // Avoid showing the exact same question twice in a row.
    do {
      q = generateQuestion(state.level);
    } while (state.question && q.text === state.question.text);
    state.question = q;
    el.question.textContent = q.text + " = ?";
    el.answer.value = "";
    el.answer.focus();
  }

  function renderTimer() {
    if (!state) return;
    const remaining = Math.max(0, (state.endsAt - Date.now()) / 1000);
    const low = remaining <= 10;
    el.timer.textContent = formatTime(remaining);
    el.timer.classList.toggle("low", low);
    el.timebarFill.style.width = (remaining / GAME_DURATION) * 100 + "%";
    el.timebarFill.classList.toggle("low", low);
    if (remaining <= 0) endGame(true);
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (!state) return;

    const value = parseAnswer(el.answer.value);
    if (value === null) {
      // Invalid/empty input doesn't count as wrong - just nudge the player.
      setFeedback("Please enter a whole number.", "info");
      shakeInput();
      el.answer.focus();
      return;
    }

    const q = state.question;
    if (value === q.answer) {
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.score += DIFFICULTIES[state.level].points;
      setFeedback("✅ Correct! " + q.text + " = " + q.answer, "good");
    } else {
      state.wrong++;
      state.streak = 0;
      setFeedback("❌ Not quite - " + q.text + " = " + q.answer, "bad");
      shakeInput();
    }

    el.score.textContent = String(state.score);
    el.streak.textContent = String(state.streak);
    nextQuestion();
  }

  function skipQuestion() {
    if (!state) return;
    const q = state.question;
    state.streak = 0;
    el.streak.textContent = "0";
    setFeedback("⏭️ Skipped - " + q.text + " = " + q.answer, "info");
    nextQuestion();
  }

  function shakeInput() {
    el.answer.classList.remove("shake");
    void el.answer.offsetWidth; // restart the CSS animation
    el.answer.classList.add("shake");
  }

  function endGame(timeUp) {
    if (!state) return;
    clearInterval(tickHandle);
    tickHandle = null;

    const s = state;
    state = null; // ignore any further input for this round

    const previousBest = getBest(s.level);
    const isNewBest = s.score > previousBest;
    if (isNewBest) setBest(s.level, s.score);

    el.endTitle.textContent = timeUp ? "⏰ Time's up!" : "🏁 Game over";
    el.finalScore.textContent = String(s.score);
    el.newBest.hidden = !isNewBest;
    el.sumLevel.textContent = DIFFICULTIES[s.level].label;
    el.sumCorrect.textContent = String(s.correct);
    el.sumWrong.textContent = String(s.wrong);
    el.sumAccuracy.textContent = accuracy(s.correct, s.wrong) + "%";
    el.sumStreak.textContent = String(s.bestStreak);
    el.sumBest.textContent = String(Math.max(previousBest, s.score));

    showScreen("end");
    el.restartBtn.focus();
  }

  function backToMenu() {
    updateStartBest();
    showScreen("start");
    el.startBtn.focus();
  }

  // ----- Event wiring -----
  el.startBtn.addEventListener("click", startGame);
  el.form.addEventListener("submit", submitAnswer);
  el.skipBtn.addEventListener("click", skipQuestion);
  el.quitBtn.addEventListener("click", () => endGame(false));
  el.restartBtn.addEventListener("click", startGame);
  el.menuBtn.addEventListener("click", backToMenu);
  document.querySelectorAll('input[name="difficulty"]').forEach((radio) =>
    radio.addEventListener("change", updateStartBest)
  );
  // Timer catches up immediately when the player returns to the tab.
  document.addEventListener("visibilitychange", renderTimer);

  updateStartBest();
})();
