import { deepStrictEqual, strictEqual } from "node:assert";
import { createRequire } from "node:module";

// Self-references resolve through package.json's public import/require exports.
const esm = await import("dnum");
const cjs = createRequire(import.meta.url)("dnum");
deepStrictEqual(Object.keys(esm).sort(), Object.keys(cjs).sort());
for (const [name, dn] of [["ESM", esm], ["CommonJS", cjs]]) {
  for (const [key, value] of Object.entries(dn)) {
    strictEqual(typeof value, "function", `${name}: ${key} must be callable`);
  }
  deepStrictEqual(dn.from("1.23"), [123n, 2]);
  deepStrictEqual(dn.add("1.23", "4.56"), [579n, 2]);
  deepStrictEqual(dn.multiply("1.49", "1.49", 0), [2n, 0]);
  deepStrictEqual(dn.divide([2999n, 3], [2000n, 3], 0), [2n, 0]);
  strictEqual(dn.format([123456n, 2], { locale: "en-US" }), "1,234.56");
  deepStrictEqual(dn.fromJSON(dn.toJSON([123n, 2])), [123n, 2]);
  strictEqual(dn.mul, dn.multiply);
  strictEqual(dn.div, dn.divide);
}
console.log(
  "Built ESM and CommonJS package exports import and execute successfully.",
);
