# Devtrack CLI Tool 🛠️

---

## 🧐 Ever feel lost coming back to a project after a few days?

As developers, we often return to a project after a break and think:
**"What was I even doing here?"**

Git commits brilliantly track code changes, but they rarely capture the **thought process, debugging insights, or design decisions** that are critical to our work.

We scribble random notes in Notion, sticky notes, or worse — lose track entirely.
Our brains work **task-by-task**, and writing them down helps retain clarity.

That's why I built **Devtrack CLI** 🛠️
A simple command-line tool to log your **ideas, blockers, bugs, notes, and progress** independently of Git.
Think of it as **"committing your thoughts," not just your code.**

---

## ✨ What's New & Improved?

### 🌐 Global & Local Databases

* Store logs **locally** inside project folders or **globally** for cross-project memory
* Use `--global` flag or `--scope` to switch views and searches

### 🔍 Powerful Search

* Fuzzy search across **local**, **global**, or **all** logs
* Smart filters: search by project, author, tags, or date range
* Search even with **numerics and special characters** now

### 🎨 Smart Tagging & Context

* Tag logs as per your choice: `bug`, `task`, `design`, `note`, `idea`, etc.
* Auto-registers your project when logging from a new folder
* Seamless `context` & `resume` flow to avoid context-switch fatigue

### ➕ New Commands

* `dev switch-to <project>` – switch context manually
* `dev resume` – return to your last working context
* `dev all` – view logs from `local`, `global`, or `all` scopes
* `dev search` – fuzzy or exact search with `--scope`, `--tags`, `--author`, etc.
* `dev clean` – clean logs if database reaches a certain size threshold

---

## 🚀 Installation

```bash
npm install -g @rupanjan123/devtrackcli
```

---

## 🎓 Real-Life Simulated Developer Flow

```bash
# 1. Start by switching to a project
dev switch-to ChatbotApp

# 2. Log a new idea
dev new "Using WebSockets for real-time chat instead of polling." -t idea

# 3. Log a bug
dev new "Chat lags when typing fast. Debounce input needed." -t bug

# 4. Save a quick note
dev new "Review message throttling strategy for smoother UI." -t note

# 5. View current context
dev context

# 6. Resume where you left off later
dev resume

# 7. Switch project
dev switch-to ExpenseTracker

# 8. Log design ideas
dev new "Choosing between localStorage and IndexedDB." -t design

# 9. Plan sprint
dev new "Add export-to-CSV feature in admin dashboard." -t task

# 10. View all logs in current scope
dev all

# 11. Search all logs for anything related to chat
dev search "chat" --scope all

# 12. Filter by project & tag
dev search --project ExpenseTracker --tags design

# 13. View global logs
dev all --scope global

# 14. Clean logs if DB size is too big
dev clean
```

---

## ℹ️ Why Not Just Git?

Git is great for code, but:

* ❌ Doesn't track what you're *thinking*
* ❌ No support for personal logs unrelated to commits
* ❌ No quick journal-like tracking across projects

**Devtrack is:**

* 🧠 Brain-first, not just code-first
* 🛠️ Lightweight, always available
* 📂 Structured, searchable, and scoped logging

---

## 🌐 NPM Package

[https://www.npmjs.com/package/devtrack](https://www.npmjs.com/package/devtrack)

---

Let me know what you think – feedback or ideas to improve it are always welcome! ✨

\#devtools #cli #nodejs #productivity #opensource #logging #developerworkflow
