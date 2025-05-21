import { describe, expect, it } from "vitest";
import {
  abs,
  add,
  ceil,
  compare,
  divide,
  equal,
  equalizeDecimals,
  floor,
  format,
  from,
  fromJSON,
  greaterThan,
  greaterThanOrEqual,
  isDnum,
  lessThan,
  lessThanOrEqual,
  multiply,
  remainder,
  round,
  setDecimals,
  subtract,
  toJSON,
  toNumber,
  toParts,
  toString,
} from "../src";
import { setValueDecimals } from "../src/dnum";
import { formatSign } from "../src/formatting";
import { divideAndRound } from "../src/utils";

describe("isDnum()", () => {
  it("detects the Dnum data structure", () => {
    expect(isDnum(null)).toBe(false);
    expect(isDnum(1n)).toBe(false);
    expect(isDnum([1, 2])).toBe(false);
    expect(isDnum([10n])).toBe(false);
    expect(isDnum([10n, 1, 1])).toBe(true); // More than 2 entries is still valid
    expect(isDnum([1n, 1])).toBe(true);
  });
});

describe("setValueDecimals()", () => {
  it("increases decimals", () => {
    expect(setValueDecimals(123456n, 2)).toBe(12345600n);
    expect(setValueDecimals(1n, 4)).toBe(10000n);
    expect(setValueDecimals(-1n, 4)).toBe(-10000n);
  });
  it("decreases decimals", () => {
    expect(setValueDecimals(123449n, -2)).toBe(1234n);
    expect(setValueDecimals(-10000n, -2)).toBe(-100n);
    expect(setValueDecimals(-10000n, -4)).toBe(-1n);
  });
  it("rounds decimals when decreasing", () => {
    expect(setValueDecimals(123456n, -2)).toBe(1235n);
    expect(setValueDecimals(123456n, -6)).toBe(0n);
    expect(setValueDecimals(-123456n, -2)).toBe(-1235n);
  });
  it("leaves decimals unchanged", () => {
    expect(setValueDecimals(123456n, 0)).toBe(123456n);
  });
  it("round decimals up when specified and decreasing", () => {
    expect(setValueDecimals(1234n, -2, { rounding: "ROUND_UP" })).toBe(13n);
    expect(setValueDecimals(123456n, -2, { rounding: "ROUND_UP" })).toBe(1235n);
    expect(setValueDecimals(-1234n, -2, { rounding: "ROUND_UP" })).toBe(-12n);
    expect(setValueDecimals(-123456n, -2, { rounding: "ROUND_UP" })).toBe(-1234n);
  });
  it("round decimals down when specified and decreasing", () => {
    expect(setValueDecimals(1234n, -2, { rounding: "ROUND_DOWN" })).toBe(12n);
    expect(setValueDecimals(123456n, -2, { rounding: "ROUND_DOWN" })).toBe(1234n);
    expect(setValueDecimals(-1234n, -2, { rounding: "ROUND_DOWN" })).toBe(-13n);
    expect(setValueDecimals(-123456n, -2, { rounding: "ROUND_DOWN" })).toBe(-1235n);
  });
});

describe("setDecimals()", () => {
  it("increases decimals", () => {
    expect(setDecimals([123456n, 0], 2)).toEqual([12345600n, 2]);
  });
  it("decreases decimals", () => {
    expect(setDecimals([123456n, 2], 1)).toEqual([12346n, 1]);
  });
  it("leaves decimals unchanged", () => {
    expect(setDecimals([123456n, 4], 4)).toEqual([123456n, 4]);
  });
  it("removes the decimals", () => {
    expect(setDecimals([123456n, 4], 0)).toEqual([12n, 0]);
  });
  it("throws if decimals are negative", () => {
    expect(() => setDecimals([123456n, -4], 4)).toThrowError("negative");
    expect(() => setDecimals([123456n, 4], -4)).toThrowError("negative");
  });
  it("round decimals up when specified and decreasing", () => {
    expect(setDecimals([1234n, 2], 1, { rounding: "ROUND_UP" })).toEqual([124n, 1]);
  });
  it("round decimals down when specified and decreasing", () => {
    expect(setDecimals([123456n, 2], 1, { rounding: "ROUND_DOWN" })).toEqual([12345n, 1]);
  });
});

describe("add()", () => {
  it("adds positive values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [124691n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
    expect(add(a2, a1, result[1])).toEqual(result);
    expect(add(a1, 12.3456, result[1])).toEqual(result);
    expect(add(12.3456, 14.48)).toEqual([268256n, 4]);
    expect(add(12.3456, 14.48, 4)).toEqual([268256n, 4]);
    expect(add(12.3456, 14.48, 3)).toEqual([26826n, 3]);
  });
  it("adds negative values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [122221n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
    expect(add(a2, a1, result[1])).toEqual(result);
    expect(add(a2, a2)).toEqual([-246912n, 4]);
    expect(add(a2, a2, 2)).toEqual([-2469n, 2]);
  });
  it("throws if decimals are negative", () => {
    expect(() => add([1n, -1], [1n, 1], 1)).toThrowError(
      "negative",
    );
    expect(() => add([1n, 1], [1n, -1], 1)).toThrowError(
      "negative",
    );
    expect(() => add([1n, 1], [1n, 1], -1)).toThrowError(
      "negative",
    );
  });
  it("defaults to use value1 as decimals", () => {
    expect(add([12345n, 2], [20000n, 4])).toEqual([12545n, 2]);
  });
  it("accepts numbers", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 1234.56;
    const result = [246912n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
  });
  it("accepts bigints", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 123456n;
    const result = [12469056n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
  });
});

