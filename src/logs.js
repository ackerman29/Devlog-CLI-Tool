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

export const searchLogs = async (query, options = {}) => {
  const db = await getDB();
  const logs = db.logs || [];
  
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
    results.sort((a, b) => {
      const aScore = getRelevanceScore(a, query);
      const bScore = getRelevanceScore(b, query);
      return bScore - aScore;
    });
  }
  
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

export const listSearchResults = (logs, query, options = {}) => {
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