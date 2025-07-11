# Devtrack CLI Tool 🛠️

---

## 🧠 Ever feel lost coming back to a project after a few days?

As a developer, I've often felt the frustration of returning to a project after a few days and thinking,  
**"What was I even doing here?"**

Git commits brilliantly track code changes, but they rarely capture the **thought process, debugging notes, or design decisions** that are crucial to our work.

We often scribble scattered notes or, worse, completely forget those "aha!" moments.  
Our thoughts are inherently **task-oriented**, and the act of writing them down solidifies our understanding.

That's why I built **Devtrack CLI** 🛠️  
A simple, lightweight command-line tool that lets you log your **ideas, blockers, bugs, and progress notes — completely independent of Git.**  
Think of it as **"committing your brain," not just your code."**

It's just a fun little tool I made for myself — sharing in case it helps anyone else!



---

## ✨ Features

✅ Tag logs with categories like `bug`, `fix`, `idea`, `note`, `design`, `task`, and more  
✅ Remembers your last active project context for seamless switching  
✅ Fuzzy search to quickly find any past thought or note  
✅ Logs grouped per project – no repo required  
✅ Context switching with `switch-to` and `resume` commands  
✅ Filtered search with tags, project, author, or date  

---

## ❓ Why not just Git?

Git is great for code versioning, but:

- 🔒 It's tied to a repo  
- 🧠 It doesn’t track your thought process, just your code  
- 📄 You can’t log ideas, questions, or side notes unrelated to a commit  

**Devtrack is:**

- 🧠 For your brain, not just your code  
- 🛠️ Lightweight and always available  
- 💬 Perfect for journaling, debugging, tracking blockers, and quick ideas  

---
##  NPM Package

https://www.npmjs.com/package/devtrack?activeTab=readme

## 🚀 Installation

```bash
npm install -g @rupanjan123/devtrackcli
```
## 🚀 A Real life Simulated Version of a Dev
```bash
# 1. Switch context to your 'ChatbotApp' project
dev switch-to ChatbotApp

# 2. Log an initial idea for the chat functionality
dev new "Thinking of using WebSockets for real-time chat; polling feels clunky." -t idea -a "Rupanjan"

# 3. Log a bug you're currently facing
dev new "Chat lags when user types fast — maybe debounce input handlers?" -t bug -a "Rupanjan"

# 4. Log a temporary note before taking a break
dev new "Investigating message throttling strategy to stabilize UI." -t note -a "Rupanjan"

# 5. View your current project context
dev context

# 6. Resume work the next day and recall your last thought
dev resume

# 7. Switch to a new project for a different task
dev switch-to ExpenseTracker

# 8. Log design decisions for the new project
dev new "Choosing between localStorage or IndexedDB for offline sync." -t design -a "Rupanjan"

# 9. Log tasks to plan your next sprint
dev new "Need to build export-to-CSV feature. Targeting admin dashboard first." -t task -a "Rupanjan"

# 10. Resume work on ExpenseTracker later
dev resume

# 11. Perform a fuzzy search across ALL your logs for "chat"
dev search "chat"

# 12. Search specifically within the 'ExpenseTracker' project and for entries tagged 'design'
dev search --project ExpenseTracker --tags design

# 13. View all logs associated with your current project context
dev all

```
Let me know what you think! Your feedback would be invaluable.