describe("subtract()", () => {
  it("subtracts positive values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    expect(subtract(a1, a2, 2)).toEqual([122221n, 2]);
    expect(subtract(a2, a1, 2)).toEqual([-122221n, 2]);
    expect(subtract(16.34, 14.44548)).toEqual([189452n, 5]);
    expect(subtract(16.34, 14.44548, 5)).toEqual([189452n, 5]);
    expect(subtract(16.34, 14.44548, 0)).toEqual([2n, 0]);
  });
  it("subtracts negative values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    expect(subtract(a1, a2, 2)).toEqual([124691n, 2]);
    expect(subtract(a2, a1, 2)).toEqual([-124691n, 2]);
    expect(subtract(a2, a2, 2)).toEqual([0n, 2]);
  });
  it("throws if decimals are negative", () => {
    expect(() => subtract([1n, -1], [1n, 1], 1)).toThrowError(
      "negative",
    );
    expect(() => subtract([1n, 1], [1n, -1], 1)).toThrowError(
      "negative",
    );
    expect(() => subtract([1n, 1], [1n, 1], -1)).toThrowError(
      "negative",
    );
  });
  it("defaults to use value1 as decimals", () => {
    expect(subtract([12345n, 2], [20000n, 4])).toEqual([12145n, 2]);
  });
  it("accepts numbers", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 1234.56;
    expect(subtract(a1, a2, 2)).toEqual([0n, 2]);
  });
  it("accepts bigints", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 1234n;
    expect(subtract(a1, a2, 2)).toEqual([56n, 2]);
  });
});

describe("multiply()", () => {
  it("multiplies positive values and round", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [1524138n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
    expect(multiply(a2, a1, result[1])).toEqual(result);
    expect(multiply(16.34, 14.4454)).toEqual([2360378n, 4]);
    expect(multiply(16.34, 14.4454, 3)).toEqual([236038n, 3]);
  });
  it("multiplies positive values and round up", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [1524139n, 2] as const;
    expect(
      multiply(a1, a2, { decimals: result[1], rounding: "ROUND_UP" })
    ).toEqual(result);
    expect(
      multiply(a2, a1, { decimals: result[1], rounding: "ROUND_UP" })
    ).toEqual(result);
    expect(
      multiply(16.34, 14.4454, { rounding: "ROUND_UP" })
    ).toEqual([2360379n, 4]);
    expect(
      multiply(16.34, 14.4454, { decimals: 3, rounding: "ROUND_UP" })
    ).toEqual([236038n, 3]);
  });
  it("multiplies positive values and round down", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [1524138n, 2] as const;
    expect(
      multiply(a1, a2, { decimals: result[1], rounding: "ROUND_DOWN" })
    ).toEqual(result);
    expect(
      multiply(a2, a1, { decimals: result[1], rounding: "ROUND_DOWN" })
    ).toEqual(result);
    expect(
      multiply(16.34, 14.4454, { rounding: "ROUND_DOWN" })
    ).toEqual([2360378n, 4]);
    expect(
      multiply(16.34, 14.4454, { decimals: 3, rounding: "ROUND_DOWN" })
    ).toEqual([236037n, 3]);
  });
  it("multiplies negative values and round", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [-1524138n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
    expect(multiply(a2, a1, result[1])).toEqual(result);
  });
  it("multiplies negative values and round up", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [-1524138n, 2] as const;
    expect(
      multiply(a1, a2, { decimals: result[1], rounding: "ROUND_UP" })
    ).toEqual(result);
    expect(
      multiply(a2, a1, { decimals: result[1], rounding: "ROUND_UP" })
    ).toEqual(result);
  });
  it("multiplies negative values and round down", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [-1524139n, 2] as const;
    expect(
      multiply(a1, a2, { decimals: result[1], rounding: "ROUND_DOWN" })
    ).toEqual(result);
    expect(
      multiply(a2, a1, { decimals: result[1], rounding: "ROUND_DOWN" })
    ).toEqual(result);
  });
  it("throws if decimals are negative", () => {
    expect(() => multiply([1n, -1], [1n, 1], 1)).toThrowError(
      "negative",
    );
    expect(() => multiply([1n, 1], [1n, -1], 1)).toThrowError(
      "negative",
    );
    expect(() => multiply([1n, 1], [1n, 1], -1)).toThrowError(
      "negative",
    );
  });
  it("defaults to use value1 as decimals", () => {
    expect(multiply([12345n, 2], [20000n, 4])).toEqual([24690n, 2]);
  });
  it("accepts numbers", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 1234.56;
    const result = [152413839n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
  });
  it("accepts bigints", () => {
    const a1 = [123456n, 2] as const;
    const a2 = 123456n;
    const result = [15241383936n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
  });
});

