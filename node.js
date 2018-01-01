const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------- Config ----------
const cfg = {
  startDate: new Date(2018, 0, 1), // Jan 1, 2018
  endDate: new Date(),             // today
  commitHourRange: [9, 19],        // commits between 9 AM – 7 PM
  commitMinuteRange: [0, 59],
  minCommitsPerDay: 1,
  maxCommitsPerDay: 7,
  authorName: "akabariprince",
  authorEmail: "princeakabari123@gmail.com",
  repoPath: ".",
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
function randomFileFolder() { return cfg.filesToTouch[randomInt(0, cfg.filesToTouch.length - 1)]; }
function randomCommitMessage() { return commitMessages[randomInt(0, commitMessages.length - 1)]; }

function touchRandomFile() {
  const folder = randomFileFolder();
  if (!fs.existsSync(folder)) return null;

  const files = fs.readdirSync(folder).filter(f => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js"));
  if (files.length === 0) return null;

  const file = files[randomInt(0, files.length - 1)];
  const fullPath = path.join(folder, file);

  fs.appendFileSync(fullPath, `\n// auto-update ${new Date().toISOString()}`);
  return fullPath;
}

function fmtISOWithOffset(date, offset) {
  const yyyy = date.getFullYear(), mm = String(date.getMonth() + 1).padStart(2, '0'), dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0'), mi = String(date.getMinutes()).padStart(2, '0'), ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${offset}`;
}

// ---------- Date generator ----------
function* daysFromTo(start, end) {
  const d = new Date(start);
  while (d <= end) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

// ---------- Main ----------
(function main() {
  let totalCommits = 0;

  for (const day of daysFromTo(cfg.startDate, cfg.endDate)) {
    // Skip weekends (Sat=6, Sun=0)
    if (day.getDay() === 0 || day.getDay() === 6) continue;

    const commitsToday = randomInt(cfg.minCommitsPerDay, cfg.maxCommitsPerDay);

    for (let i = 0; i < commitsToday; i++) {
      const commitHour = randomInt(cfg.commitHourRange[0], cfg.commitHourRange[1]);
      const commitMinute = randomInt(cfg.commitMinuteRange[0], cfg.commitMinuteRange[1]);
      const commitDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), commitHour, commitMinute, 0);
      const iso = fmtISOWithOffset(commitDate, "+05:30");

      const touchedFile = touchRandomFile();
      if (!touchedFile) continue;

      execSync('git add -A', { cwd: cfg.repoPath });
      execSync(`git commit -m "${randomCommitMessage()}"`, {
        cwd: cfg.repoPath,
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: iso,
          GIT_COMMITTER_DATE: iso,
          GIT_AUTHOR_NAME: cfg.authorName,
          GIT_AUTHOR_EMAIL: cfg.authorEmail,
          GIT_COMMITTER_NAME: cfg.authorName,
          GIT_COMMITTER_EMAIL: cfg.authorEmail
        }
      });

      totalCommits++;
      console.log(`✅ Commit done for ${iso}: ${touchedFile}`);
    }
  }

  console.log(`\n🎯 Total commits created: ${totalCommits}`);
})();
