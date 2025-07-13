const fs = require("fs").promises;
const path = require("path");
const os = require("os");

const { getContext } = require("./context");
const { getFolderByProject } = require("./registry");

const GLOBAL_DB_PATH = path.join(os.homedir(), ".devtrack", "db.json");

// Determine the actual local DB path for the current project
const getLocalDbPath = async () => {
  const ctx = await getContext();
  const currentProject = ctx.current;

  if (!currentProject) {
    return path.join(process.cwd(), ".devtrack", "logs.json");
  }

  const folder = getFolderByProject(currentProject);

  if (!folder) {
    return path.join(process.cwd(), ".devtrack", "logs.json");
  }

  return path.join(folder, ".devtrack", "logs.json");
};

// Ensures directory exists
const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

// Chooses between local and global DB path
const getDbPath = async (preferLocal = true) => {
  if (!preferLocal) return GLOBAL_DB_PATH;
  return await getLocalDbPath(); // Await required
};

// Fetch the DB (create if needed)
const getDB = async ({ preferLocal = true } = {}) => {
  const dbPath = await getDbPath(preferLocal);
  await ensureDir(dbPath);

  try {
    const content = await fs.readFile(dbPath, "utf-8");
    if (!content.trim()) {
      const defaultDB = { logs: [] };
      await saveDB(defaultDB, preferLocal);
      return defaultDB;
    }
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      const defaultDB = { logs: [] };
      await saveDB(defaultDB, preferLocal);
      return defaultDB;
    } else {
      throw error;
    }
  }
};

// Save DB
const saveDB = async (db, preferLocal = true) => {
  const dbPath = await getDbPath(preferLocal);
  await ensureDir(dbPath);
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  return db;
};

// Insert a log
const insert = async (data, preferLocal = true) => {
  const db = await getDB({ preferLocal });
  db.logs = db.logs || [];
  db.logs.push(data);
  await saveDB(db, preferLocal);
  return data;
};

// Return logs by scope
const getLogsByScope = async (scope = 'local') => {
  const logs = [];

  if (scope === 'local' || scope === 'all') {
    try {
      const localDb = await getDB({ preferLocal: true });
      const ctx = await getContext();
      const currentProject = ctx.current;

      const localLogs = (localDb.logs || []).filter(
        log => log.project === currentProject
      );
      console.log("📌 Context:", currentProject);
      console.log("📄 Logs in DB:", (localDb.logs || []).length);
      console.log("✅ Logs after filter:", localLogs.length);
      logs.push(...localLogs);
    } catch (_) {}
  }

  if (scope === 'global' || scope === 'all') {
    try {
      const globalDb = await getDB({ preferLocal: false });
      logs.push(...(globalDb.logs || []));
    } catch (_) {}
  }

  return logs;
};

module.exports = {
  getDB,
  saveDB,
  insert,
  getLogsByScope,
};
