const { getAllLogs } = require('./logs.js');
const Fuse = require('fuse.js');
const chalk = require("chalk");
const numberToWords = require('number-to-words');


 async function searchLogs(query, options = {}) {
  try {
    const start = process.hrtime();
    const scope = options.scope || 'local';
    const logs = await getAllLogs(scope);

    // Step 1: Pre-filter logs based on options
    const filteredLogs = logs.filter(log => {
      return (!options.project || log.project === options.project) &&
             (!options.author || log.author === options.author) &&
             (!options.tags || (
               log.tags && options.tags.split(',').some(tag => log.tags.includes(tag.trim()))
             )) &&
             (!options.after || new Date(log.timestamp) >= new Date(options.after)) &&
             (!options.before || new Date(log.timestamp) <= new Date(options.before));
    });

    // Step 2: If no query, return filtered logs
    if (!query) {
      return withTiming(filteredLogs, start);
    }

    // Step 3: Handle numeric query by converting to words
    const altQuery = normalizeQuery(query);

    // Step 4: Fuse.js fuzzy search
    const fuse = new Fuse(filteredLogs, getFuseOptions());
    let results = fuse.search(altQuery).map(result => ({
      ...result.item,
      _searchScore: result.score,
      _matches: result.matches
    }));

    // Step 5: Fallback if Fuse fails and query is numeric
    if (results.length === 0 && altQuery !== query) {
      results = filteredLogs
        .filter(log =>
          log.content &&
          (log.content.includes(query) || log.content.toLowerCase().includes(altQuery.toLowerCase()))
        )
        .map(log => ({
          ...log,
          _searchScore: 0.0,
          _matches: []
        }));
    }

    return withTiming(results, start, filteredLogs.length);
  } catch (error) {
    console.error("Search failed:", error.message);
    throw error;
  }
}

function getFuseOptions() {
  return {
    keys: [
      { name: 'content', weight: 0.7 },
      { name: 'title', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    findAllMatches: true
  };
}

function normalizeQuery(query) {
  const numeric = query.replace(/\D/g, '');
  if (numeric && /^\d+$/.test(numeric)) {
    try {
      const words = numberToWords.toWords(parseInt(numeric));
      console.log(`🔄 Numeric query "${query}" → "${words}"`);
      return words;
    } catch {
      return query;
    }
  }
  return query;
}

function withTiming(results, start, searchedCount = results.length) {
  const [sec, nano] = process.hrtime(start);
  const ms = (sec * 1e3 + nano / 1e6).toFixed(2);
  console.log(`Found ${results.length} results in ${ms}ms using fuzzy search`);
  console.log(`Searched ${searchedCount} logs with 0.4 similarity threshold`);
  return results;
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
