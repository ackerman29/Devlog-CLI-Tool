import { getDB, saveDB, insert as dbInsert } from "./db.js";
import { updateContext } from "./context.js"; 




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
  const initialLength = db.logs.length;
  db.logs = db.logs.filter((log)=> log.id !== id);
  await saveDB(db);
  return db.logs.length < initialLength;
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