import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json"
};

function headersFor(filePath, size = 0) {
  const extension = extname(filePath);
  const headers = {
    "content-type": mime[extension] || "application/octet-stream",
    "cache-control": "no-store, max-age=0",
    "access-control-allow-origin": "*",
    "x-content-type-options": "nosniff"
  };

  if (size > 0) {
    headers["content-length"] = String(size);
  }

  return headers;
}

function resolveFile(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const filePath = normalize(join(root, cleanUrl === "/" ? "index.html" : cleanUrl));
  if (!filePath.startsWith(root)) return null;
  if (!existsSync(filePath)) return null;
  const stats = statSync(filePath);
  if (stats.isDirectory()) return join(filePath, "index.html");
  return filePath;
}

createServer((request, response) => {
  if (request.url === "/healthz") {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("ok");
    return;
  }

  const filePath = resolveFile(request.url || "/");
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const stats = statSync(filePath);
  response.writeHead(200, headersFor(filePath, stats.size));

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).on("error", (error) => {
    console.error(`Failed to stream ${filePath}`, error);
    if (!response.headersSent) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    }
    response.end("Internal server error");
  }).pipe(response);
}).listen(port, "0.0.0.0", () => {
  const local = `http://localhost:${port}/`;
  const lan = Object.values(networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item.address}:${port}/`);

  console.log("Kitchen AR web service");
  console.log(`Serving: ${root}`);
  console.log(`Local: ${local}`);
  lan.forEach((url) => console.log(`Phone on same Wi-Fi: ${url}`));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down.");
  process.exit(0);
});