describe("divide()", () => {
  it("divides positive values and round", () => {
    expect(divide([4n, 0], [2n, 0], 0)).toEqual([2n, 0]);
    expect(divide([123456n, 4], [300000000n, 8], 2)).toEqual([412n, 2]);
    expect(divide([123456n, 4], [300000000n, 8], 4)).toEqual([
      41152n,
      4,
    ]);
    expect(divide([123456n, 4], [300000000n, 8], 5)).toEqual([
      411520n,
      5,
    ]);
    expect(divide(8, 2, 8)).toEqual([400000000n, 8]);
    expect(divide(16.342, 14.43)).toEqual([1133n, 3]);
  });
  it("divides positive values and round up", () => {
    expect(
      divide([4n, 0], [2n, 0], { decimals: 0, rounding: "ROUND_UP" })
    ).toEqual([2n, 0]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 2, rounding: "ROUND_UP" })
    ).toEqual([412n, 2]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 4, rounding: "ROUND_UP" })
    ).toEqual([41152n, 4]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 5, rounding: "ROUND_UP" })
    ).toEqual([411520n, 5]);
    expect(
      divide(8, 2, { decimals: 8, rounding: "ROUND_UP" })
    ).toEqual([400000000n, 8]);
    expect(divide(16.342, 14.43, { rounding: "ROUND_UP" })).toEqual([1133n, 3]);
  });
  it("divides positive values and round down", () => {
    expect(
      divide([4n, 0], [2n, 0], { decimals: 0, rounding: "ROUND_DOWN" })
    ).toEqual([2n, 0]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 2, rounding: "ROUND_DOWN" })
    ).toEqual([411n, 2]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 4, rounding: "ROUND_DOWN" })
    ).toEqual([41152n, 4]);
    expect(
      divide([123456n, 4], [300000000n, 8], { decimals: 5, rounding: "ROUND_DOWN" })
    ).toEqual([411520n, 5]);
    expect(
      divide(8, 2, { decimals: 8, rounding: "ROUND_DOWN" })
    ).toEqual([400000000n, 8]);
    expect(divide(16.342, 14.43, { rounding: "ROUND_DOWN" })).toEqual([1132n, 3]);
  });
  it("divides negative values and round", () => {
    expect(divide([-4n, 0], [2n, 0], 0)).toEqual([-2n, 0]);
    expect(divide([123456n, 4], [-300000000n, 8], 2)).toEqual([-412n, 2]);
    expect(divide([-123456n, 4], [300000000n, 8], 4)).toEqual([
      -41152n,
      4,
    ]);
    expect(divide([123456n, 4], [-300000000n, 8], 5)).toEqual([
      -411520n,
      5,
    ]);
    expect(divide(-8, 2, 8)).toEqual([-400000000n, 8]);
    expect(divide(16.342, -14.43)).toEqual([-1133n, 3]);
  });
  it("divides negative values and round up", () => {
    expect(
      divide([-4n, 0], [2n, 0], { decimals: 0, rounding: "ROUND_UP"})
    ).toEqual([-2n, 0]);
    expect(
      divide([123456n, 4], [-300000000n, 8], { decimals: 2, rounding: "ROUND_UP"})
    ).toEqual([-411n, 2]);
    expect(
      divide([-123456n, 4], [300000000n, 8], { decimals: 4, rounding: "ROUND_UP"})
    ).toEqual([-41152n, 4]);
    expect(
      divide([123456n, 4], [-300000000n, 8], { decimals: 5, rounding: "ROUND_UP"})
    ).toEqual([-411520n, 5]);
    expect(
      divide(-8, 2, { decimals: 8, rounding: "ROUND_UP"})
    ).toEqual([-400000000n, 8]);
    expect(divide(16.342, -14.43, { rounding: "ROUND_UP"})).toEqual([-1132n, 3]);
  });
  it("divides negative values and round down", () => {
    expect(
      divide([-4n, 0], [2n, 0], { decimals: 0, rounding: "ROUND_DOWN"})
    ).toEqual([-2n, 0]);
    expect(
      divide([123456n, 4], [-300000000n, 8], { decimals: 2, rounding: "ROUND_DOWN"})
    ).toEqual([-412n, 2]);
    expect(
      divide([-123456n, 4], [300000000n, 8], { decimals: 4, rounding: "ROUND_DOWN"})
    ).toEqual([-41152n, 4]);
    expect(
      divide([123456n, 4], [-300000000n, 8], { decimals: 5, rounding: "ROUND_DOWN"})
    ).toEqual([-411520n, 5]);
    expect(
      divide(-8, 2, { decimals: 8, rounding: "ROUND_DOWN"})
    ).toEqual([-400000000n, 8]);
    expect(divide(16.342, -14.43, { rounding: "ROUND_DOWN"})).toEqual([-1133n, 3]);
  });
  it("throws if decimals are negative", () => {
    expect(() => divide([1n, -1], [1n, 1], 1)).toThrowError(
      "negative",
    );
    expect(() => divide([1n, 1], [1n, -1], 1)).toThrowError(
      "negative",
    );
    expect(() => divide([1n, 1], [1n, 1], -1)).toThrowError(
      "negative",
    );
  });
  it("throws if dividing by zero", () => {
    expect(() => divide([1n, 1], [0n, 1], 1)).toThrowError(
      "zero",
    );
  });
  it("defaults to use value1 as decimals", () => {
    expect(divide([12345n, 2], [20000n, 4])).toEqual([6173n, 2]);
  });
  it("accepts numbers", () => {
    expect(divide([123456n, 4], 3, 2)).toEqual([412n, 2]);
  });
  it("accepts bigints", () => {
    expect(divide([123456n, 4], 3n, 2)).toEqual([412n, 2]);
  });
});

describe("remainder()", () => {
  it("works", () => {
    expect(remainder(10, 7)).toEqual([3n, 0]);
    expect(remainder(-10, 7)).toEqual([-3n, 0]);
    expect(remainder(10, -7)).toEqual([3n, 0]);
    expect(remainder(-10, -7)).toEqual([-3n, 0]);
    expect(remainder(10, 7, 40)).toEqual([
      30000000000000000000000000000000000000000n,
      40,
    ]);
    expect(remainder([10_00000000n, 8], 7)).toEqual([3_00000000n, 8]);
  });
});

