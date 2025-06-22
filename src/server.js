import http from "node:http";
const devlogs=[
  {content: "Initial devlog entry",tags: ["init"] },
  { content: "test server", tags: ["server", "setup"] },
];
const server = http.createServer((req, res)=> {
  if (req.url === "/devlogs") {
    res.writeHead(200, { "Content-Type":"application/json" });
    res.end(JSON.stringify(devlogs));
  } else {
    res.writeHead(404, { "Content-Type":"text/plain" });
    res.end("Not Found");
  }
});
server.listen(3000,() => {
  console.log("Server is rumning on http://localhost:3000");
});
