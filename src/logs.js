import { getDB, saveDB, insert as dbInsert } from "./db.js";
import path from "path";
import { fileURLToPath } from 'url';
import { updateContext } from "./context.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const Db_PATH = path.join(__dirname, "db.json");


async function readDB() {
  try {
    const file = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    return { logs: [] };
  }
}

async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote to ${DB_PATH}`);
  // } catch (error) {
  //   console.error(` Failed to write to ${DB_PATH}:`, error.message);
  //   
  // }
  } catch (error) {
    console.error(` Failed to write to ${DB_PATH}:`, error.message);
    throw error;
  }
}

export const insert=async (newLog) => {
  console.log(`Saving log with ID: ${newLog.id}`);
  
  await dbInsert(newLog);
  const db = await getDB();
  console.log(`Total logs in Db: ${db.logs.length}`);
};
export const getAllLogs= async() => {
  const db = await getDB();
  return db.logs || [];
};
export const findLog = async (id) => {
  const db = await getDB();
  return db.logs.filter((log) => log.id === id);
};


export const deleteLog = async(id) => {
  const db = await getDB();
  db.logs = db.logs.filter((log)=> log.id !== id);
  await saveDB(db);
};

export const deleteAllLogs = async () => {
  const db = await getDB();
  db.logs = [];
  await saveDB(db);
};

export const newLog = async (entry, tags, author, project="default") => {
  const data = {
    tags,
    content: entry,
    author,
    project,  
    id: Date.now(),
  };
  await insert(data);
  await updateContext({ last_note: entry }); 
  return data;
};