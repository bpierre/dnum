# JavaScript optimization results

The JavaScript changes improve the existing tuple API without requiring callers to batch operations, change data structures, or initialize a module. Warm mixed-precision arithmetic improves by about 2–3.6×, repeated interest calculations by about 2.5–3.4×, and explicit-locale formatting by about 16–27× in these Node/Bun runs. Default-locale formatting improves by about 4.4–5.6× while still resolving the default locale on every call.

Most arithmetic gains come from reusing powers of ten, eliminating normalization work, and avoiding inflated multiplication/division operands. Formatting gains come mainly from reusing Intl formatters. The same-precision add/subtract cases benefit less because they already avoid rescaling. These measurements describe one machine and warm caches; they are not general performance guarantees.

## Environment and method

- Measurements: Node 2026-10-07T19:40:15.736Z; Bun 2026-10-07T19:40:56.249Z.
- CPU: AMD Ryzen 7 PRO 7840U w/ Radeon 780M Graphics (linux/x64).
- Node 24.20.0; Bun 1.4.0 (canary build).
- Baseline: dnum 2.18.0, `c4e6513644ee2972ca3facf72dcdadbf792586c0`.
- Both versions are built from TypeScript with identical Bun bundling/minification and installed dependencies.
- Nine warmed samples of approximately 40 ms per version. Measurement order alternates within each case; runtimes run sequentially.
- Every case checks matching results before timing. Arithmetic operands are varied, signed, and prepared before timing.

## Measurements

Median nanoseconds per API call (or per complete interest calculation). Speed is baseline/current; greater than 1 means faster.

| Case                     | Node baseline (ns) | Node optimized (ns) | Node speed | Bun baseline (ns) | Bun optimized (ns) | Bun speed |
| ------------------------ | -----------------: | ------------------: | ---------: | ----------------: | -----------------: | --------: |
| money/2dp/add            |                 54 |                  39 |      1.38× |               161 |                120 |     1.34× |
| money/2dp/subtract       |                211 |                 154 |      1.37× |               103 |                 65 |     1.58× |
| money/2dp/multiply       |                255 |                 142 |      1.79× |               377 |                194 |     1.94× |
| money/2dp/divide         |                299 |                 167 |      1.79× |               331 |                155 |     2.14× |
| money/2dp/remainder      |                122 |                 106 |      1.15× |               123 |                 83 |     1.47× |
| money/2dp/compare        |                119 |                 110 |      1.09× |               126 |                 64 |     1.96× |
| money/2dp/rescale        |                 89 |                  34 |      2.64× |               229 |                119 |     1.93× |
| tokens/18dp/add          |                143 |                 127 |      1.12× |               120 |                 94 |     1.28× |
| tokens/18dp/subtract     |                151 |                 120 |      1.26× |               141 |                 91 |     1.54× |
| tokens/18dp/multiply     |                531 |                 201 |      2.64× |               486 |                230 |     2.12× |
| tokens/18dp/divide       |                749 |                 343 |      2.18× |               565 |                225 |     2.51× |
| tokens/18dp/remainder    |                164 |                 144 |      1.14× |               134 |                 87 |     1.54× |
| tokens/18dp/compare      |                113 |                  93 |      1.22× |               119 |                 63 |     1.89× |
| tokens/18dp/rescale      |                355 |                 103 |      3.45× |               247 |                108 |     2.28× |
| tokens/6-18dp/add        |                409 |                 199 |      2.05× |               280 |                142 |     1.98× |
| tokens/6-18dp/subtract   |                357 |                 164 |      2.18× |               323 |                157 |     2.06× |
| tokens/6-18dp/multiply   |                737 |                 222 |      3.33× |               712 |                240 |     2.97× |
| tokens/6-18dp/divide     |                794 |                 282 |      2.82× |               701 |                192 |     3.65× |
| tokens/6-18dp/remainder  |                404 |                 182 |      2.22× |               294 |                140 |     2.09× |
| tokens/6-18dp/compare    |                297 |                 128 |      2.32× |               221 |                 92 |     2.39× |
| tokens/6-18dp/rescale    |                406 |                 116 |      3.51× |               311 |                131 |     2.37× |
| large/72dp/add           |                455 |                 183 |      2.49× |               371 |                164 |     2.26× |
| large/72dp/subtract      |                538 |                 215 |      2.50× |               367 |                162 |     2.27× |
| large/72dp/multiply      |               2034 |                 836 |      2.43× |              1200 |                420 |     2.86× |
| large/72dp/divide        |               1576 |                 552 |      2.85× |              1091 |                348 |     3.13× |
| large/72dp/remainder     |                569 |                 223 |      2.55× |               335 |                145 |     2.32× |
| large/72dp/compare       |                435 |                 165 |      2.64× |               275 |                119 |     2.30× |
| large/72dp/rescale       |                635 |                 221 |      2.87× |               492 |                185 |     2.66× |
| huge/512digits/add       |                219 |                 181 |      1.21× |               182 |                153 |     1.19× |
| huge/512digits/subtract  |                223 |                 177 |      1.26× |               179 |                159 |     1.13× |
| huge/512digits/multiply  |               3376 |                2685 |      1.26× |              2359 |               1918 |     1.23× |
| huge/512digits/divide    |               2157 |                1325 |      1.63× |              1415 |               1071 |     1.32× |
| huge/512digits/remainder |                235 |                 237 |      0.99× |               166 |                129 |     1.28× |
| huge/512digits/compare   |                145 |                 133 |      1.09× |               154 |                105 |     1.47× |
| huge/512digits/rescale   |               1148 |                 693 |      1.66× |              1571 |               1054 |     1.49× |
| compound/12              |               6979 |                2259 |      3.09× |             13305 |               4689 |     2.84× |
| compound/365             |             246121 |               73465 |      3.35× |            223248 |              88059 |     2.54× |
| compound/1000            |             521920 |              162282 |      3.22× |            506139 |             204190 |     2.48× |
| parse/token-string       |                945 |                 710 |      1.33× |               807 |                645 |     1.25× |
| format/en-US/standard    |              46244 |                1688 |     27.40× |             29086 |               1796 |    16.20× |
| format/en-US/compact     |              51190 |                1868 |     27.40× |             31883 |               1863 |    17.12× |
| format/fr-FR/standard    |              45355 |                1825 |     24.85× |             28673 |               1775 |    16.15× |
| format/fr-FR/compact     |              63004 |                2342 |     26.90× |             28108 |               1591 |    17.66× |
| format/default/standard  |              62056 |               14039 |      4.42× |             31737 |               6278 |     5.06× |
| format/default/compact   |              68014 |               13662 |      4.98× |             35568 |               6346 |     5.60× |

