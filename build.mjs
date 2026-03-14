import { build } from "esbuild";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "dist");
const manifestPath = path.join(__dirname, "demo-manifest.json");

const raw = await fs.readFile(manifestPath, "utf8");
const { demos } = JSON.parse(raw);

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const demo of demos) {
  const demoDir = path.join(outputDir, demo.slug);
  await fs.mkdir(demoDir, { recursive: true });

  const wrapper = `
import React from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify("./" + demo.entry)};

createRoot(document.getElementById("root")).render(React.createElement(App));
`;

  await build({
    absWorkingDir: __dirname,
    bundle: true,
    format: "esm",
    jsx: "automatic",
    loader: { ".js": "jsx", ".jsx": "jsx" },
    logLevel: "info",
    minify: true,
    outfile: path.join(demoDir, "app.js"),
    platform: "browser",
    stdin: {
      contents: wrapper,
      loader: "jsx",
      resolveDir: __dirname,
      sourcefile: `${demo.slug}.entry.jsx`,
    },
    target: ["es2020"],
  });

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${demo.title}</title>
    <style>html, body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(demoDir, "index.html"), html, "utf8");
  console.log(`Built: ${demo.slug}`);
}

// Create a root index that redirects to the first demo
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./${demos[0].slug}/">
    <title>Demos</title>
  </head>
  <body>
    <ul>
${demos.map((d) => `      <li><a href="./${d.slug}/">${d.title}</a></li>`).join("\n")}
    </ul>
  </body>
</html>
`;

await fs.writeFile(path.join(outputDir, "index.html"), indexHtml, "utf8");
