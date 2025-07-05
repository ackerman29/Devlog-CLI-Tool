import { getAllLogs } from './logs.js';
import Fuse from 'fuse.js';

export async function searchLogs(query, options = {}) {
  try {
    const start = process.hrtime();
    
    const allLogs = await getAllLogs();
    
    let filteredLogs = allLogs.filter(log => {
      const matchesProject = !options.project || log.project === options.project;
      const matchesAuthor = !options.author || log.author === options.author;
      const matchesTags = !options.tags || (log.tags && 
        options.tags.split(',').some(tag => log.tags.includes(tag.trim())));
      const matchesAfter = !options.after || new Date(log.timestamp) >= new Date(options.after);
      const matchesBefore = !options.before || new Date(log.timestamp) <= new Date(options.before);
      
      return matchesProject && matchesAuthor && matchesTags && matchesAfter && matchesBefore;
    });
    
    if (!query) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const milliseconds = seconds * 1000 + nanoseconds / 1000000;
      console.log(`🔍 Found ${filteredLogs.length} results in ${milliseconds.toFixed(2)}ms`);
      return filteredLogs;
    }
    
    const fuseOptions = {
      keys: [
        { name: 'content', weight: 0.7 },
        { name: 'title', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true, 
      findAllMatches: true
    };
    
    const fuse = new Fuse(filteredLogs, fuseOptions);
    
    const fuseResults = fuse.search(query);
    
    const results = fuseResults.map(result => ({
      ...result.item,
      _searchScore: result.score,
      _matches: result.matches
    }));
    
    const [seconds, nanoseconds] = process.hrtime(start);
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    
    console.log(`Found ${results.length} results in ${milliseconds.toFixed(2)}ms using fuzzy search`);
    console.log(`Searched ${filteredLogs.length} logs with ${fuseOptions.threshold} similarity threshold`);
    
    return results;
    
  } catch (error) {
    console.error("Search failed:", error.message);
    throw error;
  }
}

// Enhanced search results display
export async function listSearchResults(results, query, options) {
  if (results.length === 0) {
    console.log(`\n No results found for "${query}"`);
    if (Object.keys(options).some(key => options[key])) {
      console.log(" Try broadening your search criteria or reducing filters");
    }
    return;
  }
  
  console.log(`\n Search Results (${results.length} found):`);
  console.log("=" * 50);
  
  results.forEach((log, index) => {
    console.log(`\n${index + 1}. ${log.title || 'Untitled'}`);
    console.log(`    ${log.timestamp || 'No date'}`);
    console.log(`    ${log.author || 'Unknown'}`);
    console.log(`    ${log.tags ? log.tags.join(', ') : 'No tags'}`);
    console.log(`    ${log.project || 'No project'}`);
    
    // Show relevance score if available
    if (log._searchScore !== undefined) {
      const relevance = Math.round((1 - log._searchScore) * 100);
      console.log(`    Relevance: ${relevance}%`);
    }
    
    const preview = log.content.length > 100 ? 
      log.content.substring(0, 100) + '...' : log.content;
    console.log(`    ${preview}`);
    
    if (log._matches && log._matches.length > 0) {
      console.log(`    Matches: ${log._matches.length} found`);
    }
  });
}