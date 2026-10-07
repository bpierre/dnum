import { describe, expect, it } from "bun:test";
import { divide, multiply } from "../src";

describe("arithmetic precision", () => {
  it("rounds products after multiplication rather than rounding the inputs", () => {
    expect(multiply([149n, 2], [149n, 2], 0)).toEqual([2n, 0]);
    expect(multiply([-149n, 2], [149n, 2], 0)).toEqual([-2n, 0]);
  });

  it("keeps division's two-stage rounding when reducing output precision", () => {
    const divisor = [2000n, 3] as const;
    for (
      const [rounding, positive, negative] of [
        ["ROUND_HALF", 2n, -2n],
        ["ROUND_UP", 2n, -1n],
        ["ROUND_DOWN", 1n, -2n],
      ] as const
    ) {
      expect(divide([2999n, 3], divisor, { decimals: 0, rounding })).toEqual([
        positive,
        0,
      ]);
      expect(divide([-2999n, 3], divisor, { decimals: 0, rounding })).toEqual([
        negative,
        0,
      ]);
    }
  });

  it("retains the left tuple's signed zero precision", () => {
    expect(Object.is(multiply([123n, -0], [7n, 0], 0)[1], -0)).toBe(true);
    expect(Object.is(divide([123n, -0], [7n, 0], 0)[1], -0)).toBe(true);
  });
});
