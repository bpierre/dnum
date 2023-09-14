export function divideAndRound(dividend: bigint, divisor: bigint) {
  const invertSign = dividend < 0n ? -1n : 1n;
  return (dividend * invertSign + divisor / 2n) / divisor * invertSign;
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

export function powerOfTen(zeroes: number) {
  // This is to avoid using the ** operator which
  // doesn’t seem to work for BigInt values on CodeSandbox.
  // See https://github.com/codesandbox/codesandbox-client/issues/6706
  return BigInt("1" + "0".repeat(zeroes));
}

export function roundToPower(value: bigint, power: bigint) {
  const a = (value / power) * power;
  const b = a + power;
  return (value - a >= b - value) ? b : a;
}

export function ceilToPower(value: bigint, power: bigint) {
  return ((value / power) * power) + power;
}

export function floorToPower(value: bigint, power: bigint) {
  return (value / power) * power;
}

export function abs(value: bigint) {
  return value < 0n ? -value : value;
}
