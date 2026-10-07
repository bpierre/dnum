import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const revision = process.env.DNUM_BASELINE ?? "c4e6513";
const commit = execFileSync("git", [
  "rev-parse",
  "--verify",
  `${revision}^{commit}`,
], { encoding: "utf8" }).trim();
const files = execFileSync("git", [
  "ls-tree",
  "-r",
  "--name-only",
  commit,
  "--",
  "src",
], { encoding: "utf8" }).trim().split("\n");
for (const file of files) {
  const target = `benchmarks/.build/baseline/${file}`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, execFileSync("git", ["show", `${commit}:${file}`]));
}
await writeFile("benchmarks/.build/baseline.json", JSON.stringify({ commit }));
for (
  const [name, entry] of [[
    "baseline",
    "benchmarks/.build/baseline/src/index.ts",
  ], ["current", "src/index.ts"]]
) {
  // Both versions use identical bundling and minification settings.
  const result = await Bun.build({
    entrypoints: [entry!],
    target: "browser",
    minify: true,
    outdir: "benchmarks/.build",
    naming: `${name}.mjs`,
  });
  if (!result.success) {
    throw new AggregateError(result.logs, `Could not build ${name}`);
  }
}
