import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.env.PORT ?? 3000);
const message = process.env.APP_MESSAGE ?? "Hello from the MMAUG tooling lab";
const home = await readFile(new URL("./index.html", import.meta.url), "utf8");
let requests = 0;

export const server = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/metrics") {
    response.writeHead(200, { "content-type": "text/plain; version=0.0.4" });
    response.end([
      "# HELP tooling_requests_total Application requests excluding metrics scrapes.",
      "# TYPE tooling_requests_total counter",
      `tooling_requests_total ${requests}`,
      "# HELP tooling_uptime_seconds Seconds since this process started.",
      "# TYPE tooling_uptime_seconds gauge",
      `tooling_uptime_seconds ${process.uptime().toFixed(1)}`,
      "",
    ].join("\n"));
    return;
  }
  requests += 1;
  const body = { message, hostname: process.env.HOSTNAME ?? "local", requests };
  let status = 200;
  if (url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "healthy" }));
  } else if (url.pathname === "/api/hello") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  } else if (url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(home);
  } else {
    status = 404;
    response.writeHead(status);
    response.end("Not found");
  }
  console.log(JSON.stringify({ method: request.method, path: url.pathname, status }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Tooling lab listening on port ${server.address().port}`);
});
