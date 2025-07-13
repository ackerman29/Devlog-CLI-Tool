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


async function readContext() {
  await ensureContextDir();
  try {
    const data = await fs.readFile(CONTEXT_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return {
      current: null,
      projects: {},
      lastFolder: null,
      ...parsed,  // safely merge with existing context
    };
  } catch {
    return { current: null, projects: {}, lastFolder: null };
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
  const cwd = path.resolve(process.cwd());
  ctx.current = projectName;
  ctx.lastFolder = cwd;
  ctx.manual = true;  // ✅ mark as manual switch

  const folder = getFolderByProject(projectName);
  if (!folder) {
    registerFolder(cwd);
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
  const ctx = await getContext();

  if (!registeredFolders.includes(cwd)) {
    registerFolder(cwd);

    // 👇 Unregistered → treat as folder-based unless already switched manually
    if (!ctx.manual) {
      ctx.current = folderName;
      ctx.manual = false;
      ctx.lastFolder = cwd;
      ctx.projects[folderName] = {
        last_note: "",
        timestamp: Date.now(),
      };
      await writeContext(ctx);
    }
    return ctx.current || folderName;
  }

  // 🧠 If folder has changed
  if (ctx.lastFolder !== cwd) {
    if (!ctx.manual) {
      // Previous context was folder-based → update to new folder
      ctx.current = folderName;
    }
    ctx.manual = false;        // Reset back to folder-based
    ctx.lastFolder = cwd;
    await writeContext(ctx);
  }

  return ctx.current || folderName;
}





module.exports = {
  switchProject,
  updateContext,
  getEffectiveProject,
  getContext,
};