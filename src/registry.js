const fs = require("fs");
const path = require("path");
const os = require("os");

const REGISTRY_PATH = path.join(os.homedir(), ".devtrack", "registry.json");

function ensureRegistryExists() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify({}, null, 2)); // empty object now
  }
}

function getRegisteredFolders() {
  const registry = getRegistry();
  return Object.values(registry);
}

function getRegistry() {
  ensureRegistryExists();
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
}

function saveRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
}

function registerProject(name, folder) {
  const reg = getRegistry();
  if (reg[name] && reg[name] !== folder) {
    // console.warn(`⚠️ Project "${name}" already registered to: ${reg[name]}`);
    // console.warn(`⛔ Skipping registration to avoid overwriting existing mapping.`);
    return;
  }
  reg[name] = folder;
  saveRegistry(reg);
  // console.log(`✅ Registered "${name}" -> "${folder}"`);
}




function getFolderByProject(projectName) {
  const registry = getRegistry();
  return registry[projectName] || null;
}



function getProjectByFolder(folderPath) {
  const registry = getRegistry();
  const target = path.resolve(folderPath);

  // console.log("📁 Looking for:", target);
  // console.log("📚 Registry contents:", registry);

  for (const [project, p] of Object.entries(registry)) {
    const resolvedPath = path.resolve(p);
    // console.log(`➡️  Checking ${project}: ${resolvedPath}`);
    if (resolvedPath === target) {
      // console.log(`✅ Match found: ${project}`);
      return project;
    }
  }

  // console.log("❌ No match found");
  return null;
}


function getAllRegisteredProjects() {
  return getRegistry();
}

module.exports = {
  registerProject,
  getFolderByProject,
  getProjectByFolder,
  getAllRegisteredProjects,
  getRegisteredFolders
};