describe("divideAndRound()", () => {
  it("rounds decimals", () => {
    expect(divideAndRound(1n, 1n)).toBe(1n);
    expect(divideAndRound(1n, 3n)).toBe(0n);
    expect(divideAndRound(20n, 2n)).toBe(10n);
    expect(divideAndRound(20n, 3n)).toBe(7n);
    expect(divideAndRound(20n, 6n)).toBe(3n);
    expect(divideAndRound(20n, 7n)).toBe(3n);
    expect(divideAndRound(15n, 2n)).toBe(8n);

    expect(divideAndRound(-1n, 1n)).toBe(-1n);
    expect(divideAndRound(1n, -3n)).toBe(0n);
    expect(divideAndRound(-20n, 2n)).toBe(-10n);
    expect(divideAndRound(20n, -3n)).toBe(-7n);
    expect(divideAndRound(-20n, 6n)).toBe(-3n);
    expect(divideAndRound(20n, -7n)).toBe(-3n);
    expect(divideAndRound(-15n, 2n)).toBe(-8n);
  });

  it("rounds decimals up", () => {
    expect(divideAndRound(1n, 1n, "ROUND_UP")).toBe(1n);
    expect(divideAndRound(1n, 3n, "ROUND_UP")).toBe(1n);
    expect(divideAndRound(20n, 2n, "ROUND_UP")).toBe(10n);
    expect(divideAndRound(20n, 3n, "ROUND_UP")).toBe(7n);
    expect(divideAndRound(20n, 6n, "ROUND_UP")).toBe(4n);
    expect(divideAndRound(20n, 7n, "ROUND_UP")).toBe(3n);
    expect(divideAndRound(15n, 2n, "ROUND_UP")).toBe(8n);

    expect(divideAndRound(-1n, 1n, "ROUND_UP")).toBe(-1n);
    expect(divideAndRound(-1n, 3n, "ROUND_UP")).toBe(0n);
    expect(divideAndRound(-20n, 2n, "ROUND_UP")).toBe(-10n);
    expect(divideAndRound(-20n, 3n, "ROUND_UP")).toBe(-6n);
    expect(divideAndRound(-20n, 6n, "ROUND_UP")).toBe(-3n);
    expect(divideAndRound(-20n, 7n, "ROUND_UP")).toBe(-2n);
    expect(divideAndRound(-15n, 2n, "ROUND_UP")).toBe(-7n);
  });

  it("rounds decimals down", () => {
    expect(divideAndRound(1n, 1n, "ROUND_DOWN")).toBe(1n);
    expect(divideAndRound(1n, 3n, "ROUND_DOWN")).toBe(0n);
    expect(divideAndRound(20n, 2n, "ROUND_DOWN")).toBe(10n);
    expect(divideAndRound(20n, 3n, "ROUND_DOWN")).toBe(6n);
    expect(divideAndRound(20n, 6n, "ROUND_DOWN")).toBe(3n);
    expect(divideAndRound(20n, 7n, "ROUND_DOWN")).toBe(2n);
    expect(divideAndRound(15n, 2n, "ROUND_DOWN")).toBe(7n);

    expect(divideAndRound(-1n, 1n, "ROUND_DOWN")).toBe(-1n);
    expect(divideAndRound(1n, -3n, "ROUND_DOWN")).toBe(-1n);
    expect(divideAndRound(-20n, 2n, "ROUND_DOWN")).toBe(-10n);
    expect(divideAndRound(20n, -3n, "ROUND_DOWN")).toBe(-7n);
    expect(divideAndRound(-20n, 6n, "ROUND_DOWN")).toBe(-4n);
    expect(divideAndRound(20n, -7n, "ROUND_DOWN")).toBe(-3n);
    expect(divideAndRound(-15n, 2n, "ROUND_DOWN")).toBe(-8n);
  });
});

describe("compare()", () => {
  it("works", () => {
    expect(compare(
      [16000000000000n, 18], // 0.000016
      [1300000000000000n, 18], // 0.0013
    )).toBe(-1);
    expect(compare(1n, -1n)).toBe(1);
    expect(compare(-1n, 1n)).toBe(-1);
    expect(compare(1n, 1n)).toBe(0);
    expect(
      [
        1,
        8n,
        [70000n, 4] as const,
        3.1,
        2n,
        5,
      ].sort(compare),
    ).toEqual([
      1,
      2n,
      3.1,
      5,
      [70000n, 4],
      8n,
    ]);
  });
});

describe("round()", () => {
  it("rounds decimals", () => {
    expect(round([1000n, 2])).toEqual([1000n, 2]);
    expect(round([123456n, 2])).toEqual([123500n, 2]);
    expect(round([123449n, 2])).toEqual([123400n, 2]);
    expect(round([123450n, 2])).toEqual([123500n, 2]);
    expect(
      round([1234555555555555555555n, 18]),
    ).toEqual([1235000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18]),
    ).toEqual([1234000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18], 2),
    ).toEqual([123400n, 2]);
  });

  it("rounds decimals up", () => {
    expect(round([1000n, 2], { rounding: "ROUND_UP" })).toEqual([1000n, 2]);
    expect(round([123456n, 2], { rounding: "ROUND_UP" })).toEqual([123500n, 2]);
    expect(round([123449n, 2], { rounding: "ROUND_UP" })).toEqual([123500n, 2]);
    expect(round([123450n, 2], { rounding: "ROUND_UP" })).toEqual([123500n, 2]);
    expect(
      round([1234555555555555555555n, 18], { rounding: "ROUND_UP" }),
    ).toEqual([1235000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18], { rounding: "ROUND_UP" }),
    ).toEqual([1235000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18], { decimals: 2, rounding: "ROUND_UP" }),
    ).toEqual([123500n, 2]);
  });

  it("rounds decimals down", () => {
    expect(round([1000n, 2], { rounding: "ROUND_DOWN" })).toEqual([1000n, 2]);
    expect(round([123456n, 2], { rounding: "ROUND_DOWN" })).toEqual([123400n, 2]);
    expect(round([123449n, 2], { rounding: "ROUND_DOWN" })).toEqual([123400n, 2]);
    expect(round([123450n, 2], { rounding: "ROUND_DOWN" })).toEqual([123400n, 2]);
    expect(
      round([1234555555555555555555n, 18], { rounding: "ROUND_DOWN" }),
    ).toEqual([1234000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18], { rounding: "ROUND_DOWN" }),
    ).toEqual([1234000000000000000000n, 18]);
    expect(
      round([1234499999999999999999n, 18], { decimals: 2, rounding: "ROUND_DOWN" }),
    ).toEqual([123400n, 2]);
  });
});

