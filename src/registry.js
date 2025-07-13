const fs = require("fs");
const path = require("path");
const os = require("os");

const REGISTRY_PATH = path.join(os.homedir(), ".devtrack", "registry.json");

function ensureRegistryExists() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify([]));
  }
}
function getRegisteredFolders() {
  ensureRegistryExists();
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
}
function registerFolder(folderPath) {
  ensureRegistryExists();
  const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  if (!data.includes(folderPath)) {
    data.push(folderPath);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
  }
}

function getFolderByProject(projectName) {
  ensureRegistryExists();
  const folders = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));

  for (const folder of folders) {
    const logsPath = path.join(folder, ".devtrack", "logs.json");
    if (fs.existsSync(logsPath)) {
      try {
        const content = fs.readFileSync(logsPath, "utf-8");
        const parsed = JSON.parse(content);
        if ((parsed.logs || []).some(log => log.project === projectName)) {
          return folder;
        }
      } catch (_) {}
    }
  }


  return null; // Not found
}
function getFolderProjectName(folderPath) {
  const logsPath = path.join(folderPath, ".devtrack", "logs.json");
  if (fs.existsSync(logsPath)) {
    try {
      const content = fs.readFileSync(logsPath, "utf-8");
      const parsed = JSON.parse(content);
      const firstLog = (parsed.logs || [])[0];
      if (firstLog) {
        return firstLog.project;
      }
    } catch (_) {}
  }
  return null;
}


module.exports = { registerFolder,getRegisteredFolders,getFolderByProject,getFolderProjectName };
