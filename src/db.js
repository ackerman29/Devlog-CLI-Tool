import fs from "node:fs/promises";
import { fileURLToPath }from "node:url";

const Db_Path= fileURLToPath("../db.json",import.meta.url);

export const getDB =async ()=>{
  const db =await fs.readFile(Db_Path,"utf-8");
  return JSON.parse(db);
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