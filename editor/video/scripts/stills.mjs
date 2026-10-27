// Review frames of the outlet4 ads with one bundle: node stills.mjs <outDir> <CompositionId>:<frame,frame,...> [...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const video = path.join(here, "..");
const [outDir, ...jobs] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.join(video, "src/index.ts"), publicDir: path.join(video, "public-lean") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
for (const job of jobs) {
  const [id, list] = job.split(":");
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  for (const fr of list.split(",").map(Number)) {
    await renderStill({ serveUrl, composition, frame: fr, output: path.join(outDir, `${id}_${String(fr).padStart(4, "0")}.png`), browserExecutable, scale: 0.5 });
  }
  console.log("done", id);
}
fs.rmSync(serveUrl, { recursive: true, force: true }); // the bundle carries a copy of public-lean
