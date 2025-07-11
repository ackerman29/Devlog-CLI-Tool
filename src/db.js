const fs = require("fs").promises;
const path = require("path");
const os = require("os");

const Db_Path = path.join(os.homedir(), ".devlog", "db.json");

const ensureDbDir = async () => {
  const dir = path.dirname(Db_Path);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
};

const getDB = async () => {
    await ensureDbDir(); 
    console.log("Reading from:", Db_Path);
  try {
    const db = await fs.readFile(Db_Path, "utf-8");
    if (!db.trim()) {
      console.log("Database file is empty, initializing with default structure");
      const defaultDB = { logs: [] };
      await saveDB(defaultDB);
      return defaultDB;
    }
    return JSON.parse(db);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log("The database file does not exist,creating with default file");
      const defaultDB = { logs: [] };
      await saveDB(defaultDB);
      return defaultDB;
    } else if (error instanceof SyntaxError) {
      console.error("Invalid JSON syntax");
      const defaultDB = { logs: [] };
      await saveDB(defaultDB);
      return defaultDB;
    } else {
      throw error;
    }
  }
};

const saveDB = async (db) => {
   await ensureDbDir();
   console.log("Saving to:", Db_Path);
  await fs.writeFile(Db_Path, JSON.stringify(db, null, 2));
  return db;
};
const insert = async (data) => {
  const db =await getDB();

  if (!db.logs) db.logs= [];

  db.logs.push(data);
  
  await saveDB(db);
  return data;
};
module.exports = {
  getDB,
  saveDB,
  insert
};