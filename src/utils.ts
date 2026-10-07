import type { Rounding } from "./types";

function divideAndRoundUp(dividend: bigint, divisor: bigint) {
  const num = divisor > 0n ? dividend : -dividend;
  const den = divisor > 0n ? divisor : -divisor;
  const remainder = num % den;
  const roundUp = remainder > 0n ? 1n : 0n;
  return num / den + roundUp;
}

function divideAndRoundDown(dividend: bigint, divisor: bigint) {
  const num = divisor > 0n ? dividend : -dividend;
  const den = divisor > 0n ? divisor : -divisor;
  const remainder = num % den;
  const roundDown = remainder < 0n ? -1n : 0n;
  return num / den + roundDown;
}

function divideAndRoundHalf(dividend: bigint, divisor: bigint) {
  const num = divisor > 0n ? dividend : -dividend;
  const den = divisor > 0n ? divisor : -divisor;
  return num < 0n
    ? -((-num + den / 2n) / den)
    : (num + den / 2n) / den;
}

export function divideAndRound(
  dividend: bigint,
  divisor: bigint,
  rounding: Rounding = "ROUND_HALF",
) {
  return rounding === "ROUND_UP"
    ? divideAndRoundUp(dividend, divisor)
    : rounding === "ROUND_DOWN"
    ? divideAndRoundDown(dividend, divisor)
    : divideAndRoundHalf(dividend, divisor);
}

export function splitNumber(number: string) {
  let [whole, fraction = "0"] = number.split(".");
  if (whole === "") {
    whole = "0";
  }

  // trim trailing zeros
  fraction = fraction.replace(/(?!^)0*$/, "");

  return [whole, fraction];
}

const powersOfTen: bigint[] = [1n];

export function powerOfTen(zeroes: number) {
  const cached = powersOfTen[zeroes];
  if (cached !== undefined) return cached;
  // This is to avoid using the ** operator which
  // doesn’t seem to work for BigInt values on CodeSandbox.
  // See https://github.com/codesandbox/codesandbox-client/issues/6706
  const value = BigInt("1" + "0".repeat(zeroes));
  // Only powers with integer exponents 0–256 are retained in the cache.
  if (Number.isInteger(zeroes) && zeroes >= 0 && zeroes <= 256) {
    powersOfTen[zeroes] = value;
  }
  return value;
}

export function roundToPower(value: bigint, power: bigint) {
  const a = (value / power) * power;
  const b = a + power;
  return (value - a >= b - value) ? b : a;
}

export function ceilToPower(value: bigint, power: bigint) {
  const remainder = value % power;
  return remainder === 0n ? value : ((value / power) * power) + power;
}

export function floorToPower(value: bigint, power: bigint) {
  return (value / power) * power;
}

export function abs(value: bigint) {
  return value < 0n ? -value : value;
}
