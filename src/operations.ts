import type { Dnum, Decimals } from "./types";

import { from, setDecimals, setValueDecimals } from "./dnum";
import { divideAndRound, splitNumber } from "./utils";

export function multiply(
  [value1, decimals1]: Dnum,
  num2: Dnum | number | bigint,
  decimals: Decimals,
): Dnum {
  if (typeof num2 === "number" || typeof num2 === "bigint") {
    num2 = from(num2, splitNumber(String(num2))[1].length);
  }

  const [value2, decimals2] = num2;
  if (decimals1 < 0 || decimals2 < 0 || decimals < 0) {
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
  [value1, decimals1]: Dnum,
  num2: Dnum | number | bigint,
  decimals: Decimals,
): Dnum {
  if (typeof num2 === "number" || typeof num2 === "bigint") {
    num2 = from(num2, splitNumber(String(num2))[1].length);
  }

  const [value2, decimals2] = num2;
  if (decimals1 < 0 || decimals2 < 0 || decimals < 0) {
    throw new Error("Dnum: decimals cannot be negative");
  }
  if (value2 === 0n) {
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
