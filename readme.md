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

### 🔎 Smarter Folder-Based Context (Default Behavior)

* Logs now default to the **current folder name** as the project
* If you `dev switch-to <project>`, logs go to that project **until you change folders**
* Moving to a different folder resets the project context automatically
* No global sticky context — just intuitive folder-based tracking

### 🧠 How Devtrack Context Works

#### 📁 1. Folder-Based Logging (Default)

Devtrack automatically logs your entries under the **folder name** you're currently in.

```bash
cd ~/projects/ChatbotApp
dev new "Improve authentication strategy"
```

➡️ This will be logged under `ChatbotApp`.

#### 🔀 2. Switch Context Temporarily

Use this when you want to log under a different project without changing folders:

```bash
dev switch-to backend
```

➡️ Logs will now go under `backend` until you change folders.

#### 🚶 3. Folder Change = Context Reset

As soon as you `cd` into a different folder, Devtrack **resets the context** back to the folder name:

```bash
cd ../ExpenseTracker
```

➡️ Logs will now go under `ExpenseTracker` (not `backend` anymore).

#### 🧪 Summary Table

| Scenario                        | Where logs go     |
| ------------------------------- | ----------------- |
| Inside a folder (no switch)     | Folder name       |
| After `dev switch-to <project>` | Switched project  |
| After folder change             | Folder name again |

---

### ✨ Global & Local Databases

* Store logs **locally** inside project folders or **globally** for cross-project memory
* Use `--global` flag or `--scope` to switch views and searches

### 🔍 Powerful Search

* Fuzzy search across **local**, **global**, or **all** logs
* Smart filters: search by project, author, tags, or date range
* Search even with **numerics and special characters** now

### 🎨 Smart Tagging & Auto Context

* Tag logs as per your choice: `bug`, `task`, `design`, `note`, `idea`, etc.
* Auto-registers your folder as a project when logging for the first time
* Switches context automatically when moving to a new folder

### ➕ New Commands

* `dev switch-to <project>` – switch context manually (local to current folder)
* `dev resume` – return to your last working context in that folder
* `dev context` – view current effective project
* `dev all` – view logs from `local`, `global`, or `all` scopes
* `dev search` – fuzzy or exact search with `--scope`, `--tags`, `--author`, etc.
* `dev clean` – clean logs if database reaches a certain size threshold

---

## 🚀 Installation

```bash
npm install -g @rupanjan123/devtrackcli
```

---

## 🎓 Real-Life Developer Flow

```bash
# 1. Start in a folder (default project = folder name)
cd ~/projects/ChatbotApp

# 2. Log a new idea
dev new "Using WebSockets for real-time chat instead of polling." -t idea

# 3. Log a bug
dev new "Chat lags when typing fast. Debounce input needed." -t bug

# 4. Save a quick note
dev new "Review message throttling strategy for smoother UI." -t note

# 5. Switch to a project temporarily
dev switch-to backend

dev new "Add Redis pub-sub for horizontal scaling." -t design

# 6. Change folder (context resets)
cd ../ExpenseTracker

dev new "Choosing between localStorage and IndexedDB." -t design

# 7. Plan sprint
dev new "Add export-to-CSV feature in admin dashboard." -t task

# 8. View all logs
dev all

# 9. Search all logs
dev search "chat" --scope all

# 10. Filter by project & tag
dev search --project ExpenseTracker --tags design

# 11. View current project context
dev context

# 12. View global logs
dev all --scope global

# 13. Clean logs
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
