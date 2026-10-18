import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { fetchPage, analyzePage, SeoError, SeoValidationError } from "../src/index.js";

let server;
let serverPort;
let baseUrl;

before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/page") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Crawled Page</title>
          <meta name="description" content="This is a test crawled page description for unit testing.">
          <link rel="canonical" href="${baseUrl}/page">
        </head>
        <body>
          <h1>Crawled Heading</h1>
        </body>
        </html>
      `);
    } else if (req.url === "/redirect") {
      res.writeHead(302, { Location: `${baseUrl}/page` });
      res.end();
    } else if (req.url === "/slow") {
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><title>Slow</title></html>");
      }, 500);
    } else if (req.url === "/error") {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      serverPort = server.address().port;
      baseUrl = `http://127.0.0.1:${serverPort}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

test("fetchPage successfully retrieves HTML content and metadata", async () => {
  const result = await fetchPage(`${baseUrl}/page`);
  assert.equal(result.statusCode, 200);
  assert.equal(result.url, `${baseUrl}/page`);
  assert.ok(result.html.includes("Test Crawled Page"));
  assert.ok(typeof result.responseTimeMs === "number");
  assert.equal(result.redirected, false);
});

test("fetchPage follows redirects", async () => {
  const result = await fetchPage(`${baseUrl}/redirect`);
  assert.equal(result.statusCode, 200);
  assert.equal(result.redirected, true);
  assert.equal(result.finalUrl, `${baseUrl}/page`);
});

test("fetchPage handles HTTP error codes", async () => {
  await assert.rejects(
    async () => {
      await fetchPage(`${baseUrl}/error`);
    },
    (err) => {
      return err instanceof SeoError && err.code === "HTTP_ERROR";
    }
  );
});

test("fetchPage validates invalid URLs before network call", async () => {
  await assert.rejects(
    async () => {
      await fetchPage("not-a-valid-url");
    },
    (err) => {
      return err instanceof SeoValidationError;
    }
  );
});

test("fetchPage aborts on timeout", async () => {
  await assert.rejects(
    async () => {
      await fetchPage(`${baseUrl}/slow`, { timeout: 100 });
    },
    (err) => {
      return err instanceof SeoError && err.code === "REQUEST_TIMEOUT";
    }
  );
});

test("analyzePage crawls and audits a live webpage", async () => {
  const audit = await analyzePage(`${baseUrl}/page`);
  assert.equal(audit.url, `${baseUrl}/page`);
  assert.equal(audit.statusCode, 200);
  assert.equal(audit.title.present, true);
  assert.equal(audit.title.text, "Test Crawled Page");
  assert.equal(audit.description.present, true);
  assert.equal(audit.headings.h1Count, 1);
  assert.ok(audit.score.score > 0);
});
