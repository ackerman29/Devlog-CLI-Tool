import { getDB, saveDB, insert as dbInsert } from "./db.js";

export const insert=async (newLog) => {
  console.log(`Saving log with ID: ${newLog.id}`);
  await dbInsert(newLog);
  console.log(`Total logs in Db: ${db.logs.length}`);
};
export const getAllLogs= async() => {
  const db = await getDB();
  return db.logs || [];
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

export const newLog = async (entry, tags, author, project) => {
  const data = {
    tags,
    content: entry,
    author,
    project,  
    id: Date.now(),
  };
  await insert(data);
  
  return data;
};