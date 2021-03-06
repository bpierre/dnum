import { describe, expect, it } from "vitest";
import {
  add,
  divide,
  format,
  formatNumber,
  from,
  fromJSON,
  isDnum,
  multiply,
  setDecimals,
  subtract,
  toJSON,
} from "../src";
import { setValueDecimals } from "../src/dnum";
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
  });
  it("leaves decimals unchanged", () => {
    expect(setValueDecimals(123456n, 0)).toBe(123456n);
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
  it("throws if decimals are negative", () => {
    expect(() => setDecimals([123456n, -4], 4)).toThrowError("negative");
    expect(() => setDecimals([123456n, 4], -4)).toThrowError("negative");
  });
});

describe("add()", () => {
  it("adds positive values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [124691n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
    expect(add(a2, a1, result[1])).toEqual(result);
  });
  it("adds negative values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [122221n, 2] as const;
    expect(add(a1, a2, result[1])).toEqual(result);
    expect(add(a2, a1, result[1])).toEqual(result);
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
  it("multiplies positive values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [1524138n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
    expect(multiply(a2, a1, result[1])).toEqual(result);
  });
  it("multiplies negative values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [-123456n, 4] as const;
    const result = [-1524138n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
    expect(multiply(a2, a1, result[1])).toEqual(result);
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
  it("divides positive values", () => {
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

describe("divideAndRound()", () => {
  it("works", () => {
    expect(divideAndRound(1n, 1n)).toBe(1n);
    expect(divideAndRound(1n, 3n)).toBe(0n);
    expect(divideAndRound(20n, 2n)).toBe(10n);
    expect(divideAndRound(15n, 2n)).toBe(8n);
  });
});

describe("format()", () => {
  it("works", () => {
    expect(format([123456n, 2], 2)).toBe("1,234.56");
    expect(format([123456n, 2], 1)).toBe("1,234.6");
    expect(format([123456n, 0], 0)).toBe("123,456");
    expect(format([123400n, 2], 2)).toBe("1,234");
    expect(format([-123400n, 2], 2)).toBe("-1,234");
  });
});

describe("formatNumber()", () => {
  it("works with numbers", () => {
    expect(formatNumber(123456n, 2)).toBe("123,456");
  });
  it("works with bigints", () => {
    expect(formatNumber(123456.789, 2)).toBe("123,456.79");
  });
  it("works with strings", () => {
    expect(formatNumber("123456.789999", 2)).toBe("123,456.79");
  });
  it("formats in a compact way", () => {
    expect(formatNumber(123_456_789.888, 2, { compact: true })).toBe("123.46M");
  });
  it("keeps the trailing zeros", () => {
    expect(formatNumber(123_456_789, 2, { trailingZeros: true })).toBe(
      "123,456,789.00",
    );
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
  });
  it("works with bigints", () => {
    expect(from(1234529387n, 18)).toEqual([1234529387000000000000000000n, 18]);
    expect(from(-1234529387n, 18)).toEqual([
      -1234529387000000000000000000n,
      18,
    ]);
  });
  it("throws with incorrect values", () => {
    expect(() => from("3298.987.32", 18)).toThrowError("Incorrect");
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
