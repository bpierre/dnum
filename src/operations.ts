import type { Decimals, Dnum, Numberish } from "./types";

import { from, setDecimals, setValueDecimals } from "./dnum";
import { divideAndRound } from "./utils";

export function add(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [value1, decimals1] = from(num1, true);
  const [value2, decimals2] = from(num2, true);

  if (decimals === undefined) { decimals = decimals1; }

  // decimals1 and decimals2 being positive is already checked by from()
  if (decimals < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }

  const maxDecimals = Math.max(decimals1, decimals2);
  const value1Scaled = setValueDecimals(value1, maxDecimals - decimals1);
  const value2Scaled = setValueDecimals(value2, maxDecimals - decimals2);

  return setDecimals(
    [value1Scaled + value2Scaled, maxDecimals],
    decimals,
  );
}

export function subtract(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [value1, decimals1] = from(num1, true);
  const [value2, decimals2] = from(num2, true);

  if (decimals === undefined) { decimals = decimals1; }

  // decimals1 and decimals2 being positive is already checked by from()
  if (decimals < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }

  const maxDecimals = Math.max(decimals1, decimals2);
  const value1Scaled = setValueDecimals(value1, maxDecimals - decimals1);
  const value2Scaled = setValueDecimals(value2, maxDecimals - decimals2);

  return setDecimals(
    [value1Scaled - value2Scaled, maxDecimals],
    decimals,
  );
}

export function multiply(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [value1, decimals1] = from(num1, true);
  const [value2, decimals2] = from(num2, true);

  if (decimals === undefined) { decimals = decimals1; }

  // decimals1 and decimals2 being positive is already checked by from()
  if (decimals < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }

  const maxDecimals = Math.max(decimals1, decimals2);
  const value1Scaled = setValueDecimals(value1, maxDecimals - decimals1);
  const value2Scaled = setValueDecimals(value2, maxDecimals - decimals2);

  return setDecimals(
    [value1Scaled * value2Scaled, maxDecimals * 2],
    decimals,
  );
}

export function divide(
  num1: Numberish,
  num2: Numberish,
  decimals?: Decimals,
): Dnum {
  const [value1, decimals1] = from(num1, true);
  const [value2, decimals2] = from(num2, true);

  if (decimals === undefined) { decimals = decimals1; }

  // decimals1 and decimals2 being positive is already checked by from()
  if (decimals < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }
  if (value2 === BigInt(0)) {
    throw new Error("Division by zero");
  }

  const maxDecimals = Math.max(decimals1, decimals2);
  const value1Scaled = setValueDecimals(
    value1,
    maxDecimals - decimals1 + decimals,
  );
  const value2Scaled = setValueDecimals(value2, maxDecimals - decimals2);
  return [
    divideAndRound(value1Scaled, value2Scaled),
    decimals,
  ];
}
