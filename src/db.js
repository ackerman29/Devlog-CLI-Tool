import fs from "node:fs/promises";
import { fileURLToPath }from "node:url";

const Db_Path= fileURLToPath("../db.json",import.meta.url);

export const getDB =async ()=>{
  const db =await fs.readFile(Db_Path,"utf-8");
  return JSON.parse(db);
};