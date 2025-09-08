const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const git = simpleGit();

// ---------- Config ----------
const cfg = {
  startDate: new Date(2018, 0, 1), // Jan 1, 2018
  endDate: new Date(),             // Today
  minCommitsPerDay: 1,
  maxCommitsPerDay: 7,
  commitHourRange: [9, 19],        // Between 9 AM – 7 PM
  commitMinuteRange: [0, 59],
  author: {
    name: "akabariprince",
    email: "princeakabari123@gmail.com"
  },
  filesToTouch: [
    "src/components",
    "src/pages",
    "src/services",
    "src/hooks",
    "src/utils",
    "src/types"
  ]
};

// ---------- Commit messages ----------
const commitMessages = [
  "feat: implement login page",
  "feat: add AI prediction API",
  "feat: integrate payment gateway",
  "fix: bug in dashboard chart rendering",
  "fix: handle null pointer in API",
  "fix: responsive design issue",
  "chore: update dependencies",
  "chore: cleanup unused code",
  "refactor: optimize API service",
  "refactor: improve component structure",
  "docs: update README",
  "docs: add API usage example",
  "test: add unit tests for auth",
  "test: improve coverage for utils",
  "style: improve UI consistency"
];

// ---------- Helpers ----------
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomCommitMessage() { return commitMessages[randomInt(0, commitMessages.length - 1)]; }

function randomFile() {
  const folder = cfg.filesToTouch[randomInt(0, cfg.filesToTouch.length - 1)];
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `file-${randomInt(1, 500)}.${Math.random() > 0.5 ? "ts" : "js"}`;
  const fullPath = path.join(folder, filename);

  fs.appendFileSync(fullPath, `// update ${new Date().toISOString()}\n`);
  return fullPath;
}

function fmtISO(date) {
  return date.toISOString();
}

function* daysFromTo(start, end) {
  const d = new Date(start);
  while (d <= end) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

// ---------- Main ----------
(async function main() {
  let total = 0;

  for (const day of daysFromTo(cfg.startDate, cfg.endDate)) {
    // Skip weekends (Sat=6, Sun=0)
    if (day.getDay() === 0 || day.getDay() === 6) continue;

    const commitsToday = randomInt(cfg.minCommitsPerDay, cfg.maxCommitsPerDay);

    for (let i = 0; i < commitsToday; i++) {
      const commitHour = randomInt(cfg.commitHourRange[0], cfg.commitHourRange[1]);
      const commitMinute = randomInt(cfg.commitMinuteRange[0], cfg.commitMinuteRange[1]);
      const commitDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), commitHour, commitMinute, 0);

      const touchedFile = randomFile();

      await git.add(".");
      await git.commit(randomCommitMessage(), touchedFile, {
        "--date": fmtISO(commitDate),
        "--author": `"${cfg.author.name} <${cfg.author.email}>"`
      });

      console.log(`✅ Commit on ${commitDate}: ${touchedFile}`);
      total++;
    }
  }

  console.log(`\n🎯 Total commits created: ${total}`);
})();