describe("floor()", () => {
  it("works", () => {
    expect(floor([1000n, 2])).toEqual([1000n, 2]);
    expect(floor([109n, 1])).toEqual([100n, 1]);
    expect(floor([-109n, 1])).toEqual([-110n, 1]);
    expect(floor([-101n, 1])).toEqual([-110n, 1]);
    expect(floor([123456n, 2])).toEqual([123400n, 2]);
    expect(floor([123449n, 2])).toEqual([123400n, 2]);
    expect(floor([123450n, 2])).toEqual([123400n, 2]);
    expect(
      floor([1234555555555555555555n, 18]),
    ).toEqual([1234000000000000000000n, 18]);
    expect(
      floor([-1234000000000000000000n, 18]),
    ).toEqual([-1234000000000000000000n, 18]);
    expect(
      floor([-1234000000000000000001n, 18]),
    ).toEqual([-1235000000000000000000n, 18]);
    expect(
      floor([1234999999999999999999n, 18]),
    ).toEqual([1234000000000000000000n, 18]);
  });
});

describe("ceil()", () => {
  it("works", () => {
    expect(ceil([1000n, 2])).toEqual([1000n, 2]);
    expect(
      ceil([1234000000000000000000n, 18]),
    ).toEqual([1234000000000000000000n, 18]);
    expect(
      ceil([1234000000000000000001n, 18]),
    ).toEqual([1235000000000000000000n, 18]);
    expect(
      ceil([-1234000000000000000001n, 18]),
    ).toEqual([-1234000000000000000000n, 18]);
    expect(
      ceil([1234999999999999999999n, 18]),
    ).toEqual([1235000000000000000000n, 18]);
  });
});

describe("format()", () => {
  it("works", () => {
    expect(format([123456n, 2], 2)).toBe("1,234.56");
    expect(format([123456n, 2], 1)).toBe("1,234.6");
    expect(format([123456n, 0], 0)).toBe("123,456");
    expect(format([123400n, 2], 2)).toBe("1,234");
    expect(format([-123400n, 2], 2)).toBe("-1,234");
    expect(format([-12342938798723n, 10], 6)).toBe("-1,234.29388");
    expect(format([-12342938798723n, 10], { digits: 6, trailingZeros: true }))
      .toBe("-1,234.293880");
    expect(format([-12342938798723n, 10], { compact: true })).toBe("-1.2K");
  });
  it("works with greater digits than decimals", () => {
    expect(format([123400n, 2], 3)).toBe("1,234");
  });
  it("works with negative numbers when the whole value is zero", () => {
    expect(format([-123456n, 6], 2)).toBe("-0.12");
  });
  it("works with negative numbers and smaller digits than decimals", () => {
    expect(format([-123400n, 4], 2)).toBe("-12.34");
  });
  it("works with very large numbers", () => {
    expect(format(
      [-123400932870192873098321798321798731298713298n, 4],
      2,
    )).toBe(
      "-12,340,093,287,019,287,309,832,179,832,179,873,129,871.33",
    );
    expect(format(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 8, trailingZeros: true },
    )).toBe(
      "-12,340,093,287,019,287,309,832,179,832,179,873,129,871.32980000",
    );
    expect(format(
      from("5", 2),
      { digits: 2, trailingZeros: true },
    )).toBe(
      "5.00",
    );
    expect(format(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 8, trailingZeros: false },
    )).toBe(
      "-12,340,093,287,019,287,309,832,179,832,179,873,129,871.3298",
    );
    expect(format(
      divide(from(1, 18), from(100_000, 18)),
      { digits: 8, trailingZeros: false },
    )).toBe(
      "0.00001",
    );

    expect(format([123456n, 2], { locale: "en-US" })).toBe("1,234.56");
    expect(format([123456n, 2], { locale: "fr-FR" })).toBe("1\u202f234,56");
    expect(format([123456n, 2], { locale: "es-ES" })).toBe("1234,56");
    expect(format([123456n, 2], { locale: "de-DE" })).toBe("1.234,56");

    const formatToParts = Intl.NumberFormat.prototype.formatToParts;
    Intl.NumberFormat.prototype.formatToParts = () => [];
    expect(format([123456n, 2], { locale: "fr-FR" })).toBe("1\u202f234.56");
    Intl.NumberFormat.prototype.formatToParts = formatToParts;
  });
  it("rounds correctly", () => {
    // using 4,569.88
    const n = [456988n, 2] as const;

    expect(format(n, 0)).toBe("4,570");
    expect(format(n, 1)).toBe("4,569.9");
    expect(
      format(n, {
        digits: 1,
        decimalsRounding: "ROUND_DOWN",
      })
    ).toBe("4,569.8");

    expect(format(n, 2)).toBe("4,569.88");
    expect(format(n, {
      digits: 2,
      decimalsRounding: "ROUND_UP",
    })).toBe("4,569.88");
  });
  it("handles options.signDisplay", () => {
    expect(format([123n, 4], { signDisplay: "auto" })).toBe("0.0123");
    expect(format([123n, 4], { signDisplay: "always" })).toBe("+0.0123");
    expect(format([123n, 4], { signDisplay: "exceptZero" })).toBe("+0.0123");
    expect(format([123n, 4], { signDisplay: "negative" })).toBe("0.0123");
    expect(format([123n, 4], { signDisplay: "never" })).toBe("0.0123");

    expect(format([-123n, 4], { signDisplay: "auto" })).toBe("-0.0123");
    expect(format([-123n, 4], { signDisplay: "always" })).toBe("-0.0123");
    expect(format([-123n, 4], { signDisplay: "exceptZero" })).toBe("-0.0123");
    expect(format([-123n, 4], { signDisplay: "negative" })).toBe("-0.0123");
    expect(format([-123n, 4], { signDisplay: "never" })).toBe("0.0123");

    expect(format([0n, 4], { signDisplay: "auto" })).toBe("0");
    expect(format([0n, 4], { signDisplay: "always" })).toBe("+0");
    expect(format([0n, 4], { signDisplay: "exceptZero" })).toBe("0");
    expect(format([0n, 4], { signDisplay: "negative" })).toBe("0");
    expect(format([0n, 4], { signDisplay: "never" })).toBe("0");

    expect(
      format([123n, 4], { signDisplay: "exceptZero", digits: 0 }),
    ).toBe("0");
    expect(
      format([123n, 4], { signDisplay: "exceptZero", digits: 2 }),
    ).toBe("+0.01");
    expect(
      format([-123n, 4], { signDisplay: "exceptZero", digits: 0 }),
    ).toBe("0");
    expect(
      format([-123n, 4], { signDisplay: "exceptZero", digits: 2 }),
    ).toBe("-0.01");
  });
});

