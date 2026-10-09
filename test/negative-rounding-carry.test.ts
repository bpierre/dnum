import { describe, expect, it } from "bun:test";
import { format, toNumber, toParts, toString } from "../src";

describe("rounding carries in decimal conversions", () => {
  it.each(
    [
      [-199n, 2, 0, 2n, null, "-2"],
      [-1299n, 2, 0, 13n, null, "-13"],
      [-9999n, 3, 2, 10n, null, "-10"],
      [-195n, 2, 1, 2n, null, "-2"],
      [-194n, 2, 1, 1n, "9", "-1.9"],
      [-99n, 2, 0, 1n, null, "-1"],
      [199n, 2, 0, 2n, null, "2"],
    ] as const,
  )(
    "converts %s at scale %s with %s displayed digits",
    (coefficient, decimals, digits, whole, fraction, text) => {
      const value = [coefficient, decimals] as const;
      expect(toParts(value, digits)).toEqual([whole, fraction]);
      expect(toString(value, digits)).toBe(text);
      expect(toNumber(value, digits)).toBe(Number(text));
      expect(format(value, { digits, locale: "en-US" })).toBe(text);
    },
  );

  it.each(
    [
      ["ROUND_HALF", 2n, "00", "-2.00"],
      ["ROUND_UP", 2n, "00", "-2.00"],
      ["ROUND_DOWN", 1n, "99", "-1.99"],
    ] as const,
  )(
    "handles %s with trailing zeros",
    (decimalsRounding, whole, fraction, text) => {
      const value = [-1999n, 3] as const;
      const options = { digits: 2, trailingZeros: true, decimalsRounding };
      expect(toParts(value, options)).toEqual([whole, fraction]);
      expect(toString(value, options)).toBe(text);
      expect(toNumber(value, options)).toBe(Number(text));
      expect(format(value, { ...options, locale: "en-US" })).toBe(text);
    },
  );

  it("carries exactly beyond Number's safe integer range", () => {
    const value = [-12345678901234567890123456789099n, 2] as const;
    expect(toParts(value, 0)).toEqual([123456789012345678901234567891n, null]);
    expect(toString(value, 0)).toBe("-123456789012345678901234567891");
  });

  it("formats grouping and trailing zeros after a carry", () => {
    expect(format([-999995n, 2], {
      digits: 1,
      trailingZeros: true,
      locale: "en-US",
    })).toBe("-10,000.0");
  });

  it("preserves the negative sign when the rounded value is nonzero", () => {
    expect(format([-199n, 2], {
      digits: 0,
      signDisplay: "exceptZero",
      locale: "en-US",
    })).toBe("-2");
  });
});
