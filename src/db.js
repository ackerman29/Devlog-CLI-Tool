const fs = require("fs").promises;
const path = require("path");
const os = require("os");

const GLOBAL_DB_PATH = path.join(os.homedir(), ".devtrack", "db.json");
const getLocalDbPath = () => path.join(process.cwd(), ".devtrack", "logs.json");

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

const getDbPath = (preferLocal = true) => {
  const localPath = getLocalDbPath();
  return preferLocal ? localPath : GLOBAL_DB_PATH;
};

const getDB = async ({ preferLocal = true } = {}) => {
  const dbPath = getDbPath(preferLocal);
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

const saveDB = async (db, preferLocal = true) => {
  const dbPath = getDbPath(preferLocal);
   await ensureDir(dbPath);
  //  console.log("Saving to:", Db_Path);
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  return db;
};



const insert = async (data, preferLocal = true) => {
  const db = await getDB({ preferLocal });
   db.logs = db.logs || [];
  db.logs.push(data);
  await saveDB(db, preferLocal);
  return data;
};

const getLogsByScope = async (scope = 'local') => {
  const logs = [];

  if (scope === 'local' || scope === 'all') {
    try {
      const localDb = await getDB({ preferLocal: true });
      logs.push(...(localDb.logs || []));
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