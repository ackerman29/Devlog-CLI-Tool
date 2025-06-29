import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  newLog,
  getAllLogs,
  findLog,
  deleteLog,
  deleteAllLogs,
} from "./logs.js";
import { switchProject, getContext } from "./context.js";
import { updateContext } from "./context.js";

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


yargs(hideBin(process.argv))
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
          demandOption: true,
        }),
    async (argv) => {
      const ctx = await getContext();
      const currentProject = ctx.current || "default";
      const tags = argv.tags ? argv.tags.split(",") : [];

      const log = await newLog(argv.log, tags, argv.author, currentProject);
      console.log("Log saved successfully :)", log);
    }
  )

  .option("tags", {
    alias: "t",
    type: "string",
    description: "Comma-separated tags for the log (e.g., idea,fix,random)",
  })
  
    
    
  .command(
    "all",
    "View all log entries",
    () => {},
    async () => {
      const logs = await getAllLogs();
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
      const log = await findLog(argv.id);
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
      const deleted = await deleteLog(argv.id);
      console.log(deleted ? " Log deleted." : " Log not found.");
    }
  )
  .command(
    "clean",
    "Delete all logs",
    () => {},
    async () => {
      await deleteAllLogs();
      console.log("🧹 All logs cleared.");
    }
  )
  .command(
    "switch-to <project>",
    "Switch to a different project context",
    yargs => yargs.positional("project", {
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
    async () => {
      const ctx = await getContext();
      if (!ctx.current) {
        console.log("No active project. Use `devlog switch-to <project>`");
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
          const timeAgo = Math.round((Date.now() - log.id) / (1000 * 60));
          console.log(`  • "${log.content}" (${timeAgo}m ago)`);
        });
      }
    }
  )
  .command(
    "resume",
    "Resume work on the current project",
    () => {},
    async () => {
      const ctx = await getContext();
      if (!ctx.current) {
        console.log("No active project. Use `devlog switch-to <project>` first.");
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
          const timeAgo = Math.round((Date.now() - log.id)/(1000 * 60));
          console.log(`  ${i + 1}. "${log.content}" (${timeAgo}m ago)`);
        });
      }
      console.log("Let's continue!");
    }
  )



  
  .command(
    "web [port]",
    "Launch a web view to browse your logs",
    (yargs) =>
      yargs.positional("port", {
        describe: "Port number to host the web UI",
        // default: 7000,
         default: 8000,
        type: "number",
      }),
    async (argv) => {
      const logs = await getAllLogs();
      start(logs, argv.port);
    }
  )

  .demandCommand(1)
  .parse();