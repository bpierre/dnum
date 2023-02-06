import type { Decimals, Dnum, Numberish, Value } from "./types";

import {
  abs,
  ceilToPower,
  divideAndRound,
  floorToPower,
  powerOfTen,
  roundToPower,
  splitNumber,
} from "./utils";

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
  decimals: number | true = true,
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

  const parts = splitNumber(value);
  const whole = parts[0];
  let fraction = parts[1];

  if (decimals === true) {
    decimals = fraction === "0" ? 0 : fraction.length;
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
  options: { round?: boolean } = {},
): Value {
  options.round ??= true;

  if (decimalsDiff > 0) {
    return value * powerOfTen(decimalsDiff);
  }

  if (decimalsDiff < 0) {
    return options.round
      ? divideAndRound(value, powerOfTen(-decimalsDiff))
      : value / powerOfTen(-decimalsDiff);
  }

  return value;
}

export function setDecimals(
  value: Dnum,
  decimals: Decimals,
  options: { round?: boolean } = {},
): Dnum {
  options.round ??= true;

  if (value[1] === decimals) {
    return value;
  }

  if (value[1] < 0 || decimals < 0) {
    throw new Error("Decimals cannot be negative");
  }

  const decimalsDiff = decimals - value[1];
  return [
    setValueDecimals(value[0], decimalsDiff, options),
    decimals,
  ];
}

export function equalizeDecimals(nums: Dnum[], decimals?: number): Dnum[] {
  const decimals_ = decimals
    ?? Math.max(...nums.map(([, decimals]) => decimals), 0);
  return nums.map(num => setDecimals(num, decimals_));
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
      decimalsRounding?: "ROUND_HALF" | "ROUND_UP" | "ROUND_DOWN";
    }
    | number = {},
): [whole: bigint, fraction: string | null] {
  const [value, decimals] = dnum;

  // options.digits can also be passed directly as the second argument
  const options = typeof optionsOrDigits === "number"
    ? { digits: optionsOrDigits }
    : optionsOrDigits;

  const {
    digits = decimals,
    trailingZeros,
    decimalsRounding,
  } = options;

  if (decimals === 0) {
    return [value, null];
  }

  const decimalsDivisor = powerOfTen(decimals);

  let whole = value / decimalsDivisor;
  const fractionValue = abs(value % decimalsDivisor);

  let roundFn = (
    decimalsRounding === "ROUND_UP"
      ? ceilToPower
      : decimalsRounding === "ROUND_DOWN"
      ? floorToPower
      : roundToPower
  );

  let fraction = String(
    roundFn(
      BigInt(
        // prefix with 1 to keep the leading zeros
        "1"
          // leading zeros
          + "0".repeat(
            Math.max(
              0,
              String(decimalsDivisor).length - String(fractionValue).length - 1,
            ),
          )
          // non zero numbers
          + String(fractionValue),
      ),
      powerOfTen(Math.max(0, decimals - digits)),
    ),
  );

  if (fraction.startsWith("2")) {
    whole += BigInt(1);
  }

  // remove the leading 1 and extra decimal places
  fraction = fraction.slice(1, digits + 1);

  if (trailingZeros) {
    fraction = fraction.padEnd(digits, "0");
  } else {
    fraction = fraction.replace(/0+$/, "");
  }

  return [
    whole,
    fraction === "" || BigInt(fraction) === BigInt(0) ? null : fraction,
  ];
}

export function toNumber(
  value: Dnum,
  optionsOrDigits: Parameters<typeof toParts>[1],
) {
  return Number(toParts(value, optionsOrDigits).join("."));
}
