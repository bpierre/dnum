# Benchmarks

Compare the working tree's performance and behavior against a Git revision of
dnum using the same public API.

Use stable Bun 1.4.2 (pinned in `package.json`) and Node 24. Run from the
repository root with the Bun dependencies installed:

```sh
bun run bench --output benchmarks/results/js-bun.json
bun run bench:node --output benchmarks/results/js-node.json
```

Use `--quick` for three short samples, or `--filter tokens/6-18dp` to select cases.
Full runs use nine samples of approximately forty milliseconds per version. Run
Node and Bun sequentially on an idle machine. Results are exploratory
microbenchmarks, without statistical significance claims.

## Comparison and correctness

`build:bench` reads the original TypeScript source directly from Git at commit
`c4e6513` (dnum 2.18.0), writes a temporary snapshot under `.build`, and bundles it
alongside the working tree with identical Bun settings. Each version resolves
the same installed dependency versions. Set `DNUM_BASELINE` to another Git
revision to choose a different baseline; the resolved commit is recorded in the
JSON output. No checkout or network access is needed.

Both versions run in the same process. Arithmetic uses sixteen varied,
preconstructed signed operand pairs per dataset. Cases
cover money, token amounts with equal/mixed precision, large coefficients,
rescaling, parsing, formatting, and interest calculations that call the existing
`multiply` and `add` functions each period. Formatting uses both explicit and
default locales, with standard and compact notation.

Each case checks equal results before timing. Both versions are warmed up and
calibrated independently, then their measurement order alternates per sample.
The exported result sink keeps outputs observable. Console output shows median
nanoseconds per call and the baseline/current speed ratio. JSON preserves all
samples, iteration counts, runtime versions, CPU, timestamp, baseline commit,
and bundle sizes. Formatting and power-cache timings describe warmed caches.

Run the complete validation suite (also run by GitHub Actions):

```sh
bun run test
bun run check:bench
bun run lint
```

`bun run test` runs unit tests, compatibility checks in Bun and Node, and the
package build. Use `bun run test:unit` for unit tests alone; `test:parity` and
`test:parity:node` remain available separately.

The parity runner checks over 42,000 outcomes against the original code in each
runtime. Its 500 generated pairs cover all 100 scale combinations, including
equal precision, with small, arbitrary-digit large, rounding-boundary, zero, and
trailing-zero coefficients. It covers all rounding modes, default/explicit
precision, mixed input types, errors, unusual scale values, option mutation,
locale lists, significant digits, and patched `formatToParts`. Both result
values and error names/messages are compared. A focused unit test counts
formatter allocations to verify reuse, lazy compact initialization, and eviction.

`bun run build` verifies that the public ESM and CommonJS package exports import
and execute in both Node and Bun. GitHub Actions uses the Bun version pinned in
`package.json`.

Generated snapshots, bundles, and raw JSON runs are ignored by Git.
