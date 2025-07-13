const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const {
  newLog,
  getAllLogs,
  findLog,
  deleteLog,
  deleteAllLogs,
} = require("./logs.js");

const { switchProject, getContext, updateContext } = require("./context.js");

const { searchLogs, listSearchResults } = require("./search.js");

const cli = yargs(hideBin(process.argv))
  .option("global", {
    type: "boolean",
    default: false,
    description: "Use global database instead of local",
  })
  .option("scope", {
    choices: ["local", "global", "all"],
    description: "Scope to fetch logs from (for search/all/find)",
    default: "local",
  })
  .option("tags", {
    alias: "t",
    type: "string",
    description: "Comma-separated tags for the log (e.g., idea,fix,random)",
  });


const listLogs = (logs) => {
  logs.forEach((log) => {
    console.log("\n");
    console.log("Date Created: ", new Date(log.id).toLocaleString());
    console.log("Author:", log.author || "Anonymous");
    console.log("ID:", log.id);
    console.log("Project:", log.project || "None");
    console.log("Tags:", log.tags?.join(", ") || "None");
    console.log("Log Entry:", `"${log.content}"`);
  });
};


cli
  .command(
    "new <log>",
    "Create a new dev log entry",
    (yargs) =>
      yargs
        .positional("log", {
          describe: "The content of the log you want to save",
          type: "string",
        })
        .option("author", {
          alias: "a",
          type: "string",
          description: "Name of the author writing the log",
        }),

    async (argv) => {
      const ctx = await getContext();
    const path = require("path");
    const currentProject = ctx.current || path.basename(process.cwd());
      const tags = argv.tags ? argv.tags.split(",") : [];
      const author = argv.author || "Anonymous";
      const log = await newLog(argv.log, tags,author, currentProject, !argv.global);
      console.log("Log saved successfully :)", log);
    }
  )

  .option("tags", {
    alias: "t",
    type: "string",
    description: "Comma-separated tags for the log (e.g., idea,fix,random)",
  })
  
  .example("dev new 'Setup done' -a Rupanjan --global", "Save log in global DB")

    
  .command(
    "all",
    "View all log entries",
    () => {},
    async (argv) => {
      const logs = await getAllLogs(argv.scope);
      listLogs(logs);
    }
  )
  .command(
    "find <id>",
    "Find a log entry by ID",
    (yargs) =>
      yargs.positional("id", {
        describe: "The ID of the log entry",
        type: "number",
      }),
    async (argv) => {
    const log = await findLog(argv.id, argv.scope);
      listLogs(log);
    }
  )
  .command(
    "delete <id>",
    "Delete a log entry by ID",
    (yargs) =>
      yargs.positional("id", {
        describe: "The ID of the log to delete",
        type: "number",
      }),
    async (argv) => {
    const deleted = await deleteLog(argv.id, !argv.global);
      console.log(deleted ? " Log deleted." : " Log not found.");
    }
  )
  .command(
    "clean",
    "Delete all logs",
    () => {},
    async (argv) => {
    await deleteAllLogs(!argv.global);
      console.log("🧹 All logs cleared.");
    }
  )
  .command(
    "switch-to <project>",
    "Switch to a different project / create a new one",
    yargs => yargs
    .positional("project", {
      describe: "Project name to switch to",
      type: "string"
    }),
    async argv => {
      const logs = await getAllLogs();

      // Filter logs from this specific project
      const projectLogs = logs.filter(log => log.project === argv.project);
      const latestLog = projectLogs.length ? projectLogs[projectLogs.length - 1].content : "";

      await switchProject(argv.project, latestLog);
      console.log(`Switched to "${argv.project}"`);
    }
  )
  .command(
    "context",
    "Show current project context",
    () => {},
    async (argv) => {
      const ctx = await getContext();
      if (!ctx.current) {
        console.log("No active project. Use `dev switch-to <project>`");
        return;
      }
      
      const proj = ctx.projects[ctx.current];
      const logs = await getAllLogs();
      const projectLogs = logs.filter(log => log.project === ctx.current);
      
      console.log(`📌Project: ${ctx.current}`);
      console.log(`Last Active: ${new Date(proj.timestamp).toLocaleString()}`);
      console.log(`Last Note: ${proj.last_note || "None"}`);
      console.log(`Total Logs: ${projectLogs.length}`);
      
      if (projectLogs.length > 0) {
        const recentLogs = projectLogs.slice(-3); 
        console.log(`\n Recent Activity:`);
        recentLogs.forEach(log => {
          const timeAgo = Math.round((Date.now() - log.id) /(60000));
          console.log(`  • "${log.content}" (${timeAgo}m ago)`);
        });
      }
    }
  )
  .command(
    "resume",
    "Resume work on the current project",
    () => {},
    async (argv) => {
      const ctx = await getContext();
      if (!ctx.current) {
        console.log("No active project. Use `dev switch-to <project>` first.");
        return;
      }
      
      const proj = ctx.projects[ctx.current];
      const logs = await getAllLogs();
      const projectLogs = logs.filter(log => log.project === ctx.current);
      
      console.log(` Welcome back to ${ctx.current}`);

      console.log(`You were working on: "${proj.last_note|| "No notes"}"`);
      
      if (projectLogs.length > 0) {
        console.log(`\n Your recent work:`);
        const recent = projectLogs.slice(-5);
        recent.forEach((log, i)=> 
          {
          const timeAgo = Math.round((Date.now() - log.id)/(60000));
          console.log(`  ${i + 1}. "${log.content}" (${timeAgo}m ago)`);
        });
      }
      console.log("Let's continue!");
    }
  )



  
 
  .command(
  "search [query]",
  "Search through your dev logs with fuzzy matching",
  (yargs) =>
    yargs
      .positional("query", {
        describe: "Text to search for in log content",
        type: "string",
      })
      .option("project", {
        alias: "p",
        type: "string",
        description: "Filter by project name",
      })
      .option("author", {
        alias: "a",
        type: "string", 
        description: "Filter by author name",
      })
      .option("tags", {
        alias: "t",
        type: "string",
        description: "Filter by tags (comma-separated)",
      })
      .option("after", {
        type: "string",
        description: "Show logs after this date (YYYY-MM-DD)",
      })
      .option("before", {
        type: "string", 
        description: "Show logs before this date (YYYY-MM-DD)",
      })
      .option("limit", {
        alias: "l",
        type: "number",
        description: "Limit number of results",
        default: 50,
      })
      .option("exact", {
        alias: "e",
        type: "boolean",
        description: "Use exact matching instead of fuzzy search",
        default: false,
      })
      .option("threshold", {
        type: "number",
        description: "Fuzzy search threshold (0.0-1.0, lower = more strict)",
        default: 0.4,
      })
      .example("dev search 'bug fix'", "Fuzzy search for logs containing 'bug fix'")
      .example("dev search --project myapp", "Show all logs from 'myapp' project")
      .example("dev search api --exact", "Exact search for 'api'")
      .example("dev search --scope all", "Search both local and global logs")

      .example("dev search 'algoritm' --threshold 0.2", "Strict fuzzy search (finds 'algorithm')"),
  async (argv) => {
    try {
      const searchOptions = {
        project: argv.project,
        author: argv.author,
        tags: argv.tags,
        after: argv.after,
        before: argv.before,
        exact: argv.exact,
        threshold: argv.threshold,
        scope: argv.scope 

      };
      
      const results = await searchLogs(argv.query, searchOptions, argv.scope);
      
      // Apply limit
      const limitedResults = argv.limit ? results.slice(0, argv.limit) : results;
      
      listSearchResults(limitedResults, argv.query, searchOptions);
      
      if (results.length > argv.limit) {
        console.log(`\n Showing first ${argv.limit} results. Use --limit to see more.`);
      }
    } catch (error) {
      console.error("Search failed:", error.message);
    }
  }
)



cli.demandCommand(1).parse();
