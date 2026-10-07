import { deepStrictEqual } from "node:assert";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { arch, cpus, platform } from "node:os";
import { dirname } from "node:path";
import { gzipSync } from "node:zlib";
import type { Dnum } from "../src";
import { datasets } from "./cases";
import { loadImplementations } from "./load";

const args = process.argv.slice(2);
const quick = args.includes("--quick");
function argument(name: string) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}
const filter = argument("--filter");
const output = argument("--output");
const { baseline, current } = await loadImplementations();
const samples = quick ? 3 : 9;
const targetMs = quick ? 10 : 40;
export let sink: unknown;

type Task = (index: number) => unknown;
function time(run: Task, iterations: number) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) sink = run(i);
  return performance.now() - start;
}
function calibrate(run: Task) {
  let iterations = 32;
  let elapsed = time(run, iterations);
  while (elapsed < 15 && iterations < 2 ** 24) {
    iterations *= 2;
    elapsed = time(run, iterations);
  }
  return Math.max(
    1,
    Math.min(2 ** 24, Math.ceil(iterations * targetMs / elapsed)),
  );
}
function summarize(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    medianNs: sorted[Math.floor(sorted.length / 2)]!,
    minNs: sorted[0]!,
    maxNs: sorted[sorted.length - 1]!,
    samplesNs: values,
  };
}
const results: Array<
  {
    case: string;
    speedup: number;
    baseline: ReturnType<typeof summarize>;
    current: ReturnType<typeof summarize>;
    iterations: number[];
  }
> = [];
function benchmark(name: string, original: Task, optimized: Task) {
  if (filter && !name.includes(filter)) return;
  for (let i = 0; i < 16; i++) deepStrictEqual(optimized(i), original(i), name);
  const iterations = [calibrate(original), calibrate(optimized)];
  const values: number[][] = [[], []];
  const tasks = [original, optimized];
  // Alternate order within each sample to reduce drift favoring either version.
  for (let sample = 0; sample < samples; sample++) {
    for (const index of sample % 2 ? [1, 0] : [0, 1]) {
      values[index]!.push(
        time(tasks[index]!, iterations[index]!) * 1e6 / iterations[index]!,
      );
    }
  }
  const old = summarize(values[0]!);
  const next = summarize(values[1]!);
  const speedup = old.medianNs / next.medianNs;
  results.push({
    case: name,
    speedup,
    baseline: old,
    current: next,
    iterations,
  });
  console.log(
    `${name.padEnd(34)} ${old.medianNs.toFixed(0).padStart(8)} → ${
      next.medianNs.toFixed(0).padStart(8)
    } ns  ${speedup.toFixed(2)}x`,
  );
}
console.log(
  `${
    process.versions.bun
      ? `Bun ${process.versions.bun}`
      : `Node ${process.versions.node}`
  }: ${samples} alternating samples, ~${targetMs}ms per version`,
);
for (const dataset of datasets) {
  for (
    const method of [
      "add",
      "subtract",
      "multiply",
      "divide",
      "remainder",
      "compare",
    ] as const
  ) {
    benchmark(
      `${dataset.name}/${method}`,
      (i) => baseline[method](...dataset.pairs[i % 16]!),
      (i) => current[method](...dataset.pairs[i % 16]!),
    );
  }
  benchmark(
    `${dataset.name}/rescale`,
    (i) => baseline.setDecimals(dataset.pairs[i % 16]![0], 0),
    (i) => current.setDecimals(dataset.pairs[i % 16]![0], 0),
  );
}
for (const periods of [12, 365, 1000]) {
  const start: Dnum = [12345670000000000000000n, 18];
  const rate: Dnum = [137000000000000n, 18];
  const compound = (dn: typeof current) => {
    let balance = start;
    for (let i = 0; i < periods; i++) {
      balance = dn.add(balance, dn.multiply(balance, rate));
    }
    return balance;
  };
  benchmark(
    `compound/${periods}`,
    () => compound(baseline),
    () => compound(current),
  );
}
const strings = Array.from(
  { length: 16 },
  (_, i) => `12345678${i}.012345678901234567`,
);
benchmark(
  "parse/token-string",
  (i) => baseline.from(strings[i % 16]!, 18),
  (i) => current.from(strings[i % 16]!, 18),
);
for (const locale of ["en-US", "fr-FR", undefined]) {
  for (const compact of [false, true]) {
    const options = { digits: 2, locale, compact };
    benchmark(
      `format/${locale ?? "default"}/${compact ? "compact" : "standard"}`,
      (i) => baseline.format(datasets[1]!.pairs[i % 16]![0], options),
      (i) => current.format(datasets[1]!.pairs[i % 16]![0], options),
    );
  }
}
const assets = [];
for (const name of ["baseline", "current"]) {
  const bytes = await readFile(`benchmarks/.build/${name}.mjs`);
  assets.push({ name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
}
const report = {
  timestamp: new Date().toISOString(),
  baseline: JSON.parse(
    await readFile("benchmarks/.build/baseline.json", "utf8"),
  ),
  runtime: process.versions,
  machine: { cpu: cpus()[0]?.model, arch: arch(), platform: platform() },
  settings: { samples, targetMs, quick, filter },
  assets,
  results,
};
console.table(assets);
if (output) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
}
if (sink === undefined) throw new Error("No cases matched the filter");
