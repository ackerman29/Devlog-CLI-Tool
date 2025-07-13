const fs = require("fs");
const path = require("path");
const os = require("os");

const REGISTRY_PATH = path.join(os.homedir(), ".devtrack", "registry.json");

function ensureRegistryExists() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify([]));
  }
}

function registerFolder(folderPath) {
  ensureRegistryExists();
  const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  if (!data.includes(folderPath)) {
    data.push(folderPath);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
  }
}

function getRegisteredFolders() {
  ensureRegistryExists();
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
}

module.exports = { registerFolder, getRegisteredFolders };
