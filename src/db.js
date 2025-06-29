import fs from "node:fs/promises";
import { fileURLToPath }from "node:url";

const Db_Path= fileURLToPath("../db.json",import.meta.url);

export const getDB = async () => {
  try {
    const db = await fs.readFile(DB_Path, "utf-8");
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

export const saveDB =async(db)=>{
  await fs.writeFile(Db_Path, JSON.stringify(db, null, 2));
  return db;
};
export const insert =async (data)=>{
  const db =await getDB();

  if (!db.logs) db.logs= [];

  db.logs.push(data);
  
  await saveDB(db);
  return data;
};