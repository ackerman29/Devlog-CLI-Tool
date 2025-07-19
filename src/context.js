const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const process = require("process");

const {
  getFolderByProject,
  getProjectByFolder,
  registerProject,
  getAllRegisteredProjects,
} = require("./registry");

const CONTEXT_PATH = path.join(os.homedir(), ".devtrack", ".context.json");

async function ensureContextDir() {
  const dir = path.dirname(CONTEXT_PATH);
  await fs.mkdir(dir, { recursive: true });
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
      manual: false,
      ...parsed,
    };
  } catch {
    return { current: null, projects: {}, lastFolder: null, manual: false };
  }
}

async function writeContext(data) {
  await ensureContextDir();
  await fs.writeFile(CONTEXT_PATH, JSON.stringify(data, null, 2));
}

async function updateContext(updates) {
  const ctx = await readContext();
  const project = ctx.current;
  if (!project) return;
  const currentData = ctx.projects[project] || {};
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
  ctx.manual = true;
  ctx.lastFolder = cwd;

  const existingFolder = getFolderByProject(projectName);

  // ✅ Register project only if it's not already registered
  if (!existingFolder) {
    registerProject(projectName, cwd);
  }

  ctx.projects[projectName] = {
    last_note: lastNote,
    timestamp: Date.now(),
  };

  await writeContext(ctx);
  return ctx;
}

async function getEffectiveProject() {
  const cwd = process.cwd();
  const folderName = path.basename(cwd);
  const ctx = await getContext();
  const knownProject = getProjectByFolder(cwd);
  const isDifferentFolder = cwd !== ctx.lastFolder;

  console.log(`📂 Current folder: ${cwd}`);
  console.log(`📦 Folder name: ${folderName}`);
  console.log(`📘 Known project for this folder: ${knownProject}`);
  console.log("🧠 Context before processing:", ctx);

  if (ctx.manual) {
    if (!knownProject) {
      // Unknown folder -> disable manual mode
      console.log("❓ Folder not registered — turning off manual mode and using folder-based switch");
      ctx.manual = false;
    } else {
      // Still in known/registered project — stay in manually selected project
      console.log("🔒 Manual mode ON & folder known — staying in:", ctx.current);
      ctx.lastFolder = cwd;
      await writeContext(ctx);
      return ctx.current;
    }
  }

  // At this point, manual is either false or just turned off
  let currentProject = knownProject;

  if (!currentProject) {
    // Register the project if unknown
    registerProject(folderName, cwd);
    currentProject = folderName;
    console.log(`🆕 Registered new project: ${folderName} -> ${cwd}`);
  } else {
    console.log(`✅ Match found: ${currentProject}`);
  }

  ctx.current = currentProject;
  ctx.lastFolder = cwd;
  await writeContext(ctx);
  return currentProject;
}




module.exports = {
  switchProject,
  updateContext,
  getEffectiveProject,
  getContext,
  writeContext 
};
