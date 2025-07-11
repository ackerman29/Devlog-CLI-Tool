const fs = require("fs").promises;
const path = require("path");
const os = require("os");

const CONTEXT_PATH = path.join(os.homedir(), ".devtrack", ".context.json");

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
  ctx.projects[projectName] = {
    last_note: lastNote,
    timestamp: Date.now(), 
  };
  await writeContext(ctx);
  return ctx;
}





module.exports = {
  switchProject,
  updateContext,
  getContext,
};