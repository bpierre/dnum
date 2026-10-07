import { describe, expect, it } from "bun:test";
import { format, from } from "../src";
import type { Dnum, Rounding } from "../src";

describe("format() significantDigits", () => {
  it.each([
    ["1234.567", "1,200", "1,234.57"],
    ["9.99", "10", "9.99"],
    ["0.126", "0.13", "0.13"],
    ["0.0051", "0.0051", "0.0051"],
    ["0.0049", "0.0049", "0.0049"],
    ["0.00000126", "0.0000013", "0.0000013"],
    ["0.00000101", "0.000001", "0.000001"],
    ["-0.00000126", "-0.0000013", "-0.0000013"],
    ["0", "0", "0"],
  ])("formats %s alone and with digits", (input, significant, combined) => {
    const value = from(input);
    expect(format(value, { significantDigits: 2, locale: "en-US" }))
      .toBe(significant);
    expect(format(value, { digits: 2, significantDigits: 2, locale: "en-US" }))
      .toBe(combined);
  });

  it("supports the token dust examples with one or two significant digits", () => {
    expect(format([126n, 8], { significantDigits: 1, locale: "en-US" }))
      .toBe("0.000001");
    expect(format([126n, 8], { significantDigits: 2, locale: "en-US" }))
      .toBe("0.0000013");
  });

  it("counts internal zeros and ignores storage precision", () => {
    const values: Dnum[] = [[101n, 8], [101000n, 11]];
    for (const value of values) {
      expect(format(value, { significantDigits: 2 })).toBe("0.000001");
      expect(format(value, { significantDigits: 3 })).toBe("0.00000101");
      expect(format(value, {
        digits: 2,
        significantDigits: 2,
        trailingZeros: true,
      })).toBe("0.0000010");
    }
  });

  it("keeps explicit decimal precision, including zero", () => {
    expect(format(from("1234.567"), { digits: 0, significantDigits: 2 }))
      .toBe("1,235");
    expect(format(from("1.23456"), { digits: 4, significantDigits: 2 }))
      .toBe("1.2346");
    expect(format([1n, 0], {
      digits: 2,
      significantDigits: 2,
      trailingZeros: true,
    })).toBe("1.00");
  });

  it.each([
    ["0.000001", 2, "0.0000010"],
    ["0.00999", 2, "0.010"],
    ["-0.00999", 2, "-0.010"],
    ["9.99", 2, "10"],
    ["-9.99", 2, "-10"],
    ["99.99", 3, "100"],
    ["1", 3, "1.00"],
    ["0", 1, "0"],
    ["0", 3, "0.00"],
  ])(
    "pads %s to %s significant digits",
    (input, significantDigits, expected) => {
      expect(format(from(input), { significantDigits, trailingZeros: true }))
        .toBe(expected);
    },
  );

  it("uses explicit digits to pad zero and values that carry", () => {
    expect(format([0n, 18], {
      digits: 2,
      significantDigits: 4,
      trailingZeros: true,
    })).toBe("0.00");
    expect(format(from("0.999"), {
      digits: 2,
      significantDigits: 2,
      trailingZeros: true,
    })).toBe("1.00");
  });

  it.each(
    [
      ["ROUND_HALF", "1.3", "-1.3"],
      ["ROUND_UP", "1.3", "-1.3"],
      ["ROUND_DOWN", "1.2", "-1.2"],
    ] as const,
  )(
    "uses %s for both signs",
    (decimalsRounding: Rounding, positive, negative) => {
      const options = { significantDigits: 2, decimalsRounding };
      expect(format(from("1.25"), options)).toBe(positive);
      expect(format(from("-1.25"), options)).toBe(negative);
      expect(format(from("1.2"), options)).toBe("1.2");
      expect(format(from("-1.2"), options)).toBe("-1.2");
    },
  );

  it("rounds once and handles very large and very small values exactly", () => {
    expect(format(from("1.249"), { significantDigits: 2 })).toBe("1.2");
    expect(format([12345678901234567890123456789n, 0], {
      significantDigits: 25,
      locale: "en-US",
    })).toBe("12,345,678,901,234,567,890,123,460,000");
    expect(format([126n, 100], { significantDigits: 2 }))
      .toBe("0." + "0".repeat(97) + "13");
  });

  it("applies locale and sign display after significant rounding", () => {
    expect(format([126n, 8], { significantDigits: 2, locale: "de-DE" }))
      .toBe("0,0000013");
    expect(
      format([126n, 8], {
        digits: 0,
        significantDigits: 2,
        signDisplay: "exceptZero",
      }),
    )
      .toBe("+0.0000013");
    expect(
      format([-126n, 8], { significantDigits: 2, signDisplay: "negative" }),
    )
      .toBe("-0.0000013");
    expect(format([-126n, 8], { significantDigits: 2, signDisplay: "never" }))
      .toBe("0.0000013");
    expect(format([0n, 8], { significantDigits: 2, signDisplay: "always" }))
      .toBe("+0");
    expect(format([0n, 8], { significantDigits: 2, signDisplay: "exceptZero" }))
      .toBe("0");
  });

  it.each([0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid significantDigits %s",
    (significantDigits) => {
      expect(() => format([0n, 0], { significantDigits })).toThrow(RangeError);
    },
  );

  it("accepts positive safe integers and does not mutate inputs", () => {
    const value = Object.freeze([126n, 8] as const);
    const options = Object.freeze({ significantDigits: 2 });
    expect(format(value, options)).toBe("0.0000013");
    expect(value).toEqual([126n, 8]);
    expect(format([1n, 0], { significantDigits: Number.MAX_SAFE_INTEGER }))
      .toBe("1");
  });

  it("rejects compact formatting only when significantDigits is supplied", () => {
    expect(() => format([12345n, 0], { significantDigits: 2, compact: true }))
      .toThrow("significantDigits cannot be combined with compact");
    expect(format([12345n, 0], { significantDigits: 2, compact: false }))
      .toBe("12,000");
    expect(format([12345n, 0], { compact: true })).toBe("12K");
  });
});
