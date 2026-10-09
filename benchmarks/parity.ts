import { deepStrictEqual } from "node:assert";
import type { Dnum, Numberish, Rounding } from "../src";
import { loadImplementations } from "./load";

const { baseline, current } = await loadImplementations();
let checks = 0;
function check(
  label: string,
  call: (dn: typeof current) => unknown,
  expected?: { result: unknown },
) {
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
  deepStrictEqual(outcome(current), expected ?? outcome(baseline), label);
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
const pick = (length: number) => Math.floor(next() / 2 ** 32 * length);
function coefficient(profile: number): bigint {
  const signed = () => BigInt(next()) - 2147483648n;
  if (profile === 0) return signed();
  if (profile === 1) {
    // Large coefficients with arbitrary digits, rather than only trailing zeros.
    let value = 0n;
    for (let i = 0; i < 16; i++) value = (value << 32n) + BigInt(next());
    return pick(2) ? value : -value;
  }
  if (profile === 2) {
    const boundaries = [9n, 10n, 11n, 49n, 50n, 51n, 149n, 150n, 151n];
    const value = boundaries[pick(boundaries.length)]!;
    return pick(2) ? value : -value;
  }
  if (profile === 3) return [0n, 1n, -1n][pick(3)]!;
  return signed() * 10n ** BigInt(pick(160));
}
// Guarantee every scale pairing for each coefficient profile. Taking an LCG's
// low bits modulo the scale count previously excluded all equal-scale pairs.
for (let profile = 0; profile < 5; profile++) {
  for (const leftScale of scales) {
    for (const rightScale of scales) {
      pairs.push([
        [coefficient(profile), leftScale],
        [coefficient(profile), rightScale],
      ]);
    }
  }
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
    // Non-Latin numbering systems have explicit regression expectations below.
    const locale of [
      undefined,
      "en-US",
      "fr-FR",
      "ar-EG-u-nu-latn",
      "en-IN",
      "de-DE",
      [
        "fr-FR",
        "en-US",
      ],
      "invalid_locale",
    ]
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
    // The baseline loses magnitude when a negative fraction carries into the
    // whole part. Assert the corrected results instead of preserving that bug.
    const negativeCarry = value[0] === -999n && value[1] === 2 && digits === 0;
    check(
      "toParts",
      (dn) => dn.toParts(value, digits),
      negativeCarry ? { result: [10n, null] } : undefined,
    );
    check(
      "toString",
      (dn) => dn.toString(value, digits),
      negativeCarry ? { result: "-10" } : undefined,
    );
    check(
      "significantDigits",
      (dn) =>
        dn.format(value, { significantDigits: digits || 1, locale: "fr-FR" }),
    );
  }
}
for (
  const [locale, positive, tiny] of [
    ["ar-EG", "١٬٢٣٤٫٥٦", "٠٫٠٥"],
    ["fa-IR", "۱٬۲۳۴٫۵۶", "۰٫۰۵"],
    ["en-US-u-nu-fullwide", "１,２３４.５６", "０.０５"],
    ["zh-CN-u-nu-hanidec", "一,二三四.五六", "〇.〇五"],
  ]
) {
  check("localized fraction", (dn) => dn.format([123456n, 2], { locale }), {
    result: positive,
  });
  check(
    "negative localized fraction",
    (dn) => dn.format([-123456n, 2], { locale }),
    {
      result: `-${positive}`,
    },
  );
  check("localized leading zeros", (dn) => dn.format([5n, 2], { locale }), {
    result: tiny,
  });
}
check(
  "compact prefix",
  (dn) => dn.format([12345678n, 2], { locale: "sw", compact: true }),
  {
    result: new Intl.NumberFormat("sw", { notation: "compact" }).format(
      123456n,
    ),
  },
);
// Check formatting across many locale keys; allocation/eviction is asserted in
// test/format-cache.test.ts.
for (let i = 0; i < 64; i++) {
  check(
    "many locale keys",
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
  `Passed ${checks} compatibility checks against the baseline or explicit regression expectations, including results, errors and option mutation.`,
);
