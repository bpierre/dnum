import type { Decimals, Dnum, Numberish, Value } from "./types";

import { divideAndRound, powerOfTen, splitNumber } from "./utils";

export function isDnum(value: unknown): value is Dnum {
  return (
    Array.isArray(value)
    && typeof value[0] === "bigint"
    && typeof value[1] === "number"
  );
}

// Matches:
//  - whole numbers (123)
//  - decimal numbers (1.23, .23)
//  - negative numbers (-123, -1.23, -.23)
const NUM_RE = /^-?(?:[0-9]+|(?:[0-9]*(?:\.[0-9]+)))$/;

// Based on ethers parseFixed():
// https://github.com/ethers-io/ethers.js/blob/8b62aeff9cce44cbd16ff41f8fc01ebb101f8265/packages/bignumber/src.ts/fixednumber.ts#L70
export function from(
  value: Numberish,
  decimals: number | true,
): Dnum {
  if (isDnum(value)) {
    return setDecimals(value, decimals === true ? value[1] : decimals);
  }

  value = String(value);

  if (!value.match(NUM_RE)) {
    throw new Error(`Incorrect number: ${value}`);
  }

  const negative = value.startsWith("-");
  if (negative) {
    value = value.slice(1);
  }

  let [whole, fraction] = splitNumber(value);

  if (decimals === true) {
    decimals = fraction.length;
  }

  // truncate according to decimals
  fraction = fraction.slice(0, decimals);

  // pad fraction with trailing zeros
  fraction = fraction + "0".repeat(decimals - fraction.length);

  const result = (
    BigInt(whole) * powerOfTen(decimals) + BigInt(fraction)
  ) * BigInt(negative ? -1 : 1);

  return [result, decimals];
}

export function setValueDecimals(
  value: Value,
  decimalsDiff: Decimals,
): Value {
  if (decimalsDiff > 0) {
    return (value * powerOfTen(decimalsDiff));
  }
  if (decimalsDiff < 0) {
    return divideAndRound(value, powerOfTen(-decimalsDiff));
  }
  return value;
}

export function setDecimals(
  value: Dnum,
  decimals: Decimals,
): Dnum {
  if (value[1] === decimals) {
    return value;
  }

  if (value[1] < 0 || decimals < 0) {
    throw new Error("Decimals cannot be negative");
  }

  const decimalsDiff = decimals - value[1];
  return [
    setValueDecimals(value[0], decimalsDiff),
    decimals,
  ];
}

export function toJSON([value, decimals]: Dnum) {
  return JSON.stringify([String(value), decimals]);
}

export function fromJSON(jsonValue: string): Dnum {
  const [value, decimals] = JSON.parse(jsonValue);
  return [BigInt(value), decimals];
}

export function toParts(
  dnum: Dnum,
  optionsOrDigits:
    | {
      digits?: number; // defaults to decimals
      trailingZeros?: boolean;
    }
    | number = {},
): [whole: bigint, fraction: string | null] {
  const [value, decimals] = dnum;

  // options.digits can also be passed directly as the third argument
  if (typeof optionsOrDigits === "number") {
    optionsOrDigits = { digits: optionsOrDigits };
  }

  const {
    digits = decimals,
    trailingZeros = false,
  } = optionsOrDigits;

  if (decimals === 0) {
    return [value, null];
  }

  const decimalsDivisor = powerOfTen(decimals);

  const whole = value / decimalsDivisor;
  let fraction = String(value % decimalsDivisor).replace(/^\-/, "");

  const zeros = "0".repeat(
    Math.max(0, String(decimalsDivisor).length - fraction.length - 1),
  );

  fraction = zeros + divideAndRound(
    BigInt(fraction),
    powerOfTen(Math.max(0, decimals - digits)),
  );

  if (trailingZeros) {
    fraction = fraction.padEnd(digits, "0");
  }

  return [
    whole,
    fraction === "" || BigInt(fraction) === BigInt(0) ? null : fraction,
  ];
}

export function toNumber(value: Dnum, digits?: number) {
  return Number(toParts(value, { digits }).join("."));
}
