const { getAllLogs } = require('./logs.js');
const Fuse = require('fuse.js');
const chalk = require("chalk");


 async function searchLogs(query, options = {}) {
  try {
    const start = process.hrtime();
    
    const allLogs = await getAllLogs(options.scope || "local"); 

    
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
      minMatchCharLength: 1,
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

 async function listSearchResults(results, query, options) {
  if (results.length === 0) {
    console.log(chalk.red(`\n No results found for "${query}"`));
    if (Object.keys(options).some(key => options[key])) {
      console.log(chalk.yellow(" Try broadening your search criteria or reducing filters"));
    }
    return;
  }

  console.log(chalk.green(`\n Search Results (${results.length} found):`));
  console.log(chalk.gray("=".repeat(50)));

  results.forEach((log, index) => {
    const date = new Date(log.id).toLocaleString();
    const relevance = log._searchScore !== undefined
      ? `${Math.round((1 - log._searchScore) * 100)}%`
      : "N/A";

    console.log(chalk.cyan(`\n${index + 1}. ${chalk.bold(date)}`));
    console.log(`    ${chalk.magenta("Author")}: ${log.author || chalk.gray('Unknown')}`);
    console.log(`    ${chalk.magenta("Tags")}: ${log.tags ? log.tags.join(', ') : chalk.gray('No tags')}`);
    console.log(`    ${chalk.magenta("Project")}: ${log.project || chalk.gray('No project')}`);
    console.log(`    ${chalk.yellow("Relevance")}: ${relevance}`);

    const preview = log.content.length > 100
      ? log.content.substring(0, 100) + '...'
      : log.content;
    console.log(`    ${chalk.white(preview)}`);

    if (log._matches && log._matches.length > 0) {
      console.log(`    ${chalk.green(`Matches: ${log._matches.length} found`)}`);
    }
  });
}

module.exports = {
  searchLogs,
  listSearchResults
};