The 512-digit remainder case is effectively unchanged on Node (0.99×). Earlier quick/intermediate runs also showed small slowdowns in some tiny operations; those readings varied with runtime/JIT conditions. The table retains every case rather than selecting only improvements. This experiment does not establish statistical significance for small differences.

## Bundle and memory costs

| Full minified browser bundle | Raw bytes | Gzip bytes (Node) |
| ---------------------------- | --------: | ----------------: |
| baseline                     |      5829 |              2290 |
| current                      |      7037 |              2645 |

The optimized full API adds 1208 raw bytes and 355 gzip bytes. No dependencies were added. Compression differs slightly between runtimes.

Caches are lazy and bounded: at most 257 powers of ten (exponents 0–256) and 32 locale records, each holding one standard formatter and optionally one compact formatter. Higher precisions retain the original construction path. Mutable locale lists are not cached. Actual retained heap size and cold-start timing were not measured.

## Compatibility checks

- 135 unit tests passed, including regression tests for two-stage division rounding, rounding products after multiplication, and signed-zero precision.
- 42,715 differential checks passed in each of Node and Bun against the original source, comparing results, error names/messages, and option mutation.
- TypeScript checks and lint passed with zero warnings. Export names and public type signatures are unchanged.
- Formatting checks include locale arrays, cache eviction, significant digits, and the existing formatToParts monkey-patch behavior.

## Existing package build issue

The repository’s `bun run build` exits successfully with the installed bunup 0.16.10 and Bun 1.4.0 canary, but its generated ESM file fails to import: `SyntaxError: Export 'abs' is not defined in module`. The same failure was reproduced independently using unchanged source, package.json, and tsconfig.json from the baseline commit. This issue is outside the optimization changes. The comparison and parity checks use valid standalone Bun-built ESM bundles, which import and execute in both runtimes.

## Reproduce

See [README.md](./README.md) for commands, baseline selection, and measurement boundaries. Full local sample data is saved in `benchmarks/results/js-node.json` and `benchmarks/results/js-bun.json`; raw runs are ignored by Git. This summary records the measured implementation and is not rewritten by subsequent runs.
