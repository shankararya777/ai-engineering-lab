# ai-engineering-lab

A collection of small AI-engineering experiments. The main project is **Math Sprint**, a browser-based arithmetic game.

| Path | What it is |
| --- | --- |
| `math-game/` | Math Sprint web game (HTML, CSS, JavaScript) |
| `tests/` | Unit tests for the game logic |
| `calculator.py`, `hello.py`, `gemini_test.py` | Earlier Python scripts |

---

## 🧮 Math Sprint

**▶ Play it here: https://shankararya777.github.io/ai-engineering-lab/**

### What the game does

Math Sprint is a 60-second timed arithmetic challenge. It shows random math questions one at a time, and you answer as many as you can before the clock runs out. It helps you practise mental arithmetic, and your best score for each difficulty is saved in your browser.

| Difficulty | Operations | Number range | Points per correct answer |
| --- | --- | --- | --- |
| Easy | + − | up to 10 | 1 |
| Medium | + − × | + − up to 50, × up to 10 | 2 |
| Hard | + − × ÷ | + − up to 100, × ÷ up to 12 | 3 |

Every answer is a whole number of zero or more. There are no negative answers and no decimals, and division always comes out exact.

### How to play

1. Choose a difficulty and press **Start Game**.
2. Type your answer and press **Enter** (or tap **Submit**).
3. You see ✅ or ❌ straight away, along with the correct answer, and the next question appears.
4. Press **Skip** to pass on a hard question. Skipping resets your streak but doesn't count as wrong.
5. Your round ends when the timer reaches 0, or when you press **End Game**.
6. The results screen shows your final score, correct and wrong answers, accuracy, best streak and best score.
7. Press **Play Again** to replay the same difficulty, or **New Game** to choose a different one.

### Run it locally

You don't need a build step or any dependencies. Pick one of these:

- **Open the file:** double-click `math-game/index.html`.
- **Use a local server** (recommended):
  ```bash
  python -m http.server 8000 --directory math-game
  ```
  Then open http://localhost:8000. `npm start` runs the same command.

### Run the tests

This needs Node.js 18 or later. The tests use the built-in `node:test` runner, so there's nothing to install:

```bash
npm test
```

The tests generate thousands of questions for each difficulty and check that every answer is correct, a whole number and not negative. They also cover input parsing, accuracy and time formatting.

### Project structure

```
math-game/
  index.html   – page markup (start, game and results screens)
  style.css    – responsive styles, including dark mode
  logic.js     – pure game logic (questions, parsing, scoring helpers); no DOM access
  game.js      – UI controller: timer, events, screen changes, best scores
tests/
  logic.test.js
.github/workflows/pages.yml – CI tests and GitHub Pages deployment
```

### How it is deployed

The game is deployed to **GitHub Pages** by the GitHub Actions workflow in `.github/workflows/pages.yml`:

- On every pull request and every push, the workflow runs the unit tests.
- On a push to `main`, if the tests pass, it uploads the `math-game/` folder and publishes it to GitHub Pages.

The live site is at https://shankararya777.github.io/ai-engineering-lab/.

### Notes

- It works in all modern desktop and mobile browsers. The layout adapts down to 320px wide, and on phones a number keypad opens for answers.
- It has no backend and no tracking, and it makes no external requests. A strict Content-Security-Policy only allows the site's own files to load.
- Best scores are stored in `localStorage`. If storage is unavailable, for example in some private browsing modes, the game still works but best scores aren't saved.
