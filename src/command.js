import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { fileURLToPath } from 'url';
import fs from "fs/promises";

const showLogs = (logs) => {
  logs.forEach((log) => {
    console.log(`[${new Date(log.id).toLocaleString()}] ${log.content}`);
  });
};
yargs(hideBin(process.argv))
  .command(
    "add something <message>",
    "Add a new log entry",
    (yargs) =>
      yargs.positional("message", {
        describe: "Log message",
        type: "",
      }),
    async (argv) => {
      const log = await newLog(argv.message);
      console.log(" Log added:", log.content);
      console.log(" Log added:", log.content);
      console.log(" Log added:", log.content);
      console.log(" Log added:", log.content);
    }
  )
  .command(
    "list","Show all logs",
    () => {},
    async () => {
      const logs = await getAllLogs();
      if (logs.length === 0) {
        console.log("no logs '");
        return;
      }
      showLogs(logs);
    }
  )
  .command(
    "test",
    "Test the basic functionality",
    () => {},
    async () => {
      const logs = await getAllLogs();
      if (logs.length === 0) {
        console.log("no logs '");
        return;
      }
      showLogs(logs);
    }
    
    
  )