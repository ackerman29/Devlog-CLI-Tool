const { getDB, saveDB, insert: dbInsert,getLogsByScope } = require("./db.js");
const { updateContext } = require("./context.js");
const { registerFolder, getRegisteredFolders } = require("./registry");
const path = require("path");
const fs = require("fs");
const { getFolderByProject } = require("./registry"); 

const { getContext } = require('./context.js');



const insert = async (newLog, preferLocal = true) => {
  console.log(`Saving log with ID: ${newLog.id}`);

  await dbInsert(newLog, preferLocal);

  const db = await getDB({ preferLocal });
  console.log(`Total logs in DB (${preferLocal ? "local" : "global"}):${db.logs.length}`);

  // Ensure folder is tracked properly for local logs
  if (preferLocal) {
    const ctx = await getContext();
    const currentProject = ctx.current;
    if (currentProject) {
      registerFolder(process.cwd());
    }
  }
};
const getAllLogs = async (scope = 'local') => {
  if (scope === "global") {
    const db = await getDB({ preferLocal: false });
    return db.logs || [];
  }

  if (scope === "local") {
    const db = await getDB({ preferLocal: true });
    return db.logs || [];
  }

  if (scope === "all") {
    const logs = [];

    // ✅ Global logs
    try {
      const globalDb = await getDB({ preferLocal: false });
      logs.push(...(globalDb.logs || []));
    } catch (_) {}

    // ✅ All registered local folders
    const folders = getRegisteredFolders().filter(Boolean); // filters out null, undefined, etc.

    for (const folder of folders) {
      if (typeof folder !== "string") continue;
      const filePath = path.join(folder, ".devtrack", "logs.json");

      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(content);
          logs.push(...(parsed.logs || []));
        }
      } catch (err) {
        console.error(`❌ Failed to read logs from ${filePath}`, err.message);
      }
    }

    return logs;
  }
};
// const getAllLogs = async (scope = 'local') => {
//   if (scope === "global") {
//     return getLogsByScope(scope);
//   }
//   if (scope === "local") {
//     return getDB(path.join(process.cwd(), LOCAL_DB_NAME));
//   }

//   if (scope === "all") {
//     const logs = [];

    // // Global logs
    // logs.push(...(await readLogs(GLOBAL_DB_PATH)));

    // // Local logs from registered folders
    // const folders = getRegisteredFolders();
    // for (const folder of folders) {
    //   const localPath = path.join(folder, LOCAL_DB_NAME);
    //   if (fs.existsSync(localPath)) {
    //     logs.push(...(await readLogs(localPath)));
    //   }
    // }

    // return logs;
  




 const findLog = async (id,scope='local') => {
  const logs = await getLogsByScope(scope);
  return logs.filter((log) => log.id === id);
};


 const deleteLog = async(id,preferLocal=true) => {
  const db = await getDB({preferLocal});
  const initialLength = db.logs.length;
  db.logs = db.logs.filter((log)=> log.id !== id);
  await saveDB(db,preferLocal);
  return db.logs.length < initialLength;
};

 const deleteAllLogs = async (preferLocal=true) => {
  const db = await getDB({preferLocal});
  db.logs = [];
  await saveDB(db,preferLocal);
};









const newLog = async (entry, tags, author, project, preferLocal = true) => {
  // Use folder name as default project if not explicitly passed
  const folderProject = path.basename(process.cwd());
  const finalProject = project || folderProject;

  const data = {
    tags,
    content: entry,
    author,
    project: finalProject,
    id: Date.now(),
  };

  await insert(data, preferLocal);

  if (preferLocal) {
    const existingFolder = getFolderByProject(finalProject);
    if (!existingFolder) {
      registerFolder(process.cwd()); // Register folder only if not already
    }
  }

  await updateContext({ last_note: entry });

  // console.log(`ℹ️  Log saved under project: '${finalProject}'`);

  return data;
};



 const searchLogs = async (query, options = {},scope='local') => {
  const logs = await getAllLogs(scope);
    console.log("🔍 Logs available for search:", logs.length);
    console.log(`🔍 Scope: ${scope}`);
console.log(`🔍 Total logs found from getAllLogs: ${logs.length}`);
console.log(logs.map(log => log.project));
  if (!query && !options.project && !options.author && !options.tags) {
    return logs; 
  }
  
  const results = logs.filter(log => {
    let matches = true;
    
    if (query) {
      const searchQuery = query.toLowerCase();
      matches = matches && log.content.toLowerCase().includes(searchQuery);
    }
    
    if (options.project) {
      matches = matches && log.project === options.project;
    }
    
    if (options.author) {
      matches = matches && log.author && log.author.toLowerCase().includes(options.author.toLowerCase());
    }
    
    if (options.tags) {
      const searchTags = options.tags.split(',').map(tag => tag.trim().toLowerCase());
      const logTags = (log.tags || []).map(tag => tag.toLowerCase());
      matches = matches && searchTags.some(tag => logTags.includes(tag));
    }
    
    if (options.after) {
      const afterDate = new Date(options.after).getTime();
      matches = matches && log.id >= afterDate;
    }
    
    if (options.before) {
      const beforeDate = new Date(options.before).getTime();
      matches = matches && log.id <= beforeDate;
    }
    
    return matches;
  });
  
  if (query) {
        results.sort((a, b) => getRelevanceScore(b, query) - getRelevanceScore(a, query));

    };
  
  
  return results;
};




const getRelevanceScore = (log, query) => {
  const searchQuery = query.toLowerCase();
  const content = log.content.toLowerCase();
  
  let score = 0;  
  if (content.includes(searchQuery)){
    score += 10;
  }
  
  const queryWords = searchQuery.split(' ');
  queryWords.forEach(word => {
    if (content.includes(word)) {
      score += 1;
    }
  });
  
  if (log.tags) {
    log.tags.forEach(tag => {
      if (tag.toLowerCase().includes(searchQuery)) {
        score += 5;
      }
    });
  }
  
  return score;
};



//print the search results in a user-friendly format
 const listSearchResults = (logs, query, options = {}) => {
  if (logs.length === 0) {
    console.log("No logs found matching your search criteria.");
    return;
  }
  
  console.log(`\n Found ${logs.length} result${logs.length === 1 ? '' : 's'}`);
  
  if (query) {
    console.log(`Search term: "${query}"`);
  }
  
  if (options.project) {
    console.log(`Project: ${options.project}`);
  }
  
  if (options.author) {
    console.log(` Author: ${options.author}`);
  }
  
  if (options.tags) {
    console.log(`Tags: ${options.tags}`);
  }
  
  console.log("─".repeat(50));
  
  logs.forEach((log, index) => {
    console.log(`\n[${index + 1}]`);
    console.log("Date:", new Date(log.id).toLocaleString());
    console.log("Author:", log.author || "Anonymous");
    console.log("ID:", log.id);
    console.log("Project:", log.project || "None");
    console.log("Tags:", log.tags?.join(", ") || "None");
    
    let displayContent = log.content;
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      displayContent = log.content.replace(regex, '**$1**');
    }
    
    console.log("Content:", `"${displayContent}"`);
    
    if (index < logs.length - 1) {
      console.log("─".repeat(30));
    }
  });
};
module.exports = {
  insert,
  getAllLogs,
  findLog,
  deleteLog,
  deleteAllLogs,
  newLog,
  searchLogs,
  listSearchResults
};
