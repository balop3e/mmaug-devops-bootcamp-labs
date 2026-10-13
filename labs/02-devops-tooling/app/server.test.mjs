import test from "node:test";
import assert from "node:assert/strict";

test("the small app serves a message, health and scrapeable metrics", async () => {
  process.env.PORT = "0";
  process.env.APP_MESSAGE = "Test message";
  const { server } = await import("./server.mjs");
  if (!server.listening) await new Promise(resolve => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(url).then(r => r.text());
    assert.match(home, /One application, several tools/);
    const hello = await fetch(`${url}/api/hello`).then(r => r.json());
    assert.equal(hello.message, "Test message");
    assert.equal(hello.requests, 2);
    assert.deepEqual(await fetch(`${url}/health`).then(r => r.json()), { status: "healthy" });
    const before = await fetch(`${url}/metrics`).then(r => r.text());
    const after = await fetch(`${url}/metrics`).then(r => r.text());
    assert.match(before, /tooling_requests_total 3\n/);
    assert.match(after, /tooling_requests_total 3\n/);
    assert.match(after, /# TYPE tooling_uptime_seconds gauge/);
    assert.equal((await fetch(`${url}/missing`)).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
