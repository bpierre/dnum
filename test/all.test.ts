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
  isDnum,
  lessThan,
  multiply,
  remainder,
  round,
  setDecimals,
  subtract,
  toJSON,
  toNumber,
  toParts,
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
  it("doesn’t round decimals when specified", () => {
    expect(setValueDecimals(123456n, -2, { round: false })).toBe(1234n);
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
  it("removes the decimals", () => {
    expect(setDecimals([123456n, 4], 0)).toEqual([12n, 0]);
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
  it("multiplies positive values", () => {
    const a1 = [123456n, 2] as const;
    const a2 = [123456n, 4] as const;
    const result = [1524138n, 2] as const;
    expect(multiply(a1, a2, result[1])).toEqual(result);
    expect(multiply(a2, a1, result[1])).toEqual(result);
    expect(multiply(16.34, 14.4454)).toEqual([2360378n, 4]);
    expect(multiply(16.34, 14.4454, 3)).toEqual([236038n, 3]);
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
    expect(divide(8, 2, 8)).toEqual([400000000n, 8]);
    expect(divide(16.342, 14.43)).toEqual([1133n, 3]);
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
  it("works", () => {
    expect(divideAndRound(1n, 1n)).toBe(1n);
    expect(divideAndRound(1n, 3n)).toBe(0n);
    expect(divideAndRound(20n, 2n)).toBe(10n);
    expect(divideAndRound(20n, 3n)).toBe(7n);
    expect(divideAndRound(20n, 6n)).toBe(3n);
    expect(divideAndRound(20n, 7n)).toBe(3n);
    expect(divideAndRound(15n, 2n)).toBe(8n);
  });
});

describe("compare()", () => {
  it("works", () => {
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
  it("works", () => {
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
  it("works with negative values and smaller digits than decimals", () => {
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
});

describe("toParts()", () => {
  it("works", () => {
    expect(toParts([123456n, 2], 2)).toEqual([1234n, "56"]);
    expect(toParts([123456n, 2], 1)).toEqual([1234n, "6"]);
    expect(toParts([123456n, 0], 0)).toEqual([123456n, null]);
    expect(toParts([123400n, 2], 2)).toEqual([1234n, null]);
    expect(toParts([-123400n, 2], 2)).toEqual([-1234n, null]);
  });
  it("works with greater digits than decimals", () => {
    expect(toParts([123400n, 2], 3)).toEqual([1234n, null]);
  });
  it("works with negative values and smaller digits than decimals", () => {
    expect(toParts([-123400n, 4], 2)).toEqual([-12n, "34"]);
  });
  it("works with very large numbers", () => {
    expect(toParts(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 2, trailingZeros: true },
    )).toEqual(
      [-12340093287019287309832179832179873129871n, "33"],
    );
    expect(toParts(
      [-123400932870192873098321798321798731298713298n, 4],
      { digits: 8, trailingZeros: true },
    )).toEqual(
      [-12340093287019287309832179832179873129871n, "32980000"],
    );
  });
  it("handles trailing zeros", () => {
    expect(toParts(
      divide(from(1, 18), from(100_000, 18)),
      { digits: 8, trailingZeros: false },
    )).toEqual(
      [0n, "00001"],
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

describe("abs()", () => {
  it("works", () => {
    expect(abs([123456789000000000000n, 18]))
      .toEqual([123456789000000000000n, 18]);
    expect(abs([-123456789000000000000n, 18]))
      .toEqual([123456789000000000000n, 18]);
    expect(abs(-1234, 2)).toEqual([123400n, 2]);
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
