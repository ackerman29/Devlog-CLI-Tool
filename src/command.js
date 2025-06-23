const showLogs = (logs) => {
  logs.forEach((log) => {
    console.log(`[${new Date(log.id).toLocaleString()}] ${log.content}`);
  });
};