describe("formatSign()", () => {
  it("works", () => {
    expect(formatSign([0n, 2], true, "auto")).toBe("");
    expect(formatSign([0n, 2], true, "always")).toBe("+");
    expect(formatSign([0n, 2], true, "exceptZero")).toBe("");
    expect(formatSign([0n, 2], true, "negative")).toBe("");
    expect(formatSign([0n, 2], true, "never")).toBe("");

    expect(formatSign([1n, 2], false, "auto")).toBe("");
    expect(formatSign([1n, 2], false, "always")).toBe("+");
    expect(formatSign([1n, 2], false, "exceptZero")).toBe("+");
    expect(formatSign([1n, 2], false, "negative")).toBe("");
    expect(formatSign([1n, 2], false, "never")).toBe("");

    expect(formatSign([-1n, 2], false, "auto")).toBe("-");
    expect(formatSign([-1n, 2], false, "always")).toBe("-");
    expect(formatSign([-1n, 2], false, "exceptZero")).toBe("-");
    expect(formatSign([-1n, 2], false, "negative")).toBe("-");
    expect(formatSign([-1n, 2], false, "never")).toBe("");
  });
});

describe("toParts()", () => {
  it("works", () => {
    expect(toParts([123456n, 2], 2)).toEqual([1234n, "56"]);
    expect(toParts([123456n, 2], 1)).toEqual([1234n, "6"]);
    expect(toParts([123456n, 0], 0)).toEqual([123456n, null]);
    expect(toParts([123400n, 2], 2)).toEqual([1234n, null]);
    expect(toParts([-123400n, 2], 2)).toEqual([1234n, null]);
  });
  it("works with greater digits than decimals", () => {
    expect(toParts([123400n, 2], 3)).toEqual([1234n, null]);
  });
  it("works with negative values and smaller digits than decimals", () => {
    expect(toParts([-123400n, 4], 2)).toEqual([12n, "34"]);
  });
  it("works with very large numbers", () => {
    expect(toParts(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 2, trailingZeros: true },
    )).toEqual(
      [12340093287019287309832179832179873129871n, "33"],
    );
    expect(toParts(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 8, trailingZeros: true },
    )).toEqual(
      [12340093287019287309832179832179873129871n, "32980000"],
    );
  });
  it("handles trailing zeros", () => {
    expect(toParts(
      divide(from(1, 18), from(100_000, 18)),
      { digits: 8, trailingZeros: false },
    )).toEqual(
      [0n, "00001"],
    );

    expect(toParts(
      from(5, 4),
      { digits: 4, trailingZeros: true },
    )).toEqual(
      [5n, "0000"],
    );

    expect(
      toParts([0n, 0], { digits: 2, trailingZeros: true }),
    ).toEqual(
      [0n, "00"],
    );

    expect(
      toParts([5n, 0], { digits: 2, trailingZeros: true }),
    ).toEqual(
      [5n, "00"],
    );

    expect(
      toParts([500n, 2], { digits: 8, trailingZeros: true }),
    ).toEqual(
      [5n, "00000000"],
    );
  });
  it("rounds decimals properly", () => {
    expect(toParts([49999999n, 9], 1)).toEqual([0n, null]);
    expect(toParts([50000000n, 9], 1)).toEqual([0n, "1"]);
    expect(toParts([49998805n, 9], 2)).toEqual([0n, "05"]);
    expect(toParts([90000000n, 9], 1)).toEqual([0n, "1"]);

    // 1234.56
    expect(toParts([123456n, 2], 1)).toEqual([1234n, "6"]);
    expect(toParts([123456n, 2], 2)).toEqual([1234n, "56"]);
    expect(toParts([123456n, 2], 3)).toEqual([1234n, "56"]);

    // 0.09
    expect(toParts([9n, 2], 1)).toEqual([0n, "1"]);
    expect(toParts([9n, 2], 2)).toEqual([0n, "09"]);

    // 1.09
    expect(toParts([109n, 2], 1)).toEqual([1n, "1"]);
    expect(toParts([109n, 2], 2)).toEqual([1n, "09"]);

    // 1.65
    expect(toParts([165n, 2], 0)).toEqual([2n, null]); // 2
    expect(toParts([165n, 2], 1)).toEqual([1n, "7"]); // 1.7
    expect(toParts([165n, 2], 2)).toEqual([1n, "65"]); // 1.65

    // 0.006
    expect(toParts([6n, 3], 1)).toEqual([0n, null]);
    expect(toParts([6n, 3], 2)).toEqual([0n, "01"]);
    expect(toParts([6n, 3], 3)).toEqual([0n, "006"]);

    // 0.049998805;
    expect(toParts([49998805n, 9], 0)).toEqual([0n, null]);
    expect(toParts([49998805n, 9], 1)).toEqual([0n, null]);
    expect(toParts([49998805n, 9], 2)).toEqual([0n, "05"]);
    expect(toParts([49998805n, 9], 3)).toEqual([0n, "05"]);
    expect(toParts([49998805n, 9], 4)).toEqual([0n, "05"]);
    expect(toParts([49998805n, 9], 5)).toEqual([0n, "05"]);
    expect(toParts([49998805n, 9], 6)).toEqual([0n, "049999"]);
    expect(toParts([49998805n, 9], 7)).toEqual([0n, "0499988"]);
    expect(toParts([49998805n, 9], 8)).toEqual([0n, "04999881"]);
    expect(toParts([49998805n, 9], 9)).toEqual([0n, "049998805"]);

    // negative numbers
    expect(toParts([-123456n, 4], 2)).toEqual([12n, "35"]);
    expect(toParts([-123456n, 6], 2)).toEqual([0n, "12"]);

    // decimals for 1-7 digits, rounding half (default)
    [null, "05", "05", "05", "05", "049999", "0499988"].forEach(
      (decimals, index) => {
        expect(
          toParts([49998805n, 9], { digits: index + 1 }),
        ).toEqual([0n, decimals]);
      },
    );

    // decimals for 1-7 digits, rounding up
    ["1", "05", "05", "05", "05", "049999", "0499989"].forEach(
      (decimals, index) => {
        expect(
          toParts([49998805n, 9], {
            digits: index + 1,
            decimalsRounding: "ROUND_UP",
          }),
        ).toEqual([0n, decimals]);
      },
    );

    // decimals for 1-7 digits, rounding down
    [null, "04", "049", "0499", "04999", "049998", "0499988"].forEach(
      (decimals, index) => {
        expect(
          toParts([49998805n, 9], {
            digits: index + 1,
            decimalsRounding: "ROUND_DOWN",
          }),
        ).toEqual([0n, decimals]);
      },
    );
  });
});

