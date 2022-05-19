import type { Dnum, Decimals, Value } from "./types";

import { divideAndRound, splitNumber } from "./utils";

// Matches:
//  - whole numbers (123)
//  - decimal numbers (1.23, .23)
//  - negative numbers (-123, -1.23, -.23)
const NUM_RE = /^-?(?:[0-9]+|(?:[0-9]*(?:\.[0-9]+)))$/;

// Based on ethers parseFixed():
// https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/bignumber/src.ts/fixednumber.ts#L70
export function from(
  number: string | number | bigint,
  decimals: number,
): Dnum {
  number = String(number);

  if (!number.match(NUM_RE)) {
    throw new Error(`Incorrect number: ${number}`);
  }

  const negative = number.startsWith("-");
  if (negative) {
    number = number.slice(1);
  }

  let [whole, fraction] = splitNumber(number);

  // truncate according to decimals
  fraction = fraction.slice(0, decimals);

  // pad fraction with trailing zeros
  fraction = fraction + "0".repeat(decimals - fraction.length);

  const value = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction);

  return [value * (negative ? -1n : 1n), decimals];
}

export function setValueDecimals(
  value: Value,
  decimalsDiff: Decimals,
): Value {
  if (decimalsDiff > 0) {
    return (value * 10n ** BigInt(decimalsDiff));
  }
  if (decimalsDiff < 0) {
    return divideAndRound(value, 10n ** BigInt(-decimalsDiff));
  }
  return value;
}

export function setDecimals(
  value: Dnum,
  decimals: Decimals,
): Dnum {
  if (value[1] < 0 || decimals < 0) {
    throw new Error("Decimals cannot be negative");
  }

  const decimalsDiff = decimals - value[1];
  return [
    setValueDecimals(value[0], decimalsDiff),
    decimals,
  ];
}
