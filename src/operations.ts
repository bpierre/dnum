import type { Decimals, Dnum, Numberish } from "./types";

import {
  equalizeDecimals,
  from,
  isDnum,
  setDecimals,
  setValueDecimals,
} from "./dnum";
import { divideAndRound } from "./utils";

export function add(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, decimals);
  return setDecimals(
    [num1_[0] + num2_[0], num1_[1]],
    decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
  );
}

export function subtract(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, decimals);
  return setDecimals(
    [num1_[0] - num2_[0], num1_[1]],
    decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
  );
}

export function multiply(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, decimals);
  return setDecimals(
    [num1_[0] * num2_[0], num1_[1] * 2],
    decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
  );
}

export function divide(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, decimals);
  if (num2_[0] === BigInt(0)) {
    throw new Error("Dnum: division by zero");
  }
  const value1 = setValueDecimals(num1_[0], Math.max(num1_[1], decimals ?? 0));
  const value2 = setValueDecimals(num2_[0], 0);
  return setDecimals(
    [divideAndRound(value1, value2), num1_[1]],
    decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
  );
}

export function equal(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] === num2_[0];
}

export function greaterThan(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] > num2_[0];
}

export function lessThan(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] < num2_[0];
}

export function abs(num: Numberish, decimals?: Decimals): Dnum {
  const [valueIn, decimalsIn] = from(num, true);
  if (decimals === undefined) { decimals = decimalsIn; }

  let valueAbs = valueIn;
  if (valueAbs < BigInt(0)) {
    valueAbs = -valueAbs;
  }

  return setDecimals([valueAbs, decimalsIn], decimals);
}

// Converts a pair of Numberish into Dnum and equalize
// their decimals based on the highest precision found.
function normalizePairAndDecimals(
  num1: Numberish,
  num2: Numberish,
  decimals?: number,
) {
  const num1_ = from(num1, true);
  const num2_ = from(num2, true);

  if (num1_[1] < 0 || num2_[1] < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }

  return equalizeDecimals(
    [num1_, num2_],
    Math.max(num1_[1], num2_[1], decimals ?? 0),
  );
}