describe("toNumber()", () => {
  it("works", () => {
    expect(toNumber([123456n, 2], 2)).toBe(1234.56);
    expect(toNumber([123456n, 2], 1)).toBe(1234.6);
    expect(toNumber([123456n, 0], 0)).toBe(123456);
    expect(toNumber([123400n, 2], 2)).toBe(1234);
    expect(toNumber([-123400n, 2], 2)).toBe(-1234);
  });
  it("works with greater digits than decimals", () => {
    expect(toNumber([123400n, 2], 3)).toBe(1234);
  });
  it("works with negative values and smaller digits than decimals", () => {
    expect(toNumber([-123400n, 4], 2)).toBe(-12.34);
  });
  it("works with very large numbers", () => {
    expect(toNumber(
      [-123400932870192873098321798321798731298713298n, 4],
      2,
    )).toBe(
      -12340093287019287309832179832179873129871.33,
    );
  });
  it("works with a single parameter", () => {
    expect(toNumber([123456n, 2])).toBe(1234.56);
  });
});

describe("toString()", () => {
  it("works", () => {
    expect(toString([123456n, 2], 2)).toBe("1234.56");
    expect(toString([123456n, 2], 1)).toBe("1234.6");
    expect(toString([123456n, 0], 0)).toBe("123456");
    expect(toString([123400n, 2], 2)).toBe("1234");
    expect(toString([-123400n, 2], 2)).toBe("-1234");
  });
  it("works with greater digits than decimals", () => {
    expect(toString([123400n, 2], 3)).toBe("1234");
  });
  it("works with negative values and smaller digits than decimals", () => {
    expect(toString([-123400n, 4], 2)).toBe("-12.34");
  });
  it("works with very large numbers", () => {
    expect(toString(
      [-123400932870192873098321798321798731298713298n, 4],
      2,
    )).toBe(
      "-12340093287019287309832179832179873129871.33",
    );
  });
  it("works with a single parameter", () => {
    expect(toString([123456n, 2])).toBe("1234.56");
  });
});

