// Unit tests for math-game/logic.js. Run with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  GAME_DURATION,
  DIFFICULTIES,
  generateQuestion,
  parseAnswer,
  accuracy,
  formatTime,
} = require("../math-game/logic.js");

// Evaluate a question independently of the generator to verify its answer.
function evaluate({ a, b, op }) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return a / b;
  }
  throw new Error("bad op " + op);
}

test("game lasts 60 seconds", () => {
  assert.equal(GAME_DURATION, 60);
});

for (const level of Object.keys(DIFFICULTIES)) {
  test(`${level}: 5000 generated questions are valid`, () => {
    const cfg = DIFFICULTIES[level];
    const seenOps = new Set();
    for (let i = 0; i < 5000; i++) {
      const q = generateQuestion(level);
      seenOps.add(q.op);
      assert.ok(cfg.ops.includes(q.op), `unexpected op ${q.op}`);
      assert.equal(q.answer, evaluate(q), `wrong answer for ${q.text}`);
      assert.ok(Number.isInteger(q.answer), `non-integer answer for ${q.text}`);
      assert.ok(q.answer >= 0, `negative answer for ${q.text}`);
      assert.equal(q.text, `${q.a} ${q.op} ${q.b}`);
      if (q.op === "+" || q.op === "-") {
        assert.ok(q.a <= cfg.max && q.b <= cfg.max);
      } else {
        assert.ok(q.b <= cfg.mulMax && q.b >= 2);
      }
    }
    assert.deepEqual([...seenOps].sort(), [...cfg.ops].sort(), "every operator should appear");
  });
}

test("generateQuestion handles rng extremes (0 and ~1)", () => {
  for (const level of Object.keys(DIFFICULTIES)) {
    for (const r of [0, 0.999999]) {
      const q = generateQuestion(level, () => r);
      assert.equal(q.answer, evaluate(q));
      assert.ok(q.answer >= 0);
    }
  }
});

test("generateQuestion rejects unknown difficulty", () => {
  assert.throws(() => generateQuestion("impossible"), /Unknown difficulty/);
});

test("parseAnswer accepts whole numbers", () => {
  assert.equal(parseAnswer("42"), 42);
  assert.equal(parseAnswer("  7 "), 7);
  assert.equal(parseAnswer("0"), 0);
  assert.equal(parseAnswer("-3"), -3);
  assert.equal(parseAnswer("007"), 7);
});

test("parseAnswer rejects invalid input", () => {
  for (const bad of ["", "   ", "abc", "4.5", "1e3", "12a", "--1", "+", "12345678", null, undefined]) {
    assert.equal(parseAnswer(bad), null, `should reject ${JSON.stringify(bad)}`);
  }
});

test("accuracy", () => {
  assert.equal(accuracy(0, 0), 0);
  assert.equal(accuracy(3, 1), 75);
  assert.equal(accuracy(2, 1), 67);
  assert.equal(accuracy(5, 0), 100);
});

test("formatTime", () => {
  assert.equal(formatTime(60), "1:00");
  assert.equal(formatTime(59.2), "1:00");
  assert.equal(formatTime(9), "0:09");
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(-5), "0:00");
});
