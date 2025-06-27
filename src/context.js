import fs from "fs/promises";


async function readContext(){
  try {
    const data = await fs.readFile("utf-8");
    return JSON.parse(data);
  } catch {
    return { current: null, projects:{} };
  }
}
async function writeContext(data){
  await fs.writeFile(CONTEXT_PATH, JSON.stringify(data, null, 2));
}
async function getCurrentTask() {
  const ctx = await readContext();
  if (!ctx.current || !ctx.projects[ctx.current]) {
    return null;
  }
  return ctx.projects[ctx.current].current_task || "No active task";
}
async function updateContext(updates) {
  const ctx = await readContext();
  const project = ctx.current;
  if (!project) return;
  const currentData = ctx.projects[project]|| {};
  ctx.projects[project]= {
    ...currentData,
    ...updates,
    timestamp: Date.now(), 
  };
}
async function getContext() {
  return readContext();
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





export{
  switchProject,
updateContext,
    getContext,
};