describe("from()", () => {
  it("works with strings", () => {
    expect(from("12345.29387", 18)).toEqual([12345293870000000000000n, 18]);
    expect(from("12345.29387", 2)).toEqual([1234529n, 2]);
    expect(from("12345.29387", 0)).toEqual([12345n, 0]);
    expect(from("-12345.29387", 0)).toEqual([-12345n, 0]);
    expect(from(".29387", 18)).toEqual([293870000000000000n, 18]);
    expect(from("-.29387", 18)).toEqual([-293870000000000000n, 18]);
  });
  it("works with Dnums", () => {
    expect(from([12345n, 2], 2)).toEqual([12345n, 2]);
    expect(from([12345n, 2], 4)).toEqual([1234500n, 4]);
    expect(from([12345n, 2], true)).toEqual([12345n, 2]);
  });
  it("works with numbers", () => {
    expect(from(12345.29387, 18)).toEqual([12345293870000000000000n, 18]);
    expect(from(-12345.29387, 18)).toEqual([-12345293870000000000000n, 18]);
    expect(from(10 ** 20, 0)).toEqual([100000000000000000000n, 0]);
  });
  it("accepts numbers requiring scientific notation", () => {
    expect(from(10 ** 21, 0)).toEqual([10n ** 21n, 0]);
  });
  it("works with bigints", () => {
    expect(from(1234529387n, 18)).toEqual([1234529387000000000000000000n, 18]);
    expect(from(-1234529387n, 18)).toEqual([
      -1234529387000000000000000000n,
      18,
    ]);
  });
  it("throws with incorrect values", () => {
    expect(from(10 ** 21)).toEqual([10n ** 21n, 0]);
    expect(() => from("3298.987.32", 18))
      .toThrowErrorMatchingSnapshot(JSON.stringify(["3298.987.32", 18]));
  });
});

describe("toJSON()", () => {
  it("works", () => {
    expect(toJSON([123456789000000000000n, 18])).toEqual(
      "[\"123456789000000000000\",18]",
    );
  });
});

describe("fromJSON()", () => {
  it("works", () => {
    expect(fromJSON("[\"123456789000000000000\",18]")).toEqual([
      123456789000000000000n,
      18,
    ]);
  });
});

describe("abs()", () => {
  it("works", () => {
    expect(abs([123456789000000000000n, 18]))
      .toEqual([123456789000000000000n, 18]);
    expect(abs([-123456789000000000000n, 18]))
      .toEqual([123456789000000000000n, 18]);
    expect(abs(-1234, 2)).toEqual([123400n, 2]);
  });
});

describe("greaterThan()", () => {
  it("works", () => {
    expect(
      greaterThan([123456789000000000000n, 18], [123456789000000000001n, 18]),
    ).toBe(false);
    expect(
      greaterThan([123456789000000000001n, 18], [123456789000000000001n, 18]),
    ).toBe(false);
    expect(
      greaterThan([123456789000000000001n, 18], [123456789000000000000n, 18]),
    ).toBe(true);
    expect(
      greaterThan([123456789000000000000n, 18], 124),
    ).toBe(false);
    expect(
      greaterThan([123456789000000000000n, 18], 123),
    ).toBe(true);
  });
});

describe("lessThan()", () => {
  it("works", () => {
    expect(
      lessThan([123456789000000000000n, 18], [123456789000000000001n, 18]),
    ).toBe(true);
    expect(
      lessThan([123456789000000000001n, 18], [123456789000000000001n, 18]),
    ).toBe(false);
    expect(
      lessThan([123456789000000000001n, 18], [123456789000000000000n, 18]),
    ).toBe(false);
    expect(
      lessThan([123456789000000000000n, 18], 124),
    ).toBe(true);
    expect(
      lessThan([123456789000000000000n, 18], 123),
    ).toBe(false);
  });
});

describe("greaterThanOrEqual()", () => {
  it("works", () => {
    expect(greaterThanOrEqual(
      [123456789000000000000n, 18],
      [123456789000000000001n, 18],
    )).toBe(false);
    expect(greaterThanOrEqual(
      [123456789000000000001n, 18],
      [123456789000000000001n, 18],
    )).toBe(true);
    expect(greaterThanOrEqual(
      [123456789000000000001n, 18],
      [123456789000000000000n, 18],
    )).toBe(true);
  });
});

describe("lessThanOrEqual()", () => {
  it("works", () => {
    expect(lessThanOrEqual(
      [123456789000000000000n, 18],
      [123456789000000000001n, 18],
    )).toBe(true);
    expect(lessThanOrEqual(
      [123456789000000000001n, 18],
      [123456789000000000001n, 18],
    )).toBe(true);
    expect(lessThanOrEqual(
      [123456789000000000001n, 18],
      [123456789000000000000n, 18],
    )).toBe(false);
  });
});

describe("equal()", () => {
  it("works", () => {
    expect(
      equal([123456789000000000001n, 18], [123456789000000000001n, 18]),
    ).toBe(true);
    expect(
      equal([123456789000000000001n, 18], [123456789000000000000n, 18]),
    ).toBe(false);
    expect(
      equal([123456789000000000000n, 18], 123),
    ).toBe(false);
    expect(
      equal([123000000000000000000n, 18], 123),
    ).toBe(true);
  });
});

describe("equalizeDecimals()", () => {
  it("works", () => {
    expect(
      equalizeDecimals([[123456789000000000001n, 18], [1n, 0]]),
    ).toEqual(
      [[123456789000000000001n, 18], [1000000000000000000n, 18]],
    );
    expect(
      equalizeDecimals([[123456789000000000001n, 18], [1n, 0]], 2),
    ).toEqual(
      [[12346n, 2], [100n, 2]],
    );
    expect(equalizeDecimals([])).toEqual([]);
  });
});
