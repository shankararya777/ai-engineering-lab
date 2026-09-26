/**
 * Math Sprint - pure game logic.
 *
 * This file has no DOM access so it can be unit-tested in Node
 * (see tests/logic.test.js) and reused by the browser UI (game.js).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(); // Node / tests
  } else {
    root.MathLogic = factory(); // Browser global
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Length of one round, in seconds. */
  const GAME_DURATION = 60;

  /**
   * Difficulty settings.
   * - ops:     which operators can appear
   * - max:     largest operand for + and -
   * - mulMax:  largest factor for x and ÷
   * - points:  score awarded per correct answer
   */
  const DIFFICULTIES = {
    easy:   { label: "Easy",   ops: ["+", "-"],           max: 10,  mulMax: 5,  points: 1 },
    medium: { label: "Medium", ops: ["+", "-", "×"],      max: 50,  mulMax: 10, points: 2 },
    hard:   { label: "Hard",   ops: ["+", "-", "×", "÷"], max: 100, mulMax: 12, points: 3 },
  };

  /** Returns a random integer in [min, max] (inclusive). */
  function randInt(min, max, rng) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  /**
   * Generates a question for the given difficulty.
   * Answers are always non-negative whole numbers, so players never
   * have to type decimals or minus signs.
   *
   * @param {string} level - "easy" | "medium" | "hard"
   * @param {() => number} [rng=Math.random] - injectable for tests
   * @returns {{a:number, b:number, op:string, answer:number, text:string}}
   */
  function generateQuestion(level, rng) {
    rng = rng || Math.random;
    const cfg = DIFFICULTIES[level];
    if (!cfg) throw new Error("Unknown difficulty: " + level);

    const op = cfg.ops[randInt(0, cfg.ops.length - 1, rng)];
    let a, b, answer;

    switch (op) {
      case "+":
        a = randInt(1, cfg.max, rng);
        b = randInt(1, cfg.max, rng);
        answer = a + b;
        break;
      case "-":
        // Keep a >= b so the answer is never negative.
        a = randInt(1, cfg.max, rng);
        b = randInt(1, a, rng);
        answer = a - b;
        break;
      case "×":
        a = randInt(2, cfg.mulMax, rng);
        b = randInt(2, cfg.mulMax, rng);
        answer = a * b;
        break;
      case "÷":
        // Build division from a multiplication so it always divides exactly.
        b = randInt(2, cfg.mulMax, rng);
        answer = randInt(2, cfg.mulMax, rng);
        a = b * answer;
        break;
    }

    return { a, b, op, answer, text: a + " " + op + " " + b };
  }

  /**
   * Parses what the player typed. Returns an integer, or null if the
   * input is not a valid whole number (empty, letters, decimals...).
   */
  function parseAnswer(raw) {
    const trimmed = String(raw == null ? "" : raw).trim();
    if (!/^-?\d{1,7}$/.test(trimmed)) return null;
    return Number(trimmed);
  }

  /** Accuracy as a whole-number percentage (0 when nothing answered). */
  function accuracy(correct, wrong) {
    const total = correct + wrong;
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }

  /** Formats seconds as m:ss (e.g. 65 -> "1:05"). */
  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.ceil(totalSeconds));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  return { GAME_DURATION, DIFFICULTIES, generateQuestion, parseAnswer, accuracy, formatTime };
});
