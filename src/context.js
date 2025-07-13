const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { getFolderByProject, registerFolder } = require("./registry");
const process = require("process");
const CONTEXT_PATH = path.join(os.homedir(), ".devtrack", ".context.json");
const { getRegisteredFolders } = require("./registry");


async function ensureContextDir() {
  const dir = path.dirname(CONTEXT_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}


async function readContext(){
    await ensureContextDir();

  try {
    const data = await fs.readFile(CONTEXT_PATH, "utf-8");

    return JSON.parse(data);
  } catch {
    return { current: null, projects:{} };
  }
}
async function writeContext(data){
    await ensureContextDir();
  await fs.writeFile(CONTEXT_PATH, JSON.stringify(data, null, 2));
}
// async function getCurrentTask() {
//   const ctx = await readContext();
//   if (!ctx.current || !ctx.projects[ctx.current]) {
//     return null;
//   }
//   return ctx.projects[ctx.current].current_task || "No active task";
// }
async function updateContext(updates) {
  const ctx = await readContext();
  const project = ctx.current;
  if (!project) return;
  const currentData = ctx.projects[project]|| {};
  ctx.projects[project] = {
  ...currentData,
  ...updates,
  timestamp: Date.now(),
};
await writeContext(ctx);

}
async function getContext() {
  return await readContext();

}
async function switchProject(projectName, lastNote = "") {
  const ctx = await readContext();
  ctx.current = projectName;

  const folder = getFolderByProject(projectName);
  if (!folder) {
    // New project → register current folder
    registerFolder(process.cwd());
  }

  ctx.projects[projectName] = {
    last_note: lastNote,
    timestamp: Date.now(), 
  };
  await writeContext(ctx);
  return ctx;
}



async function getEffectiveProject() {
  const cwd = path.resolve(process.cwd());
  const folderName = path.basename(cwd);
  const registeredFolders = getRegisteredFolders();

  if (!registeredFolders.includes(cwd)) {
    // 🆕 Unregistered folder → register it and clear context
    registerFolder(cwd);
    
    const ctx = await getContext();
    ctx.current = folderName; // Use folder name as project
    ctx.projects[folderName] = {
      last_note: "",
      timestamp: Date.now(),
    };
    await writeContext(ctx);
    
    return folderName;
  }

  // 🟢 Registered folder → use context if switched, otherwise folder name
  const ctx = await getContext();
  
  // If explicitly switched to a project, use it
  if (ctx.current && ctx.current !== folderName) {
    return ctx.current;
  }
  
  // Otherwise use folder name
  return folderName;
}


module.exports = {
  switchProject,
  updateContext,
  getEffectiveProject,
  getContext,
};