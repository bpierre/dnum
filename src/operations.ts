import type {
  AliasedOptions,
  Decimals,
  Dnum,
  Numberish,
  Rounding,
} from "./types";

import { from, isDnum, setDecimals, setValueDecimals } from "./dnum";
import { divideAndRound, powerOfTen } from "./utils";

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
  optionsOrDecimals: AliasedOptions<{
    decimals?: Decimals;
    rounding?: Rounding;
  }, "decimals"> = {},
): Dnum {
  const options = typeof optionsOrDecimals === "number"
    ? { decimals: optionsOrDecimals }
    : optionsOrDecimals;
  options.rounding ??= "ROUND_HALF";

  const [left, right] = normalizePair(num1, num2);
  const decimals = options.decimals
    ?? (isDnum(num1) ? left[1] : Math.max(left[1], right[1]));
  if (
    Number.isInteger(left[1]) && Number.isInteger(right[1])
    && Number.isInteger(decimals)
  ) {
    // Multiplication needs one final rescale, not equalized input coefficients.
    const productDecimals = left[1] + right[1];
    return setDecimals(
      [left[0] * right[0], productDecimals === 0 ? left[1] : productDecimals],
      decimals,
      { rounding: options.rounding },
    );
  }

  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, options.decimals);
  return setDecimals(
    [num1_[0] * num2_[0], num1_[1] * 2],
    options.decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
    { rounding: options.rounding },
  );
}

export function divide(
  num1: Numberish,
  num2: Numberish,
  optionsOrDecimals: AliasedOptions<{
    decimals?: Decimals;
    rounding?: Rounding;
  }, "decimals"> = {},
): Dnum {
  const options = typeof optionsOrDecimals === "number"
    ? { decimals: optionsOrDecimals }
    : optionsOrDecimals;
  options.rounding ??= "ROUND_HALF";

  const [left, right] = normalizePair(num1, num2);
  const decimals = options.decimals
    ?? (isDnum(num1) ? left[1] : Math.max(left[1], right[1]));
  if (
    Number.isInteger(left[1]) && Number.isInteger(right[1])
    && Number.isInteger(decimals)
  ) {
    if (right[0] === 0n) throw new Error("dnum: division by zero");
    const common = Math.max(left[1], right[1], decimals);
    // Cancel the denominator's normalization factor before dividing. Keep both
    // rounding steps: changing to a single division would change some results.
    const dividend = left[0] * powerOfTen(common + right[1] - left[1]);
    return setDecimals(
      [
        divideAndRound(dividend, right[0], options.rounding),
        left[1] === common ? left[1] : common,
      ],
      decimals,
      { rounding: options.rounding },
    );
  }

  const [num1_, num2_] = normalizePairAndDecimals(num1, num2, options.decimals);
  if (num2_[0] === 0n) {
    throw new Error("dnum: division by zero");
  }
  const value1 = setValueDecimals(
    num1_[0],
    Math.max(num1_[1], options.decimals ?? 0),
  );
  const value2 = setValueDecimals(num2_[0], 0);
  return setDecimals(
    [divideAndRound(value1, value2, options.rounding), num1_[1]],
    options.decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
    { rounding: options.rounding },
  );
}

export function remainder(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return setDecimals(
    [num1_[0] % num2_[0], num1_[1]],
    decimals ?? (isDnum(num1) ? num1[1] : num1_[1]),
  );
}

export function compare(num1: Numberish, num2: Numberish): 1 | -1 | 0 {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] > num2_[0] ? 1 : num1_[0] < num2_[0] ? -1 : 0;
}

export function equal(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] === num2_[0];
}

export function greaterThan(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] > num2_[0];
}

export function greaterThanOrEqual(num1: Numberish, num2: Numberish): boolean {
  return !lessThan(num1, num2);
}

export function lessThan(num1: Numberish, num2: Numberish): boolean {
  const [num1_, num2_] = normalizePairAndDecimals(num1, num2);
  return num1_[0] < num2_[0];
}

export function lessThanOrEqual(num1: Numberish, num2: Numberish): boolean {
  return !greaterThan(num1, num2);
}

export function abs(num: Numberish, decimals?: Decimals): Dnum {
  const [valueIn, decimalsIn] = from(num);
  if (decimals === undefined) decimals = decimalsIn;

  let valueAbs = valueIn;
  if (valueAbs < 0n) {
    valueAbs = -valueAbs;
  }

  return setDecimals([valueAbs, decimalsIn], decimals);
}

export function floor(num: Numberish, decimals?: Decimals): Dnum {
  return round(num, { decimals, rounding: "ROUND_DOWN" });
}

export function ceil(num: Numberish, decimals?: Decimals): Dnum {
  return round(num, { decimals, rounding: "ROUND_UP" });
}

export function round(
  num: Numberish,
  optionsOrDecimals: AliasedOptions<{
    decimals?: Decimals;
    rounding?: Rounding;
  }, "decimals"> = {},
): Dnum {
  const options = typeof optionsOrDecimals === "number"
    ? { decimals: optionsOrDecimals }
    : optionsOrDecimals;
  options.rounding ??= "ROUND_HALF";

  const numIn = from(num);
  return setDecimals(
    setDecimals(numIn, 0, { rounding: options.rounding }), // setDecimals() uses divideAndRound() internally
    options.decimals === undefined ? numIn[1] : options.decimals,
  );
}

// Converts a pair of Numberish into Dnum and equalize
// their decimals based on the highest precision found.
function normalizePairAndDecimals(
  num1: Numberish,
  num2: Numberish,
  decimals?: number,
) {
  const num1_ = isDnum(num1) ? num1 : from(num1);
  const num2_ = isDnum(num2) ? num2 : from(num2);
  if (num1_[1] < 0 || num2_[1] < 0) {
    throw new Error("dnum: decimals cannot be negative");
  }
  if (num1_[1] === num2_[1] && num1_[1] >= (decimals ?? 0)) {
    return [num1_, num2_] as const;
  }
  const precision = Math.max(num1_[1], num2_[1], decimals ?? 0);
  return [
    setDecimals(num1_, precision),
    setDecimals(num2_, precision),
  ] as const;
}

function normalizePair(num1: Numberish, num2: Numberish) {
  const num1_ = isDnum(num1) ? num1 : from(num1);
  const num2_ = isDnum(num2) ? num2 : from(num2);

  if (num1_[1] < 0 || num2_[1] < 0) {
    throw new Error("dnum: decimals cannot be negative");
  }

  return [num1_, num2_] as const;
}
