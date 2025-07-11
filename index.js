#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const welcomePath = path.join(os.homedir(), ".devlog", ".welcome-shown");

// Show welcome screen only on first run
if (!fs.existsSync(welcomePath)) {
  console.log(`
📓 Welcome to DevLog CLI!

🚀 Log your developer progress, bugs, ideas, and context across projects with ease.

✨ Quick Start:

  • Create a new log (without an existing project):
      devlog new "Fixed navbar issue" -t bug,ui -a "Rupanjan"
        ↳  -t = --tags (comma-separated)
        ↳  -a = --author

  • Create a new log under a new project:
      devlog switch-to MyProject
      devlog new "Fixed navbar issue" -t bug,ui -a "Rupanjan"
        ↳  -t = --tags (comma-separated)
        ↳  -a = --author
        (This log will be saved under the project "MyProject")

  • Want to Switch projects?:
      devlog switch-to "MyProject2"
      devlog switch-to "MyProject1"
      
  • View current context/project:
      devlog context


  • View all logs:
      devlog all

  • Search logs (fuzzy searching also available):
      devlog search "API error" -t backend

  • Find log by ID:
      devlog find <id>

  • Delete a log:
      devlog delete <id>

  • Clear all logs:
      devlog clean

  
  • Resume latest task in project:
      devlog resume

📘 Documentation:
   https://github.com/yourusername/devlog-cli

Happy logging! ✨
`);

  fs.mkdirSync(path.dirname(welcomePath), { recursive: true });
  fs.writeFileSync(welcomePath, "shown");
}

// Run the main CLI handler
require("./src/command.js");
