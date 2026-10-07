import { deepStrictEqual } from "node:assert";
import type { Dnum, Numberish, Rounding } from "../src";
import { loadImplementations } from "./load";

const { baseline, current } = await loadImplementations();
let checks = 0;
function check(label: string, call: (dn: typeof current) => unknown) {
  const outcome = (dn: typeof current) => {
    try {
      return { result: call(dn) };
    } catch (error) {
      return {
        error: (error as Error).constructor.name,
        message: (error as Error).message,
      };
    }
  };
  deepStrictEqual(outcome(current), outcome(baseline), label);
  checks++;
}
deepStrictEqual(Object.keys(current).sort(), Object.keys(baseline).sort());
const modes: Rounding[] = ["ROUND_HALF", "ROUND_UP", "ROUND_DOWN"];
const scales = [0, 1, 2, 6, 18, 36, 72, 144, 256, 257];
let seed = 42;
function next() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
const pairs: Array<[Numberish, Numberish]> = [
  [[2999n, 3], [2000n, 3]], // Division must still round twice, giving 2 at zero decimals.
  [[15n, 1], [-15n, 1]],
  [[1n, 0], [0n, 18]],
  ["-0.00000000001", "1.235"],
  [1.23e-8, 7n],
  ["1e20", "-1e-10"],
];
for (let i = 0; i < 500; i++) {
  const coefficient = () =>
    (BigInt(next()) - 2147483648n) * 10n ** BigInt(next() % 160);
  pairs.push([[coefficient(), scales[next() % scales.length]!], [
    coefficient(),
    scales[next() % scales.length]!,
  ]]);
}
for (const [a, b] of pairs) {
  for (
    const method of [
      "compare",
      "equal",
      "greaterThan",
      "lessThan",
      "greaterThanOrEqual",
      "lessThanOrEqual",
    ] as const
  ) {
    check(method, (dn) => dn[method](a, b));
  }
  for (const decimals of [undefined, 0, 2, 18, 72]) {
    for (const method of ["add", "subtract", "remainder"] as const) {
      check(method, (dn) => dn[method](a, b, decimals));
    }
    for (const rounding of modes) {
      for (const method of ["multiply", "divide"] as const) {
        check(method, (dn) => {
          const options = { decimals, rounding };
          return { value: dn[method](a, b, options), options };
        });
      }
      const tuple = baseline.from(a);
      check(
        "setDecimals",
        (dn) => dn.setDecimals(tuple, decimals ?? tuple[1], { rounding }),
      );
      check("round", (dn) => dn.round(a, { decimals, rounding }));
    }
  }
}
// Legacy behavior for unusual scale values and option objects also stays observable.
for (const decimals of [-1, -0.5, -0, 0.5, NaN, Infinity]) {
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
    check(
      `legacy scale/${method}`,
      (dn) => dn[method]([123n, decimals], [7n, 2]),
    );
    if (method !== "compare") {
      check(
        `legacy output/${method}`,
        (dn) => dn[method]([123n, 2], [7n, 1], decimals),
      );
    }
  }
}
for (const decimals of [undefined, -0, 0, 2]) {
  for (const method of ["multiply", "divide"] as const) {
    check(
      `signed zero scale/${method}`,
      (dn) => dn[method]([123n, -0], [7n, -0], decimals),
    );
    check(
      `mixed signed zero scale/${method}`,
      (dn) => dn[method]([123n, -0], [7n, 0], decimals),
    );
  }
}
for (const method of ["multiply", "divide", "round"] as const) {
  check(`default option mutation/${method}`, (dn) => {
    const options: { decimals: number; rounding?: Rounding } = { decimals: 2 };
    const result = method === "round"
      ? dn.round(12.345, options)
      : dn[method](12.345, 1.235, options);
    return { result, options };
  });
}
for (
  const a of [
    "",
    ".",
    "1.",
    "--1",
    "NaN",
    "-.5",
    ".00100",
    "123e-6",
    "9".repeat(600),
    0n,
    -12n,
  ]
) {
  for (const decimals of [true, 0, 2, 18, 256, 257] as const) {
    check("from", (dn) => dn.from(a, decimals));
  }
}
const formatted: Dnum[] = [
  [999n, 2],
  [-999n, 2],
  [1n, 18],
  [-1n, 18],
  [0n, 18],
  [BigInt("9".repeat(100)), 6],
];
for (const value of formatted) {
  for (
    const locale of [undefined, "en-US", "fr-FR", "ar-EG", "en-IN", "de-DE", [
      "fr-FR",
      "en-US",
    ], "invalid_locale"]
  ) {
    for (const compact of [false, true]) {
      for (
        const signDisplay of [
          "auto",
          "always",
          "exceptZero",
          "negative",
          "never",
        ] as const
      ) {
        for (const rounding of modes) {
          const options = {
            digits: 2,
            trailingZeros: true,
            decimalsRounding: rounding,
            compact,
            locale,
            signDisplay,
          };
          check("format", (dn) => dn.format(value, options));
        }
      }
    }
  }
  for (const digits of [0, 2, 18, 72]) {
    check("toParts", (dn) => dn.toParts(value, digits));
    check("toString", (dn) => dn.toString(value, digits));
    check(
      "significantDigits",
      (dn) =>
        dn.format(value, { significantDigits: digits || 1, locale: "fr-FR" }),
    );
  }
}
// Exercise cache eviction and mutable locale lists without depending on internals.
for (let i = 0; i < 64; i++) {
  check(
    "locale eviction",
    (dn) => dn.format([123456n, 2], { locale: `en-US-x-${i}` }),
  );
}
check("mutable locale list", (dn) => {
  const locale = ["en-US"];
  const first = dn.format([123456n, 2], { locale });
  locale[0] = "fr-FR";
  return [first, dn.format([123456n, 2], { locale })];
});
check("patched formatToParts", (dn) => {
  dn.format([123456n, 2], { locale: "fr-FR" });
  // Keep the original method only to restore it, without calling it unbound.
  // oxlint-disable-next-line typescript-eslint/unbound-method
  const original = Intl.NumberFormat.prototype.formatToParts;
  Intl.NumberFormat.prototype.formatToParts = () => [];
  try {
    return dn.format([123456n, 2], { locale: "fr-FR" });
  } finally {
    Intl.NumberFormat.prototype.formatToParts = original;
  }
});
console.log(
  `Passed ${checks} differential checks against the baseline, including results, errors and option mutation.`,
);
